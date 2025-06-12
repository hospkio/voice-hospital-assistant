
import React from 'react';
import { Volume2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface TranscriptDisplayProps {
  transcript: string;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript }) => {
  if (!transcript) return null;

  const isError = transcript.includes('Failed') || transcript.includes('No speech');
  const isProcessing = transcript.includes('Processing');
  const isListening = transcript.includes('Listening');

  return (
    <Card className={`border-2 ${
      isError 
        ? 'bg-red-50 border-red-200' 
        : 'bg-blue-50 border-blue-200'
    }`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center space-x-2 mb-2">
          <Volume2 className={`h-5 w-5 ${
            isError ? 'text-red-600' : 'text-blue-600'
          }`} />
          <p className={`font-semibold ${
            isError ? 'text-red-800' : 'text-blue-800'
          }`}>
            {isProcessing ? 'Processing Speech' : 
             isListening ? 'Listening for Speech' :
             isError ? 'Processing Error' : 'Speech Detected'}
          </p>
        </div>
        <p className={`text-lg md:text-xl italic ${
          isError ? 'text-red-700' : 'text-blue-700'
        }`}>
          "{transcript}"
        </p>
      </CardContent>
    </Card>
  );
};

export default TranscriptDisplay;
