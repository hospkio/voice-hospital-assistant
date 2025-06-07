
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DialogflowCXRequest {
  query: string;
  sessionId: string;
  languageCode: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { query, sessionId, languageCode = 'en-US' }: DialogflowCXRequest = await req.json();

    const projectId = Deno.env.get('DIALOGFLOW_CX_PROJECT_ID');
    const location = Deno.env.get('DIALOGFLOW_CX_LOCATION');
    const agentId = Deno.env.get('DIALOGFLOW_CX_AGENT_ID');
    const apiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');

    if (!projectId || !location || !agentId || !apiKey) {
      throw new Error('Missing Dialogflow CX configuration');
    }

    const sessionPath = `projects/${projectId}/locations/${location}/agents/${agentId}/sessions/${sessionId}`;
    
    const requestBody = {
      queryInput: {
        text: {
          text: query,
        },
        languageCode: languageCode,
      },
      queryParams: {
        timeZone: 'Asia/Kolkata',
      },
    };

    console.log('Sending to Dialogflow CX:', { sessionPath, query, languageCode });

    const response = await fetch(
      `https://dialogflow.googleapis.com/v3/${sessionPath}:detectIntent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dialogflow CX API error:', errorText);
      throw new Error(`Dialogflow CX API error: ${response.status}`);
    }

    const result = await response.json();
    console.log('Dialogflow CX response:', result);

    const queryResult = result.queryResult || {};
    const responseMessages = queryResult.responseMessages || [];
    
    let responseText = 'I apologize, but I could not process your request.';
    if (responseMessages.length > 0 && responseMessages[0].text) {
      responseText = responseMessages[0].text.text[0] || responseText;
    }

    const intentName = queryResult.intent?.displayName || 'unknown';
    const confidence = queryResult.intentDetectionConfidence || 0;
    const parameters = queryResult.parameters || {};

    return new Response(JSON.stringify({
      responseText,
      intent: intentName,
      entities: parameters,
      confidence,
      responseTime: Date.now(),
      responseData: {
        type: 'dialogflow-cx',
        sessionInfo: queryResult.sessionInfo,
        parameters: parameters
      },
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Dialogflow CX function:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      responseText: "I'm sorry, I'm having trouble understanding. Could you please try again?",
      intent: 'error',
      confidence: 0,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
