
import { useState } from 'react';
import { getVoiceName } from '@/utils/voiceMapping';

interface TTSResponse {
  success: boolean;
  audioContent?: string;
  error?: string;
  voiceUsed?: string;
  languageCode?: string;
}

export const useTextToSpeechService = () => {
  const [isLoading, setIsLoading] = useState(false);

  const textToSpeech = async (text: string, languageCode: string = 'en-US'): Promise<TTSResponse> => {
    setIsLoading(true);
    
    try {
      console.log('🔊 Sending text to Google Text-to-Speech API...');
      
      // Get API key from secure storage and decode it
      const encodedApiKey = localStorage.getItem('google_cloud_api_key');
      if (!encodedApiKey) {
        throw new Error('Google Cloud API key not found. Please configure it in Settings tab.');
      }
      
      const apiKey = atob(encodedApiKey);

      if (!text || text.trim().length === 0) {
        throw new Error('Text content is required');
      }

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

      const selectedVoice = voiceMap[languageCode] || 'en-US-Studio-O';
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

      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

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

      return {
        audioContent: data.audioContent,
        success: true,
        voiceUsed: selectedVoice,
        languageCode: languageCode
      };
    } catch (error) {
      console.error('Text-to-Speech error:', error);
      return { 
        success: false, 
        error: error.message || 'Text-to-speech failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    textToSpeech,
    isLoading
  };
};
