
import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BasicVoiceRecorderProps {
  onVoiceData: (audioBlob: Blob) => void;
  onError: (error: string) => void;
}

const BasicVoiceRecorder: React.FC<BasicVoiceRecorderProps> = ({ onVoiceData, onError }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const checkMicrophonePermission = async () => {
    try {
      console.log('🎤 Checking microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      console.log('✅ Microphone permission granted');
      return true;
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      setHasPermission(false);
      onError('Microphone access denied. Please allow microphone access in your browser.');
      return false;
    }
  };

  const startRecording = async () => {
    console.log('🎤 Starting recording process...');
    
    if (!await checkMicrophonePermission()) {
      return;
    }

    try {
      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        console.log('📊 Audio data available, size:', event.data.size);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        console.log('🛑 Recording stopped, processing audio...');
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        console.log('🎵 Audio blob created, size:', audioBlob.size, 'bytes');
        
        if (audioBlob.size === 0) {
          onError('No audio data recorded. Please try again.');
          return;
        }

        onVoiceData(audioBlob);
        cleanup();
      };

      // Handle errors
      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        onError('Recording failed. Please try again.');
        cleanup();
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every 1 second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log('✅ Recording started successfully');

    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      onError('Failed to start recording. Please check your microphone.');
      cleanup();
    }
  };

  const stopRecording = () => {
    console.log('🛑 Stopping recording...');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
    setRecordingTime(0);
  };

  if (hasPermission === false) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <h3 className="text-red-600 font-semibold text-lg mb-2">Microphone Access Required</h3>
          <p className="text-red-500 mb-4">Please allow microphone access in your browser settings.</p>
          <Button onClick={checkMicrophonePermission} variant="outline">
            Check Permission Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="text-center">Voice Recorder - Step 1</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            size="lg"
            className={`h-20 w-20 rounded-full transition-all duration-300 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isRecording ? (
              <Square className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>
        </div>

        <div className="text-center">
          <p className={`text-lg font-semibold ${isRecording ? 'text-red-600' : 'text-gray-700'}`}>
            {isRecording ? `Recording... ${recordingTime}s` : 'Click to start recording'}
          </p>
        </div>

        {isRecording && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-center">🎤 Recording in progress...</p>
            <p className="text-blue-600 text-sm text-center mt-1">Click the red button to stop</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BasicVoiceRecorder;
