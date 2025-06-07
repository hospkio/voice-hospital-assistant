
import React, { useEffect, useState } from 'react';
import { Camera, CameraOff, Users, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFaceDetection } from '@/hooks/useFaceDetection';

interface EnhancedFaceDetectionCameraProps {
  onFaceDetected: (detected: boolean, count: number) => void;
  autoStart?: boolean;
}

const EnhancedFaceDetectionCamera: React.FC<EnhancedFaceDetectionCameraProps> = ({ 
  onFaceDetected, 
  autoStart = true 
}) => {
  const { 
    videoRef, 
    isActive, 
    facesDetected, 
    faceCount,
    isLoading, 
    startCamera, 
    stopCamera 
  } = useFaceDetection();

  const [lastDetectionTime, setLastDetectionTime] = useState(0);

  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [autoStart]);

  useEffect(() => {
    onFaceDetected(facesDetected, faceCount);
    
    if (facesDetected) {
      setLastDetectionTime(Date.now());
    }
  }, [facesDetected, faceCount, onFaceDetected]);

  return (
    <Card className="w-full border-2 border-blue-200 shadow-xl">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-green-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Camera className="h-6 w-6 text-blue-600" />
            <span className="text-blue-800">Smart Face Detection</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {facesDetected && (
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full border border-green-300">
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">
                  {faceCount} Person{faceCount !== 1 ? 's' : ''} Detected
                </span>
              </div>
            )}
            
            <div className={`w-4 h-4 rounded-full border-2 ${
              isActive ? 'bg-green-500 border-green-400 shadow-lg shadow-green-400/50 animate-pulse' : 'bg-gray-300 border-gray-400'
            }`} />
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 p-6">
        <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video shadow-inner">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {!isActive && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center text-white">
                <CameraOff className="h-16 w-16 mx-auto mb-4 opacity-60" />
                <p className="text-lg font-medium">Camera Ready</p>
                <p className="text-sm opacity-75 mt-1">Touch to activate face detection</p>
              </div>
            </div>
          )}
          
          {facesDetected && (
            <div className="absolute top-3 left-3 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Welcome! Ready to assist</span>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-900/80">
              <div className="text-center text-white">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-lg font-medium">Initializing Camera</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={isActive ? stopCamera : startCamera}
            disabled={isLoading}
            variant={isActive ? "destructive" : "default"}
            className="flex-1 h-12 text-lg font-medium"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Starting...
              </>
            ) : isActive ? (
              <>
                <CameraOff className="h-5 w-5 mr-2" />
                Stop Detection
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 mr-2" />
                Start Detection
              </>
            )}
          </Button>
        </div>
        
        <div className="text-center text-sm space-y-2">
          {isActive ? (
            facesDetected ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <Volume2 className="h-4 w-4" />
                  <span className="font-semibold">AI Assistant Active</span>
                </div>
                <p className="text-green-600 mt-1">Say "Hello" or speak naturally to begin</p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-700 font-medium">👋 Position yourself in front of the camera</p>
                <p className="text-blue-600 text-xs mt-1">AI will automatically greet you when detected</p>
              </div>
            )
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-gray-600">Face detection helps provide automatic assistance</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedFaceDetectionCamera;
