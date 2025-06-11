
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSpeechToTextService = () => {
  const [isLoading, setIsLoading] = useState(false);

  const speechToText = async (audioBlob: Blob, languageCode: string = 'en-US') => {
    setIsLoading(true);
    
    try {
      console.log('🎵 Sending audio to speech-to-text service...');
      
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('languageCode', languageCode);

      // Use Supabase client to invoke the edge function
      const { data, error } = await supabase.functions.invoke('speech-to-text', {
        body: formData,
      });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`Speech-to-text API failed: ${error.message}`);
      }

      console.log('✅ Speech-to-text result:', data);
      
      if (data && data.success) {
        return {
          transcript: data.transcript,
          confidence: data.confidence || 0.8,
          detectedLanguage: data.detectedLanguage || languageCode
        };
      } else {
        throw new Error(data?.error || 'Speech to text failed');
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
