
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface VoiceRecorderProps {
  isListening: boolean;
  onVoiceData: (transcript: string) => void;
  language: string;
  onListeningChange: (listening: boolean) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isListening,
  onVoiceData,
  language,
  onListeningChange
}) => {
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onstart = () => {
        console.log('Speech recognition started');
        onListeningChange(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(interimTranscript || finalTranscript);

        if (finalTranscript) {
          onVoiceData(finalTranscript);
          setTranscript('');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        onListeningChange(false);
      };

      recognition.onend = () => {
        console.log('Speech recognition ended');
        onListeningChange(false);
      };
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, onVoiceData, onListeningChange]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  if (!isSupported) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6 text-center">
          <p className="text-red-600 font-semibold">Speech recognition not supported</p>
          <p className="text-red-500 text-sm mt-2">
            Please use a modern browser like Chrome, Edge, or Safari
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
          size="lg"
          className={`h-20 w-20 rounded-full text-white transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isListening ? (
            <Square className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>
      </div>

      {/* Status and Instructions */}
      <div className="text-center space-y-2">
        <p className={`text-lg font-semibold ${
          isListening ? 'text-red-600' : 'text-gray-700'
        }`}>
          {isListening ? 'Listening...' : 'Press to speak'}
        </p>
        
        {!isListening && (
          <p className="text-gray-500 text-sm">
            Click the microphone and speak clearly
          </p>
        )}
      </div>

      {/* Live Transcript */}
      {transcript && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-blue-800 font-medium">You said:</p>
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

export default VoiceRecorder;
