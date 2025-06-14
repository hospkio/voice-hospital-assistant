
import { useState } from 'react';
import { credentialsManager } from '@/utils/credentialsManager';

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
      
      const credentials = credentialsManager.getCredentials();
      const apiKey = credentials.googleCloudApiKey || credentials.apiKey;
      if (!apiKey) {
        throw new Error('Google Cloud API key not found. Please configure it in Settings tab.');
      }

      if (!text || text.trim().length === 0) {
        throw new Error('Text content is required');
      }

      // Enhanced voice mapping with MALE/FEMALE genders (no NEUTRAL)
      const voiceMap: { [key: string]: { name: string; gender: 'MALE' | 'FEMALE' } } = {
        'en-US': { name: 'en-US-Studio-M', gender: 'MALE' },
        'hi-IN': { name: 'hi-IN-Standard-A', gender: 'FEMALE' },
        'ml-IN': { name: 'ml-IN-Standard-A', gender: 'FEMALE' },
        'ta-IN': { name: 'ta-IN-Standard-A', gender: 'FEMALE' },
        'te-IN': { name: 'te-IN-Standard-A', gender: 'FEMALE' },
        'kn-IN': { name: 'kn-IN-Standard-A', gender: 'FEMALE' },
        'mr-IN': { name: 'mr-IN-Standard-A', gender: 'FEMALE' }
      };

      const selectedVoice = voiceMap[languageCode] || voiceMap['en-US'];
      console.log('Selected voice:', selectedVoice);

      const requestBody = {
        input: { text: text.substring(0, 5000) },
        voice: {
          languageCode,
          name: selectedVoice.name,
          ssmlGender: selectedVoice.gender
        },
        audioConfig: {
          audioEncoding: 'MP3',
          speakingRate: 0.9,
          pitch: 0.0,
          volumeGainDb: 2.0,
          effectsProfileId: ['handset-class-device']
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
      console.log('✅ TTS response received successfully');
      
      if (!data.audioContent) {
        throw new Error('No audio content received from Google TTS');
      }

      return {
        audioContent: data.audioContent,
        success: true,
        voiceUsed: selectedVoice.name,
        languageCode: languageCode
      };
    } catch (error) {
      console.error('❌ Text-to-Speech error:', error);
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
