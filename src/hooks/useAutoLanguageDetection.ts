
import { useState, useRef } from 'react';
import { useGoogleCloudServices } from './useGoogleCloudServices';

interface LanguageDetectionResult {
  detectedLanguage: string;
  confidence: number;
  transcript: string;
}

export const useAutoLanguageDetection = () => {
  const [isListening, setIsListening] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState('en-US');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { speechToText } = useGoogleCloudServices();

  const startListening = async (): Promise<LanguageDetectionResult | null> => {
    if (isListening) return null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        } 
      });

      chunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      setIsListening(true);

      return new Promise((resolve, reject) => {
        if (!mediaRecorderRef.current) {
          reject(new Error('MediaRecorder not initialized'));
          return;
        }

        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
          
          try {
            // Try with multi-language detection
            const result = await speechToText(audioBlob, 'auto');
            
            if (result.transcript) {
              const languageResult = {
                detectedLanguage: result.detectedLanguage || 'en-US',
                confidence: result.confidence || 0,
                transcript: result.transcript
              };
              
              setDetectedLanguage(languageResult.detectedLanguage);
              resolve(languageResult);
            } else {
              reject(new Error('No speech detected'));
            }
          } catch (error) {
            reject(error);
          } finally {
            stream.getTracks().forEach(track => track.stop());
            setIsListening(false);
          }
        };

        mediaRecorderRef.current.start();

        // Auto-stop after 5 seconds for language detection
        setTimeout(() => {
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }, 5000);
      });

    } catch (error) {
      setIsListening(false);
      throw error;
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  return {
    startListening,
    stopListening,
    isListening,
    detectedLanguage
  };
};
