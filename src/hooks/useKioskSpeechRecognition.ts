
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

interface UseKioskSpeechRecognitionProps {
  isListening: boolean;
  language: string;
  onResult: (transcript: string, confidence: number, detectedLanguage: string) => void;
  onListeningChange: (isListening: boolean) => void;
}

export const useKioskSpeechRecognition = ({ isListening, language, onResult, onListeningChange }: UseKioskSpeechRecognitionProps) => {
  const recognitionRef = useRef<any>(null);

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.onstart = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  };

  const initializeSpeechRecognition = (lang: string) => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = lang;

      recognitionRef.current.onstart = () => console.log('⏺️ Speech recognition started');
      recognitionRef.current.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        toast.error(`Speech recognition error: ${event.error}`);
      };
      recognitionRef.current.onend = () => {
        console.log('⏹️ Speech recognition ended');
        if (isListening && recognitionRef.current) {
          console.log('🔄 Restarting speech recognition...');
          recognitionRef.current.start();
        }
      };
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        const confidence = event.results[event.results.length - 1][0].confidence;
        console.log('👂 Interim transcript:', transcript, 'Confidence:', confidence);
        onResult(transcript, confidence, language);
      };
      recognitionRef.current.start();
    } else {
      console.warn('Speech recognition not supported in this browser.');
      toast.error('Speech recognition not supported in this browser.');
      onListeningChange(false);
    }
  };

  useEffect(() => {
    if (isListening) {
      initializeSpeechRecognition(language);
    } else {
      stopSpeechRecognition();
    }
    return () => stopSpeechRecognition();
  }, [isListening]);

  useEffect(() => {
    if (recognitionRef.current) {
      console.log('🌐 Updating speech recognition language to:', language);
      recognitionRef.current.lang = language;
    }
  }, [language]);
};
