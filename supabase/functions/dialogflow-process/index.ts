
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, sessionId, languageCode = 'en-US' } = await req.json();
    const googleApiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
    const projectId = Deno.env.get('GOOGLE_CLOUD_PROJECT_ID');
    
    if (!googleApiKey || !projectId) {
      throw new Error('Google Cloud credentials not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // For MVP, we'll implement a rule-based NLP system that mimics Dialogflow
    const response = await processWithRuleBasedNLP(query, sessionId, languageCode, supabase);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Dialogflow processing error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processWithRuleBasedNLP(query: string, sessionId: string, languageCode: string, supabase: any) {
  const lowerQuery = query.toLowerCase();
  const startTime = Date.now();
  
  // Intent recognition patterns
  const intents = {
    'navigation.department': {
      patterns: ['where is', 'how to get to', 'direction to', 'find', 'locate'],
      departments: ['cardiology', 'emergency', 'er', 'pharmacy', 'orthopedics', 'neurology', 'pediatrics', 'radiology', 'laboratory', 'lab']
    },
    'appointment.book': {
      patterns: ['book appointment', 'schedule appointment', 'make appointment', 'see doctor', 'appointment with']
    },
    'appointment.check': {
      patterns: ['check appointment', 'my appointment', 'appointment status']
    },
    'information.general': {
      patterns: ['visiting hours', 'contact', 'phone', 'hours', 'cafeteria', 'parking']
    },
    'help.assistance': {
      patterns: ['help', 'what can you do', 'assistance', 'support']
    }
  };

  let detectedIntent = 'help.assistance';
  let entities: any = {};
  let confidence = 0.5;

  // Intent detection
  for (const [intent, config] of Object.entries(intents)) {
    if (config.patterns.some(pattern => lowerQuery.includes(pattern))) {
      detectedIntent = intent;
      confidence = 0.9;
      break;
    }
  }

  // Entity extraction for navigation
  if (detectedIntent === 'navigation.department') {
    const departments = intents['navigation.department'].departments;
    const foundDept = departments.find(dept => lowerQuery.includes(dept));
    if (foundDept) {
      entities.department = foundDept === 'er' ? 'emergency' : foundDept;
    }
  }

  // Generate response based on intent
  let responseText = '';
  let responseData: any = {};

  switch (detectedIntent) {
    case 'navigation.department':
      if (entities.department) {
        const { data: department } = await supabase
          .from('departments')
          .select('*')
          .ilike('name', `%${entities.department}%`)
          .single();

        if (department) {
          responseText = `${department.name} is located on Floor ${department.floor}, Room ${department.room_number}. ${department.description}`;
          responseData = {
            type: 'navigation',
            department: department.name,
            floor: department.floor,
            room: department.room_number,
            description: department.description
          };
        } else {
          responseText = `I couldn't find information about ${entities.department}. Please check the department name or ask for help.`;
        }
      } else {
        responseText = "I can help you find departments. Try asking 'Where is cardiology?' or 'How to get to emergency room?'";
      }
      break;

    case 'appointment.book':
      responseText = "I can help you book an appointment. Which department would you like to visit? We have Cardiology, Neurology, Orthopedics, and Pediatrics available.";
      responseData = { type: 'appointment_booking', step: 'department_selection' };
      break;

    case 'information.general':
      if (lowerQuery.includes('visiting hours')) {
        responseText = "Visiting hours are from 10:00 AM to 8:00 PM daily. Emergency department allows visitors 24/7.";
      } else if (lowerQuery.includes('cafeteria')) {
        responseText = "The cafeteria is on the 2nd floor, Room 205. It's open from 7:00 AM to 9:00 PM.";
      } else {
        responseText = "For general information, contact us at +91-800-HOSPITAL or visit our information desk on the ground floor.";
      }
      responseData = { type: 'information' };
      break;

    default:
      responseText = "I can help you with directions, appointments, or general information. Try asking 'Where is cardiology?' or 'Book an appointment'.";
      responseData = { type: 'help' };
  }

  const responseTime = Date.now() - startTime;

  // Store interaction in database
  await supabase.from('kiosk_interactions').insert({
    session_id: sessionId,
    user_query: query,
    system_response: responseText,
    intent_recognized: detectedIntent,
    entities,
    language_detected: languageCode,
    confidence_score: confidence,
    response_time_ms: responseTime
  });

  return {
    responseText,
    intent: detectedIntent,
    entities,
    confidence,
    responseTime,
    responseData,
    success: true
  };
}
