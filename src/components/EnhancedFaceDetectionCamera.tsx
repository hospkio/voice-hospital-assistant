
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useAutoGreeting } from '@/hooks/useAutoGreeting';
import CameraHeader from '@/components/face-detection/CameraHeader';
import CameraOverlay from '@/components/face-detection/CameraOverlay';
import CameraControlButton from '@/components/face-detection/CameraControlButton';
import StatusInfo from '@/components/face-detection/StatusInfo';
import MobileTips from '@/components/face-detection/MobileTips';

interface EnhancedFaceDetectionCameraProps {
  onFaceDetected: (detected: boolean, count: number) => void;
  autoStart?: boolean;
  onAutoGreetingTriggered?: () => void;
}

const EnhancedFaceDetectionCamera: React.FC<EnhancedFaceDetectionCameraProps> = ({ 
  onFaceDetected, 
  autoStart = true,
  onAutoGreetingTriggered
}) => {
  const { 
    videoRef, 
    isActive, 
    facesDetected, 
    faceCount,
    isLoading, 
    startCamera, 
    stopCamera,
    setDetectionCallback
  } = useFaceDetection();

  const { greetingCooldown, handleFaceDetection } = useAutoGreeting({
    onAutoGreetingTriggered
  });

  // Set up detection callback
  useEffect(() => {
    console.log('🔧 Setting up face detection callback...');
    setDetectionCallback((detected: boolean, count: number) => {
      console.log('📊 Face detection callback triggered:', { detected, count });
      
      // Always notify parent component
      onFaceDetected(detected, count);
      
      // Handle auto-greeting logic
      handleFaceDetection(detected, count);
    });
  }, [onFaceDetected, handleFaceDetection, setDetectionCallback]);

  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => {
        console.log('🚀 Auto-starting camera in 2 seconds...');
        startCamera();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, startCamera]);

  const handleCameraToggle = () => {
    if (isActive) {
      console.log('👤 User manually stopping camera');
      stopCamera();
    } else {
      console.log('👤 User manually starting camera');
      startCamera();
    }
  };

  return (
    <Card className="w-full border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white">
        <CameraHeader
          facesDetected={facesDetected}
          faceCount={faceCount}
          isActive={isActive}
        />
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Camera Display */}
        <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden aspect-video shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
          
          <CameraOverlay
            isActive={isActive}
            isLoading={isLoading}
            facesDetected={facesDetected}
            greetingCooldown={greetingCooldown}
          />
        </div>
        
        {/* Control Button */}
        <CameraControlButton
          isActive={isActive}
          isLoading={isLoading}
          onToggle={handleCameraToggle}
        />
        
        {/* Status Information */}
        <div className="text-center space-y-4">
          <StatusInfo isActive={isActive} facesDetected={facesDetected} />
        </div>

        {/* Mobile Tips */}
        <MobileTips />
      </CardContent>
    </Card>
  );
};

export default EnhancedFaceDetectionCamera;
