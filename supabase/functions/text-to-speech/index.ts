
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
    const { text, languageCode = 'en-US', voiceName } = await req.json();
    const googleApiKey = Deno.env.get('GOOGLE_CLOUD_API_KEY');

    if (!googleApiKey) {
      throw new Error('Google Cloud API key not configured');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('Text content is required');
    }

    console.log('TTS Request:', { languageCode, textLength: text.length });

    // Enhanced voice mapping with better quality voices
    const voiceMap: { [key: string]: string } = {
      'en-US': 'en-US-Studio-O',      // High quality neural voice
      'hi-IN': 'hi-IN-Standard-A',    // Standard quality
      'ml-IN': 'ml-IN-Standard-A',    // Standard quality  
      'ta-IN': 'ta-IN-Standard-A',    // Standard quality
      'te-IN': 'te-IN-Standard-A',    // Standard quality
      'kn-IN': 'kn-IN-Standard-A',    // Standard quality
      'mr-IN': 'mr-IN-Standard-A'     // Standard quality
    };

    const selectedVoice = voiceName || voiceMap[languageCode] || 'en-US-Studio-O';
    console.log('Selected voice:', selectedVoice);

    const requestBody = {
      input: { text: text.substring(0, 5000) }, // Limit text length for performance
      voice: {
        languageCode,
        name: selectedVoice,
        ssmlGender: 'NEUTRAL'
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9,  // Slightly slower for clarity
        pitch: 0.0,
        volumeGainDb: 2.0,  // Slightly louder
        effectsProfileId: ['handset-class-device'] // Optimize for mobile devices
      }
    };

    console.log('Sending TTS request to Google Cloud...');

    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${googleApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google TTS API error:', errorData);
      throw new Error(errorData.error?.message || `TTS API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('TTS response received successfully');
    
    if (!data.audioContent) {
      throw new Error('No audio content received from Google TTS');
    }

    return new Response(JSON.stringify({
      audioContent: data.audioContent,
      success: true,
      voiceUsed: selectedVoice,
      languageCode: languageCode
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Text-to-Speech error:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false,
      audioContent: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
