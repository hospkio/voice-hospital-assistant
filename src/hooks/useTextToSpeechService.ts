
import { useState } from 'react';
import { getVoiceName } from '@/utils/voiceMapping';

interface TTSResponse {
  success: boolean;
  audioContent?: string;
  error?: string;
}

export const useTextToSpeechService = () => {
  const [isLoading, setIsLoading] = useState(false);

  const textToSpeech = async (text: string, languageCode: string = 'en-US'): Promise<TTSResponse> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/functions/v1/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          languageCode,
          voiceName: getVoiceName(languageCode)
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Text to speech error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    textToSpeech,
    isLoading
  };
};
