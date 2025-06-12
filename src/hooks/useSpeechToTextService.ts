
import { useState } from 'react';
import { credentialsManager } from '@/utils/credentialsManager';

interface STTResponse {
  transcript: string;
  confidence: number;
  detectedLanguage: string;
  success: boolean;
}

export const useSpeechToTextService = () => {
  const [isLoading, setIsLoading] = useState(false);

  const speechToText = async (audioBlob: Blob, languageCode: string = 'en-US'): Promise<STTResponse> => {
    setIsLoading(true);
    
    try {
      console.log('🎵 Sending audio to Google Speech-to-Text API...');
      
      const credentials = credentialsManager.getCredentials();
      if (!credentials.apiKey) {
        throw new Error('Google Cloud API key not found. Please configure it in Settings tab.');
      }

      // Convert audioBlob to base64
      const reader = new FileReader();
      const audioBase64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(audioBlob);
      });

      const requestBody = {
        audio: {
          content: audioBase64,
        },
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: languageCode === 'auto' ? 'en-US' : languageCode,
          alternativeLanguageCodes: languageCode === 'auto' ? ['hi-IN', 'ml-IN', 'ta-IN', 'te-IN', 'kn-IN', 'mr-IN'] : [],
          enableAutomaticPunctuation: true,
          model: 'latest_long',
          useEnhanced: true,
          enableWordConfidence: true,
          maxAlternatives: 3
        },
      };

      console.log('Sending request to Google Speech-to-Text API...');

      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${credentials.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Google STT API error:', errorData);
        throw new Error(errorData.error?.message || `STT API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Google Speech-to-Text result:', data);
      
      if (data && data.results && data.results.length > 0) {
        const result = data.results[0];
        const transcript = result.alternatives[0].transcript;
        const confidence = result.alternatives[0].confidence || 0.8;
        
        let detectedLanguage = languageCode;
        if (languageCode === 'auto' && result.languageCode) {
          detectedLanguage = result.languageCode;
        }

        return {
          transcript,
          confidence,
          detectedLanguage,
          success: true
        };
      } else {
        throw new Error('No speech detected in audio');
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
