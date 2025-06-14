
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Enhanced input validation
const validateInput = (input: string, fieldName: string): string => {
  if (!input || typeof input !== 'string') {
    throw new Error(`Invalid ${fieldName} provided`);
  }
  return input.replace(/['"\\;]/g, '').trim(); // Basic sanitization
};

const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

serve(async (req) => {
  // Enhanced CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const appointmentData = await req.json();

    // Enhanced input validation
    if (!appointmentData.patientName || !appointmentData.phoneNumber) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: patientName and phoneNumber'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate phone number format
    if (!validatePhoneNumber(appointmentData.phoneNumber)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid phone number format'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get environment variables securely
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({
        success: false,
        error: 'Server configuration error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Sanitize and validate inputs
    const sanitizedData = {
      patientName: validateInput(appointmentData.patientName, 'patient name'),
      phoneNumber: appointmentData.phoneNumber.replace(/[^\d\+]/g, ''), // Keep only digits and +
      department: appointmentData.department ? validateInput(appointmentData.department, 'department') : null,
      doctorName: appointmentData.doctorName ? validateInput(appointmentData.doctorName, 'doctor name') : null,
      appointmentDate: appointmentData.appointmentDate,
      appointmentTime: appointmentData.appointmentTime,
      status: appointmentData.status || 'confirmed'
    };

    // Find the doctor by name and department with enhanced security
    let doctorId = null;
    if (sanitizedData.doctorName && sanitizedData.department) {
      const { data: doctors } = await supabase
        .from('doctors')
        .select(`
          id,
          departments!inner(name)
        `)
        .ilike('name', `%${sanitizedData.doctorName}%`)
        .ilike('departments.name', `%${sanitizedData.department}%`)
        .limit(1);

      if (doctors && doctors.length > 0) {
        doctorId = doctors[0].id;
      }
    }

    // Enhanced appointment time validation
    let appointmentTime = null;
    if (sanitizedData.appointmentDate && sanitizedData.appointmentTime) {
      try {
        appointmentTime = new Date(`${sanitizedData.appointmentDate} ${sanitizedData.appointmentTime}`).toISOString();
      } catch (error) {
        console.error('Invalid date/time format:', error);
        return new Response(JSON.stringify({
          success: false,
          error: 'Invalid date or time format'
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Insert appointment with enhanced error handling
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        doctor_id: doctorId,
        patient_name: sanitizedData.patientName,
        patient_phone: sanitizedData.phoneNumber,
        appointment_time: appointmentTime,
        status: sanitizedData.status
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to store appointment'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Appointment stored successfully:', data.id);

    return new Response(JSON.stringify({
      success: true,
      appointmentId: data.id,
      message: 'Appointment stored successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error storing appointment:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal server error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
