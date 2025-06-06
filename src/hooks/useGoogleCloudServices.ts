
import { useState } from 'react';

interface DialogflowResponse {
  responseText: string;
  intent: string;
  entities: any;
  confidence: number;
  responseTime: number;
  responseData: any;
  success: boolean;
}

interface TTSResponse {
  success: boolean;
  audioContent?: string;
  error?: string;
}

export const useGoogleCloudServices = () => {
  const [isLoading, setIsLoading] = useState(false);

  const processWithDialogflow = async (
    query: string, 
    sessionId: string, 
    languageCode: string = 'en-US'
  ): Promise<DialogflowResponse> => {
    setIsLoading(true);
    
    try {
      console.log('Sending to enhanced Dialogflow:', { query, sessionId, languageCode });
      
      const response = await fetch('/functions/v1/enhanced-dialogflow-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          sessionId,
          languageCode
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Enhanced Dialogflow response:', result);
      
      return result;
    } catch (error) {
      console.error('Error processing with enhanced Dialogflow:', error);
      
      // Fallback to local processing if the edge function fails
      return fallbackLocalProcessing(query, sessionId, languageCode);
    } finally {
      setIsLoading(false);
    }
  };

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

  const playAudio = async (audioContent: string): Promise<void> => {
    try {
      // Convert base64 audio to blob
      const audioData = atob(audioContent);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.play();
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  };

  return {
    processWithDialogflow,
    speechToText,
    textToSpeech,
    playAudio,
    isLoading
  };
};

// Fallback local processing for when the edge function is unavailable
function fallbackLocalProcessing(query: string, sessionId: string, languageCode: string): DialogflowResponse {
  const normalizedQuery = query.toLowerCase();
  
  // Simple local intent classification
  let intent = 'unknown';
  let responseText = "I'm sorry, I'm having trouble connecting to our servers. Please try again.";
  let confidence = 0.3;
  
  if (normalizedQuery.includes('cardiology')) {
    intent = 'navigation.department';
    responseText = "The Cardiology department is located on the 3rd floor, Room 301-315. They specialize in heart and cardiovascular diseases treatment.";
    confidence = 0.7;
  } else if (normalizedQuery.includes('emergency')) {
    intent = 'navigation.department';
    responseText = "The Emergency department is on the 1st floor, Room 101-120. Emergency care is available 24/7.";
    confidence = 0.8;
  } else if (normalizedQuery.includes('appointment')) {
    intent = 'appointment.book';
    responseText = "I can help you book an appointment. Which department would you like to visit?";
    confidence = 0.6;
  }
  
  return {
    responseText,
    intent,
    entities: {},
    confidence,
    responseTime: 50,
    responseData: { type: 'fallback' },
    success: true
  };
}

function getVoiceName(languageCode: string): string {
  const voiceMap = {
    'en-US': 'en-US-Wavenet-D',
    'ta-IN': 'ta-IN-Wavenet-A',
    'ml-IN': 'ml-IN-Wavenet-A'
  };
  
  return voiceMap[languageCode] || voiceMap['en-US'];
}
