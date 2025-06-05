
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SpeechToTextResult {
  transcript: string;
  confidence: number;
  detectedLanguage: string;
  success: boolean;
}

export interface TextToSpeechResult {
  audioContent: string;
  success: boolean;
}

export interface DialogflowResult {
  responseText: string;
  intent: string;
  entities: any;
  confidence: number;
  responseTime: number;
  responseData: any;
  success: boolean;
}

export const useGoogleCloudServices = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const speechToText = async (audioBlob: Blob, languageCode: string = 'en-US'): Promise<SpeechToTextResult> => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const audioData = await new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data URL prefix
        };
        reader.readAsDataURL(audioBlob);
      });

      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: { audioData, languageCode }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Speech-to-text error:', error);
      return { transcript: '', confidence: 0, detectedLanguage: languageCode, success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  const textToSpeech = async (text: string, languageCode: string = 'en-US'): Promise<TextToSpeechResult> => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, languageCode }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Text-to-speech error:', error);
      return { audioContent: '', success: false };
    }
  };

  const processWithDialogflow = async (
    query: string, 
    sessionId: string, 
    languageCode: string = 'en-US'
  ): Promise<DialogflowResult> => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('dialogflow-process', {
        body: { query, sessionId, languageCode }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Dialogflow processing error:', error);
      return {
        responseText: 'I encountered an error processing your request. Please try again.',
        intent: 'error',
        entities: {},
        confidence: 0,
        responseTime: 0,
        responseData: {},
        success: false
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = async (audioContent: string) => {
    try {
      const audioBlob = new Blob([Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = reject;
        audio.play();
      });
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  return {
    speechToText,
    textToSpeech,
    processWithDialogflow,
    playAudio,
    isProcessing
  };
};
