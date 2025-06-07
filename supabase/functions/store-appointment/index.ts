
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const appointmentData = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the doctor by name and department
    let doctorId = null;
    if (appointmentData.doctorName && appointmentData.department) {
      const { data: doctors } = await supabase
        .from('doctors')
        .select(`
          id,
          departments!inner(name)
        `)
        .ilike('name', `%${appointmentData.doctorName}%`)
        .ilike('departments.name', `%${appointmentData.department}%`)
        .limit(1);

      if (doctors && doctors.length > 0) {
        doctorId = doctors[0].id;
      }
    }

    // Insert appointment
    const { data, error } = await supabase
      .from('appointments')
      .insert({
        doctor_id: doctorId,
        patient_name: appointmentData.patientName,
        patient_phone: appointmentData.phoneNumber,
        appointment_time: appointmentData.appointmentDate && appointmentData.appointmentTime ? 
          new Date(`${appointmentData.appointmentDate} ${appointmentData.appointmentTime}`).toISOString() : 
          null,
        status: appointmentData.status || 'confirmed'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to store appointment: ${error.message}`);
    }

    console.log('Appointment stored successfully:', data);

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
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
