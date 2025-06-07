
import { useState } from 'react';

export const useSpeechToTextService = () => {
  const [isLoading, setIsLoading] = useState(false);

  const speechToText = async (audioBlob: Blob, languageCode: string = 'en-US') => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('languageCode', languageCode);

      const response = await fetch('/functions/v1/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          transcript: result.transcript,
          confidence: result.confidence,
          detectedLanguage: result.detectedLanguage || languageCode
        };
      } else {
        throw new Error(result.error || 'Speech to text failed');
      }
    } catch (error) {
      console.error('Speech to text error:', error);
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
