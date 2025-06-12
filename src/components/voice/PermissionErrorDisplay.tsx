
import React from 'react';
import { MicOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PermissionErrorDisplayProps {
  type: 'not-supported' | 'denied';
}

const PermissionErrorDisplay: React.FC<PermissionErrorDisplayProps> = ({ type }) => {
  if (type === 'not-supported') {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="p-6 text-center">
          <MicOff className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold text-lg">Microphone Not Supported</p>
          <p className="text-red-500 text-sm mt-2">
            Please use a modern browser and allow microphone access
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardContent className="p-6 text-center">
        <MicOff className="h-12 w-12 text-orange-500 mx-auto mb-4" />
        <p className="text-orange-600 font-semibold text-lg">Microphone Access Denied</p>
        <p className="text-orange-500 text-sm mt-2">
          Please allow microphone access in your browser settings
        </p>
      </CardContent>
    </Card>
  );
};

export default PermissionErrorDisplay;
