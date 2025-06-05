
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioData, languageCode = 'en-US' } = await req.json();
    const googleApiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');

    if (!googleApiKey) {
      throw new Error('Google Cloud API key not configured');
    }

    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: languageCode,
          alternativeLanguageCodes: ['hi-IN', 'ml-IN', 'ta-IN', 'en-US'],
          enableAutomaticPunctuation: true,
          model: 'latest_long',
          useEnhanced: true
        },
        audio: {
          content: audioData
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Speech recognition failed');
    }

    const transcript = data.results?.[0]?.alternatives?.[0]?.transcript || '';
    const confidence = data.results?.[0]?.alternatives?.[0]?.confidence || 0;
    const detectedLanguage = data.results?.[0]?.languageCode || languageCode;

    return new Response(JSON.stringify({
      transcript,
      confidence,
      detectedLanguage,
      success: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Speech-to-Text error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
