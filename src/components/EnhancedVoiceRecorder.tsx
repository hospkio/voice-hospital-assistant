
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, Volume2, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSpeechToTextService } from '@/hooks/useSpeechToTextService';

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
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6 text-center">
          <MicOff className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold text-lg">Microphone Not Supported</p>
          <p className="text-red-500 text-sm mt-2">
            Please use a modern browser and allow microphone access
          </p>
        </CardContent>
      </Card>
    );
  }

  if (permissionStatus === 'denied') {
    return (
      <Card className="bg-orange-50 border-orange-200">
        <CardContent className="p-6 text-center">
          <MicOff className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <p className="text-orange-600 font-semibold text-lg">Microphone Access Denied</p>
          <p className="text-orange-500 text-sm mt-2">
            Please allow microphone access in your browser settings
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Voice Control Button */}
      <div className="flex justify-center">
        <Button
          onClick={isListening ? stopListening : startListening}
          disabled={isLoading}
          size="lg"
          className={`h-24 w-24 md:h-28 md:w-28 rounded-full text-white transition-all duration-300 shadow-lg ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' 
              : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
          }`}
        >
          {isLoading ? (
            <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin" />
          ) : isListening ? (
            <Square className="h-10 w-10 md:h-12 md:w-12" />
          ) : (
            <Mic className="h-10 w-10 md:h-12 md:w-12" />
          )}
        </Button>
      </div>

      {/* Status Display */}
      <div className="text-center space-y-3">
        <p className={`text-xl md:text-2xl font-bold ${
          isListening ? 'text-red-600' : isLoading ? 'text-blue-600' : 'text-gray-700'
        }`}>
          {isLoading ? 'Processing Speech...' : 
           isListening ? 'Listening... (Auto-stops on silence)' : 
           'Touch to Speak'}
        </p>
        
        {!isListening && !isLoading && (
          <p className="text-gray-500 text-lg md:text-xl">
            🎤 Tap microphone and speak clearly
          </p>
        )}
      </div>

      {/* Audio Level Visualization with Silence Timer */}
      {isListening && (
        <div className="space-y-4">
          <div className="flex justify-center items-end space-x-2 h-16">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-3 md:w-4 bg-gradient-to-t from-blue-500 to-green-400 rounded-full transition-all duration-150"
                style={{
                  height: `${Math.max(8, (audioLevel / 255) * 60 + Math.random() * 10)}px`,
                }}
              />
            ))}
          </div>
          
          {silenceTimer > 0 && (
            <div className="text-center bg-orange-100 border border-orange-300 rounded-lg p-3">
              <p className="text-orange-700 font-medium">
                🔇 Silence detected: {(silenceTimer/1000).toFixed(1)}s
              </p>
              <p className="text-orange-600 text-sm">
                Auto-stops in {Math.max(0, (silenceDuration - silenceTimer)/1000).toFixed(1)}s
              </p>
            </div>
          )}
        </div>
      )}

      {/* Live Transcript */}
      {transcript && (
        <Card className={`border-2 ${
          transcript.includes('Failed') || transcript.includes('No speech') 
            ? 'bg-red-50 border-red-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center space-x-2 mb-2">
              <Volume2 className={`h-5 w-5 ${
                transcript.includes('Failed') ? 'text-red-600' : 'text-blue-600'
              }`} />
              <p className={`font-semibold ${
                transcript.includes('Failed') ? 'text-red-800' : 'text-blue-800'
              }`}>
                {transcript.includes('Processing') ? 'Processing Speech' : 
                 transcript.includes('Listening') ? 'Listening for Speech' :
                 transcript.includes('Failed') ? 'Processing Error' : 'Speech Detected'}
              </p>
            </div>
            <p className={`text-lg md:text-xl italic ${
              transcript.includes('Failed') ? 'text-red-700' : 'text-blue-700'
            }`}>
              "{transcript}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <div className="text-center text-sm md:text-base text-gray-600 bg-gray-50 p-4 rounded-lg">
        <p className="font-medium mb-2">🎤 Enhanced Voice Instructions:</p>
        <p>• Recording stops automatically after 3 seconds of silence</p>
        <p>• Real-time audio level monitoring with silence detection</p>
        <p>• Speak clearly and close to your device</p>
        <p>• Wait for "Processing..." before speaking again</p>
      </div>
    </div>
  );
};

export default EnhancedVoiceRecorder;
