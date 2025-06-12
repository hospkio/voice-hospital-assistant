
import React, { useState, useRef, useEffect } from 'react';
import { useSpeechToTextService } from '@/hooks/useSpeechToTextService';
import VoiceControlButton from '@/components/voice/VoiceControlButton';
import VoiceStatusDisplay from '@/components/voice/VoiceStatusDisplay';
import AudioLevelVisualizer from '@/components/voice/AudioLevelVisualizer';
import TranscriptDisplay from '@/components/voice/TranscriptDisplay';
import VoiceInstructions from '@/components/voice/VoiceInstructions';
import PermissionErrorDisplay from '@/components/voice/PermissionErrorDisplay';

interface EnhancedVoiceRecorderProps {
  isListening: boolean;
  onVoiceData: (transcript: string, confidence: number, detectedLanguage: string) => void;
  language: string;
  onListeningChange: (listening: boolean) => void;
}

const EnhancedVoiceRecorder: React.FC<EnhancedVoiceRecorderProps> = ({
  isListening,
  onVoiceData,
  language,
  onListeningChange
}) => {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [audioLevel, setAudioLevel] = useState(0);
  const [silenceTimer, setSilenceTimer] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number>(0);
  const lastAudioTimeRef = useRef<number>(0);
  
  const { speechToText, isLoading } = useSpeechToTextService();

  const silenceThreshold = 30;
  const silenceDuration = 3000; // 3 seconds

  useEffect(() => {
    const supported = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    setIsSupported(supported);
    
    if (supported) {
      checkMicrophonePermission();
    }
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const permissionResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermissionStatus(permissionResult.state);
      
      permissionResult.onchange = () => {
        setPermissionStatus(permissionResult.state);
      };
    } catch (error) {
      console.log('Permission API not supported');
    }
  };

  const setupAudioAnalyser = (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        setAudioLevel(average);
        
        const currentTime = Date.now();
        
        // Auto-stop logic
        if (average > silenceThreshold) {
          // Audio detected - reset silence timer
          lastAudioTimeRef.current = currentTime;
          silenceStartRef.current = 0;
          setSilenceTimer(0);
        } else {
          // Silence detected
          if (silenceStartRef.current === 0) {
            silenceStartRef.current = currentTime;
          }
          
          const silenceElapsed = currentTime - silenceStartRef.current;
          setSilenceTimer(silenceElapsed);
          
          // Stop recording if silence duration exceeded
          if (silenceElapsed >= silenceDuration && lastAudioTimeRef.current > 0) {
            console.log(`🔇 Auto-stopping: ${silenceElapsed}ms of silence detected`);
            stopListening();
            return;
          }
        }
        
        if (isListening) {
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Error setting up audio analyser:', error);
    }
  };

  const startListening = async () => {
    if (!isSupported || isListening) return;

    try {
      console.log('🎤 Starting enhanced voice recording...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        } 
      });

      streamRef.current = stream;
      setupAudioAnalyser(stream);
      
      chunksRef.current = [];
      silenceStartRef.current = 0;
      lastAudioTimeRef.current = 0;
      setSilenceTimer(0);
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        console.log('🛑 Recording stopped, processing audio...');
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        
        try {
          setTranscript('Processing speech...');
          const result = await speechToText(audioBlob, language === 'auto' ? 'auto' : language);
          
          if (result.transcript && result.transcript.trim()) {
            console.log('✅ Speech recognition result:', result);
            onVoiceData(result.transcript, result.confidence, result.detectedLanguage);
            setTranscript('');
          } else {
            setTranscript('No speech detected. Please try again.');
            setTimeout(() => setTranscript(''), 3000);
          }
        } catch (error) {
          console.error('❌ Speech to text failed:', error);
          setTranscript('Failed to process speech. Please try again.');
          setTimeout(() => setTranscript(''), 3000);
        }

        cleanup();
      };

      mediaRecorderRef.current.start();
      onListeningChange(true);
      setTranscript('Listening... Speak now! (Auto-stops after 3s silence)');

      // Safety timeout - maximum 15 seconds
      setTimeout(() => {
        if (isListening && mediaRecorderRef.current?.state === 'recording') {
          console.log('⏰ Maximum recording time reached, stopping...');
          stopListening();
        }
      }, 15000);

    } catch (error) {
      console.error('❌ Error accessing microphone:', error);
      setTranscript('Microphone access denied. Please allow microphone access.');
      setTimeout(() => setTranscript(''), 5000);
      onListeningChange(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    onListeningChange(false);
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setAudioLevel(0);
    setSilenceTimer(0);
    silenceStartRef.current = 0;
    lastAudioTimeRef.current = 0;
  };

  if (!isSupported) {
    return <PermissionErrorDisplay type="not-supported" />;
  }

  if (permissionStatus === 'denied') {
    return <PermissionErrorDisplay type="denied" />;
  }

  return (
    <div className="space-y-6">
      <VoiceControlButton
        isListening={isListening}
        isLoading={isLoading}
        onStart={startListening}
        onStop={stopListening}
      />

      <VoiceStatusDisplay
        isListening={isListening}
        isLoading={isLoading}
      />

      <AudioLevelVisualizer
        isListening={isListening}
        audioLevel={audioLevel}
        silenceTimer={silenceTimer}
        silenceDuration={silenceDuration}
      />

      <TranscriptDisplay transcript={transcript} />

      <VoiceInstructions />
    </div>
  );
};

export default EnhancedVoiceRecorder;
