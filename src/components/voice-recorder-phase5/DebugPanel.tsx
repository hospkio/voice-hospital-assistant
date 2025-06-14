
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DebugPanelProps {
  isCameraActive: boolean;
  facesDetected: boolean;
  faceCount: number;
  hasGreeted: boolean;
  isOnCooldown?: boolean;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ 
  isCameraActive, 
  facesDetected, 
  faceCount, 
  hasGreeted,
  isOnCooldown = false
}) => {
  return (
    <Card className="bg-gray-50 border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">Debug Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant={isCameraActive ? "default" : "secondary"}>
            Camera: {isCameraActive ? 'Active' : 'Inactive'}
          </Badge>
          <Badge variant={facesDetected ? "default" : "secondary"}>
            Faces: {facesDetected ? `Detected (${faceCount})` : 'None'}
          </Badge>
          <Badge variant={hasGreeted ? "default" : "secondary"}>
            Greeting: {hasGreeted ? 'Completed' : 'Pending'}
          </Badge>
          <Badge variant={isOnCooldown ? "destructive" : "secondary"}>
            Cooldown: {isOnCooldown ? 'Active' : 'Ready'}
          </Badge>
        </div>
        <p className="text-xs text-gray-500">
          {isOnCooldown 
            ? "Greeting cooldown active - no new greetings will play for 30 seconds"
            : "Ready to greet new users when face is detected"
          }
        </p>
      </CardContent>
    </Card>
  );
};

export default DebugPanel;
