
import React, { useEffect, useRef, useCallback } from 'react';
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
  showControls?: boolean;
}

const EnhancedFaceDetectionCamera: React.FC<EnhancedFaceDetectionCameraProps> = ({ 
  onFaceDetected, 
  autoStart = true,
  onAutoGreetingTriggered,
  showControls = false
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
  } = useFaceDetection(autoStart);

  const { greetingCooldown, handleFaceDetection } = useAutoGreeting({
    onAutoGreetingTriggered
  });

  const callbackSetupRef = useRef(false);

  // Memoize the combined callback to prevent infinite re-renders
  const combinedCallback = useCallback((detected: boolean, count: number) => {
    console.log('📊 EnhancedFaceDetectionCamera received detection:', { detected, count });
    
    // Always notify parent component
    onFaceDetected(detected, count);
    
    // Handle auto-greeting logic
    handleFaceDetection(detected, count);
  }, [onFaceDetected, handleFaceDetection]);

  // Set up detection callback only once
  useEffect(() => {
    if (callbackSetupRef.current) return;
    
    console.log('🔧 Setting up face detection callback in EnhancedFaceDetectionCamera...');
    callbackSetupRef.current = true;
    
    setDetectionCallback(combinedCallback);
  }, [combinedCallback, setDetectionCallback]);

  const handleCameraToggle = () => {
    if (isActive) {
      console.log('👤 User manually stopping camera');
      stopCamera();
      callbackSetupRef.current = false;
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
        
        {/* Control Button - Only show if explicitly requested */}
        {showControls && (
          <CameraControlButton
            isActive={isActive}
            isLoading={isLoading}
            onToggle={handleCameraToggle}
          />
        )}
        
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
