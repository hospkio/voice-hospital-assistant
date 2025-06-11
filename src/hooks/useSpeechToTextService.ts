import axios from 'axios';
import { useState } from 'react';

export const useSpeechToTextService = () => {
  const [isLoading, setIsLoading] = useState(false);

  const speechToText = async (audioBlob: Blob, languageCode: string = 'en-US') => {
    setIsLoading(true);
    
    try {
      console.log('🎵 Sending audio to Google Speech-to-Text service...');
      
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('languageCode', languageCode);

      // Convert audioBlob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      const audioBase64 = await new Promise((resolve) => {
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
      });

      // Prepare the request payload for Google STT
      const requestBody = {
        audio: {
          content: audioBase64,
        },
        config: {
          encoding: 'LINEAR16', // Adjust based on your audio format
          sampleRateHertz: 16000, // Adjust based on your audio sample rate
          languageCode: languageCode,
        },
      };

      // Make a request to Google Speech-to-Text API
      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=25b452d340469ccca367b4e6dfcf7beded7c8be6`, // Replace with your API key
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('✅ Google Speech-to-Text result:', response.data);
      
      if (response.data && response.data.results.length > 0) {
        const transcript = response.data.results.map(result => result.alternatives[0].transcript).join('\n');
        return {
          transcript,
          confidence: response.data.results[0].alternatives[0].confidence || 0.8,
          detectedLanguage: languageCode
        };
      } else {
        throw new Error('Speech to text failed: No results returned');
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
