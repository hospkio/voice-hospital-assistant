
import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioLevel: number;
  isProcessing: boolean;
  processingTime: number;
  transcript: string;
  confidence: number;
  detectedLanguage: string;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetTranscript: () => void;
}

export const useAudioRecorder = (
  speechToText: (audioBlob: Blob, languageCode: string) => Promise<any>
) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('en-US');
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const monitorAudioLevels = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const checkLevel = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      const level = Math.max(...dataArray) / 255;
      setAudioLevel(level);
      
      // Reset silence timer if there's audio
      if (level > 0.01) {
        resetSilenceTimer();
      }
      
      if (isRecording) {
        animationRef.current = requestAnimationFrame(checkLevel);
      }
    };
    
    checkLevel();
  }, [isRecording]);

  const resetSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    silenceTimerRef.current = setTimeout(() => {
      console.log('🔇 Silence detected, stopping recording...');
      stopRecording();
    }, 3000); // 3 seconds of silence
  }, []);

  const processAudio = useCallback(async (audioBlob: Blob) => {
    console.log('🔄 Processing audio...');
    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      const result = await speechToText(audioBlob, detectedLanguage);
      
      if (result.transcript) {
        setTranscript(result.transcript);
        setDetectedLanguage(result.detectedLanguage || detectedLanguage);
        setConfidence(result.confidence);
        console.log('✅ Transcription successful:', result.transcript);
      }
    } catch (error) {
      console.error('❌ Error processing audio:', error);
      setTranscript('Error processing audio');
    } finally {
      setIsProcessing(false);
      setProcessingTime(Date.now() - startTime);
    }
  }, [speechToText, detectedLanguage]);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Starting recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      
      // Start recording
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start monitoring audio levels and silence
      monitorAudioLevels();
      resetSilenceTimer();
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [monitorAudioLevels, resetSilenceTimer, processAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [isRecording]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
    setProcessingTime(0);
    setDetectedLanguage('en-US');
  }, []);

  return {
    isRecording,
    audioLevel,
    isProcessing,
    processingTime,
    transcript,
    confidence,
    detectedLanguage,
    startRecording,
    stopRecording,
    resetTranscript
  };
};
