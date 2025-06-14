
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatusPanelProps {
  isCameraActive: boolean;
  facesDetected: boolean;
  hasGreeted: boolean;
  isRecording: boolean;
  transcript: string;
}

const StatusPanel: React.FC<StatusPanelProps> = ({
  isCameraActive,
  facesDetected,
  hasGreeted,
  isRecording,
  transcript
}) => {
  return (
    <Card className="border-2 border-gray-200">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-gray-800">Phase 5 Status</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${isCameraActive ? 'bg-green-500' : 'bg-gray-300'}`} />
            <p className="font-semibold">Camera</p>
            <p className="text-gray-600">{isCameraActive ? 'Active' : 'Inactive'}</p>
          </div>
          
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${facesDetected ? 'bg-blue-500' : 'bg-gray-300'}`} />
            <p className="font-semibold">Face Detection</p>
            <p className="text-gray-600">{facesDetected ? 'Detected' : 'None'}</p>
          </div>
          
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${hasGreeted ? 'bg-purple-500' : 'bg-gray-300'}`} />
            <p className="font-semibold">Auto Greeting</p>
            <p className="text-gray-600">{hasGreeted ? 'Completed' : 'Waiting'}</p>
          </div>
          
          <div className="text-center">
            <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${isRecording ? 'bg-red-500' : transcript ? 'bg-green-500' : 'bg-gray-300'}`} />
            <p className="font-semibold">Voice</p>
            <p className="text-gray-600">{isRecording ? 'Recording' : transcript ? 'Processed' : 'Ready'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusPanel;
