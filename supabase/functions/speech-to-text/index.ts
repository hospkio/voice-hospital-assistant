
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
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

    console.log('Processing audio file, size:', audioFile.size, 'language:', languageCode);

    // Convert audio file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    // Enhanced configuration for better language detection
    const config = languageCode === 'auto' ? {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      alternativeLanguageCodes: ['hi-IN', 'ml-IN', 'ta-IN', 'te-IN', 'kn-IN', 'mr-IN'],
      enableAutomaticPunctuation: true,
      model: 'latest_long',
      useEnhanced: true,
      enableWordTimeOffsets: false,
      enableWordConfidence: true,
      maxAlternatives: 3
    } : {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: languageCode,
      enableAutomaticPunctuation: true,
      model: 'latest_long',
      useEnhanced: true,
      enableWordConfidence: true
    };

    console.log('Sending to Google Speech API with config:', config);

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Speech API error:', errorText);
      throw new Error(`Speech API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Google Speech API response:', data);

    const result = data.results?.[0];
    const transcript = result?.alternatives?.[0]?.transcript || '';
    const confidence = result?.alternatives?.[0]?.confidence || 0;
    
    // Enhanced language detection
    let detectedLanguage = languageCode;
    if (languageCode === 'auto' && result?.languageCode) {
      detectedLanguage = result.languageCode;
    }

    // If no language detected from API, try to detect from content
    if (detectedLanguage === 'auto' || detectedLanguage === 'en-US') {
      if (transcript) {
        // Simple pattern matching for Indian languages
        const tamilPattern = /[\u0B80-\u0BFF]/;
        const hindiPattern = /[\u0900-\u097F]/;
        const malayalamPattern = /[\u0D00-\u0D7F]/;
        const teluguPattern = /[\u0C00-\u0C7F]/;
        
        if (tamilPattern.test(transcript)) {
          detectedLanguage = 'ta-IN';
        } else if (hindiPattern.test(transcript)) {
          detectedLanguage = 'hi-IN';
        } else if (malayalamPattern.test(transcript)) {
          detectedLanguage = 'ml-IN';
        } else if (teluguPattern.test(transcript)) {
          detectedLanguage = 'te-IN';
        }
      }
    }

    console.log('Final result:', { transcript, confidence, detectedLanguage });

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
      transcript: '',
      confidence: 0,
      detectedLanguage: 'en-US',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
