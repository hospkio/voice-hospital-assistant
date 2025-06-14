
import React from 'react';
import { Camera, CameraOff, Users, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CameraSectionProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isCameraActive: boolean;
  facesDetected: boolean;
  faceCount: number;
  cameraLoading: boolean;
  startCamera: () => void;
  stopCamera: () => void;
}

const CameraSection: React.FC<CameraSectionProps> = ({
  videoRef,
  isCameraActive,
  facesDetected,
  faceCount,
  cameraLoading,
  startCamera,
  stopCamera
}) => {
  return (
    <Card className="border-2 border-teal-200">
      <CardHeader className="bg-teal-50">
        <CardTitle className="flex items-center space-x-2 text-teal-800">
          <Eye className="h-5 w-5" />
          <span>Face Detection Camera</span>
          {facesDetected && (
            <div className="ml-auto flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-green-800 font-bold">{faceCount}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          {!isCameraActive && !cameraLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90">
              <div className="text-center text-white">
                <CameraOff className="h-12 w-12 mx-auto mb-3 opacity-60" />
                <p className="text-lg">Camera Off</p>
                <p className="text-sm opacity-75">Click Start Camera to begin face detection</p>
              </div>
            </div>
          )}
          
          {facesDetected && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold animate-pulse">
              Face Detected - Auto-greeting Active
            </div>
          )}
        </div>
        
        <Button
          onClick={isCameraActive ? stopCamera : startCamera}
          disabled={cameraLoading}
          className={`w-full ${isCameraActive ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'}`}
        >
          {cameraLoading ? (
            'Starting Camera...'
          ) : isCameraActive ? (
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
      </CardContent>
    </Card>
  );
};

export default CameraSection;
