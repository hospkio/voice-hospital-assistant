
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
  faceDetectionEnabled?: boolean;
}

const EnhancedFaceDetectionCamera: React.FC<EnhancedFaceDetectionCameraProps> = ({ 
  onFaceDetected, 
  autoStart = true,
  onAutoGreetingTriggered,
  showControls = false,
  faceDetectionEnabled = true
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
  } = useFaceDetection(autoStart && faceDetectionEnabled);

  const { greetingCooldown, handleFaceDetection } = useAutoGreeting({
    onAutoGreetingTriggered
  });

  const callbackSetupRef = useRef(false);

  // Memoize the combined callback to prevent infinite re-renders
  const combinedCallback = useCallback((detected: boolean, count: number) => {
    console.log('📊 EnhancedFaceDetectionCamera received detection:', { detected, count, enabled: faceDetectionEnabled });
    
    // Only process if face detection is enabled
    if (faceDetectionEnabled) {
      // Always notify parent component
      onFaceDetected(detected, count);
      
      // Handle auto-greeting logic
      handleFaceDetection(detected, count);
    } else {
      // If disabled, always report no faces
      onFaceDetected(false, 0);
    }
  }, [onFaceDetected, handleFaceDetection, faceDetectionEnabled]);

  // Set up detection callback only once and when face detection is enabled
  useEffect(() => {
    if (!faceDetectionEnabled) {
      // Stop camera if face detection is disabled
      if (isActive) {
        stopCamera();
      }
      callbackSetupRef.current = false;
      return;
    }

    if (callbackSetupRef.current) return;
    
    console.log('🔧 Setting up face detection callback in EnhancedFaceDetectionCamera...');
    callbackSetupRef.current = true;
    
    setDetectionCallback(combinedCallback);
  }, [combinedCallback, setDetectionCallback, faceDetectionEnabled, isActive, stopCamera]);

  const handleCameraToggle = () => {
    if (!faceDetectionEnabled) {
      console.log('🚫 Face detection disabled, cannot toggle camera');
      return;
    }

    if (isActive) {
      console.log('👤 User manually stopping camera');
      stopCamera();
      callbackSetupRef.current = false;
    } else {
      console.log('👤 User manually starting camera');
      startCamera();
    }
  };

  // Show disabled state when face detection is off
  if (!faceDetectionEnabled) {
    return (
      <Card className="w-full border-0 shadow-2xl bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
        <CardHeader className="pb-4 bg-gradient-to-r from-gray-400 to-gray-600 text-white">
          <div className="text-center">
            <h3 className="text-xl font-bold">Face Detection Disabled</h3>
            <p className="text-gray-200 text-sm">Enable face detection in settings to use this feature</p>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="relative bg-gray-200 rounded-2xl overflow-hidden aspect-video shadow-2xl flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium">Face Detection Off</p>
              <p className="text-sm">Go to Settings to enable</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
