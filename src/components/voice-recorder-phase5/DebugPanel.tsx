
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DebugPanelProps {
  isCameraActive: boolean;
  facesDetected: boolean;
  faceCount: number;
  hasGreeted: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({
  isCameraActive,
  facesDetected,
  faceCount,
  hasGreeted
}) => {
  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-yellow-800">Debug Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <strong>Camera Active:</strong> {isCameraActive ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Faces Detected:</strong> {facesDetected ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Face Count:</strong> {faceCount}
          </div>
          <div>
            <strong>Has Greeted:</strong> {hasGreeted ? 'Yes' : 'No'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
