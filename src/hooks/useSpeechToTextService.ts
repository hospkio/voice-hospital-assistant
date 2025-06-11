
import { useState } from 'react';

export const useSpeechToTextService = () => {
  const [isLoading, setIsLoading] = useState(false);

  const speechToText = async (audioBlob: Blob, languageCode: string = 'en-US') => {
    setIsLoading(true);
    
    try {
      console.log('🎵 Sending audio to speech-to-text service...');
      
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('languageCode', languageCode);

      const response = await fetch('/functions/v1/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Speech-to-text API failed with status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text);
        throw new Error('Speech-to-text service returned invalid response');
      }

      const result = await response.json();
      console.log('✅ Speech-to-text result:', result);
      
      if (result.success) {
        return {
          transcript: result.transcript,
          confidence: result.confidence || 0.8,
          detectedLanguage: result.detectedLanguage || languageCode
        };
      } else {
        throw new Error(result.error || 'Speech to text failed');
      }
    } catch (error) {
      console.error('❌ Speech to text error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    speechToText,
    isLoading
  };
};
