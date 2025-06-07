
import React, { useEffect } from 'react';
import { Camera, CameraOff, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCameraDetection } from '@/hooks/useCameraDetection';

interface CameraFeedProps {
  onPeopleDetected: (detected: boolean) => void;
  autoStart?: boolean;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onPeopleDetected, autoStart = true }) => {
  const { 
    videoRef, 
    isActive, 
    peopleDetected, 
    isLoading, 
    startCamera, 
    stopCamera 
  } = useCameraDetection();

  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [autoStart]);

  useEffect(() => {
    onPeopleDetected(peopleDetected);
  }, [peopleDetected, onPeopleDetected]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-5 w-5" />
            <span>People Detection</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {peopleDetected && (
              <div className="flex items-center space-x-1 text-green-600">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">Person Detected</span>
              </div>
            )}
            
            <div className={`w-3 h-3 rounded-full ${
              isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
            }`} />
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {!isActive && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
              <div className="text-center text-white">
                <CameraOff className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Camera not active</p>
              </div>
            </div>
          )}
          
          {peopleDetected && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
              Person Detected
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            onClick={isActive ? stopCamera : startCamera}
            disabled={isLoading}
            variant={isActive ? "destructive" : "default"}
            className="flex-1"
          >
            {isLoading ? (
              'Starting...'
            ) : isActive ? (
              <>
                <CameraOff className="h-4 w-4 mr-2" />
                Stop Camera
              </>
            ) : (
              <>
                <Camera className="h-4 w-4 mr-2" />
                Start Camera
              </>
            )}
          </Button>
        </div>
        
        <div className="text-center text-sm text-gray-600">
          {isActive ? (
            peopleDetected ? (
              <span className="text-green-600 font-medium">
                🟢 Ready to assist! Say "Hello" to start.
              </span>
            ) : (
              "👋 Walk in front of the camera to start interaction"
            )
          ) : (
            "Camera detection helps provide automatic assistance"
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CameraFeed;
