
import React from 'react';
import { Volume2, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResultsDisplayProps {
  greetingMessage: string;
  transcript: string;
  detectedLanguage: string;
  confidence: number;
  processingTime: number;
  faceCount: number;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  greetingMessage,
  transcript,
  detectedLanguage,
  confidence,
  processingTime,
  faceCount
}) => {
  if (!greetingMessage && !transcript) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Greeting Message */}
      {greetingMessage && (
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <Volume2 className="h-5 w-5" />
              <span>Auto Greeting</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <p className="text-green-800 font-medium">{greetingMessage}</p>
              <p className="text-green-600 text-sm mt-2">Language: {detectedLanguage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transcription Results */}
      {transcript && (
        <Card className="border-2 border-purple-200">
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <MessageSquare className="h-5 w-5" />
              <span>Speech Recognition</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                <p className="text-purple-800 font-medium">{transcript}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Language:</span>
                  <span className="ml-2">{detectedLanguage}</span>
                </div>
                <div>
                  <span className="font-semibold">Confidence:</span>
                  <span className="ml-2">{(confidence * 100).toFixed(1)}%</span>
                </div>
                <div>
                  <span className="font-semibold">Processing:</span>
                  <span className="ml-2">{processingTime}ms</span>
                </div>
                <div>
                  <span className="font-semibold">Faces:</span>
                  <span className="ml-2">{faceCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsDisplay;
