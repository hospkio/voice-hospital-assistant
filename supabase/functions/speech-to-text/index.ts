
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
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const languageCode = formData.get('languageCode') as string || 'auto';

    if (!audioFile) {
      throw new Error('No audio file provided');
    }

    const googleApiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');
    if (!googleApiKey) {
      throw new Error('Google Cloud API key not configured');
    }

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Configure for automatic language detection or specific language
    const config = languageCode === 'auto' ? {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      alternativeLanguageCodes: ['hi-IN', 'ml-IN', 'ta-IN', 'en-US'],
      enableAutomaticPunctuation: true,
      model: 'latest_long',
      useEnhanced: true,
      enableLanguageDetection: true
    } : {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: languageCode,
      enableAutomaticPunctuation: true,
      model: 'latest_long',
      useEnhanced: true
    };

    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config,
        audio: {
          content: base64Audio
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Speech recognition failed');
    }

    const result = data.results?.[0];
    const transcript = result?.alternatives?.[0]?.transcript || '';
    const confidence = result?.alternatives?.[0]?.confidence || 0;
    
    // Detect language from the result
    let detectedLanguage = languageCode;
    if (languageCode === 'auto' && result?.languageCode) {
      detectedLanguage = result.languageCode;
    } else if (data.results?.[0]?.alternatives?.[0]?.words?.[0]?.speakerTag) {
      // Fallback language detection based on confidence scores
      const alternatives = data.results?.[0]?.alternatives || [];
      const languageConfidences = alternatives.reduce((acc: any, alt: any) => {
        if (alt.languageCode && alt.confidence) {
          acc[alt.languageCode] = Math.max(acc[alt.languageCode] || 0, alt.confidence);
        }
        return acc;
      }, {});
      
      if (Object.keys(languageConfidences).length > 0) {
        detectedLanguage = Object.keys(languageConfidences).reduce((a, b) => 
          languageConfidences[a] > languageConfidences[b] ? a : b
        );
      }
    }

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
