
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SessionStatusPanelProps {
  selectedLanguage: string;
  sessionId: string;
  conversationHistory: any[];
  autoInteractionEnabled: boolean;
  facesDetected: boolean;
  faceCount: number;
}

const SessionStatusPanel: React.FC<SessionStatusPanelProps> = ({
  selectedLanguage,
  sessionId,
  conversationHistory,
  autoInteractionEnabled,
  facesDetected,
  faceCount
}) => {
  return (
    <Card className="shadow-lg border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
        <CardTitle className="text-purple-800">Session Status</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-3 p-6">
        <div className="flex justify-between">
          <span className="font-semibold">Language:</span>
          <span className="font-mono">{selectedLanguage}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Session:</span>
          <span className="font-mono">{sessionId.slice(-8)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Interactions:</span>
          <span className="font-bold">{conversationHistory.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Auto-Assist:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            autoInteractionEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {autoInteractionEnabled ? 'ACTIVE' : 'OFF'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Face Detection:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            facesDetected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {facesDetected ? `${faceCount} DETECTED` : 'NONE'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionStatusPanel;
