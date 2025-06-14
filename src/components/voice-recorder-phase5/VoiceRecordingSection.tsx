
import React from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VoiceRecordingSectionProps {
  isRecording: boolean;
  audioLevel: number;
  isProcessing: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resetSession: () => void;
}

const VoiceRecordingSection: React.FC<VoiceRecordingSectionProps> = ({
  isRecording,
  audioLevel,
  isProcessing,
  startRecording,
  stopRecording,
  resetSession
}) => {
  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Mic className="h-5 w-5" />
          <span>Voice Recording</span>
          {isRecording && (
            <div className="ml-auto bg-red-100 px-3 py-1 rounded-full">
              <span className="text-red-800 font-bold">RECORDING</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Audio Level Visualization */}
        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-100 ease-out"
              style={{ width: `${audioLevel * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1">Audio Level: {(audioLevel * 100).toFixed(0)}%</p>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </>
            )}
          </Button>
          
          <Button
            onClick={resetSession}
            variant="outline"
            className="w-full"
          >
            Reset Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceRecordingSection;
