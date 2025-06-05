
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';

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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { speechToText, isProcessing } = useGoogleCloudServices();

  useEffect(() => {
    // Check if browser supports media recording
    setIsSupported('mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices);
  }, []);

  const startListening = async () => {
    if (!isSupported || isListening) return;

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

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm;codecs=opus' });
        
        // Process with Google Speech-to-Text
        const result = await speechToText(audioBlob, language);
        
        if (result.success && result.transcript) {
          onVoiceData(result.transcript, result.confidence, result.detectedLanguage);
          setTranscript('');
        }

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      onListeningChange(true);

      // Auto-stop after 30 seconds for safety
      setTimeout(() => {
        if (isListening && mediaRecorderRef.current?.state === 'recording') {
          stopListening();
        }
      }, 30000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      onListeningChange(false);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      onListeningChange(false);
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 font-semibold">Microphone access not supported</p>
          <p className="text-red-500 text-sm mt-2">
            Please use a modern browser and allow microphone access
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Voice Control Button */}
      <div className="flex justify-center">
        <Button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          size="lg"
          className={`h-20 w-20 rounded-full text-white transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isListening ? (
            <Square className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </div>

      {/* Status and Instructions */}
      <div className="text-center space-y-2">
        <p className={`text-lg font-semibold ${
          isListening ? 'text-red-600' : isProcessing ? 'text-blue-600' : 'text-gray-700'
        }`}>
          {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Press to speak'}
        </p>
        
        {!isListening && !isProcessing && (
          <p className="text-gray-500 text-sm">
            Click the microphone and speak clearly
          </p>
        )}
      </div>

      {/* Live Transcript */}
      {transcript && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-blue-800 font-medium">Processing:</p>
            <p className="text-blue-700 mt-1 italic">"{transcript}"</p>
          </CardContent>
        </Card>
      )}

      {/* Audio Level Indicator */}
      {isListening && (
        <div className="flex justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-2 bg-blue-500 rounded-full animate-pulse`}
              style={{
                height: Math.random() * 20 + 10,
                animationDelay: `${i * 0.1}s`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EnhancedVoiceRecorder;
