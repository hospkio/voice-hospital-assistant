
import React, { useEffect, useState } from 'react';
import { Camera, CameraOff, Users, Volume2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFaceDetection } from '@/hooks/useFaceDetection';

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
    stopCamera 
  } = useFaceDetection();

  const [lastDetectionTime, setLastDetectionTime] = useState(0);
  const [hasTriggeredGreeting, setHasTriggeredGreeting] = useState(false);
  const [greetingCooldown, setGreetingCooldown] = useState(false);

  useEffect(() => {
    if (autoStart) {
      // Delay camera start slightly for better mobile performance
      setTimeout(() => {
        startCamera();
      }, 1000);
    }
    
    return () => {
      stopCamera();
    };
  }, [autoStart]);

  useEffect(() => {
    onFaceDetected(facesDetected, faceCount);
    
    if (facesDetected) {
      const now = Date.now();
      setLastDetectionTime(now);
      
      // Enhanced auto-greeting logic with cooldown
      if (!hasTriggeredGreeting && !greetingCooldown && onAutoGreetingTriggered) {
        console.log('Face detected! Triggering auto-greeting...');
        setHasTriggeredGreeting(true);
        setGreetingCooldown(true);
        
        // Small delay to ensure stable face detection
        setTimeout(() => {
          onAutoGreetingTriggered();
        }, 2000);
        
        // Reset greeting trigger after 60 seconds
        setTimeout(() => {
          setHasTriggeredGreeting(false);
        }, 60000);
        
        // Cooldown period of 10 seconds between greetings
        setTimeout(() => {
          setGreetingCooldown(false);
        }, 10000);
      }
    } else {
      // Reset greeting trigger when no faces detected for 10 seconds
      if (hasTriggeredGreeting && Date.now() - lastDetectionTime > 10000) {
        setHasTriggeredGreeting(false);
      }
    }
  }, [facesDetected, faceCount, onFaceDetected, hasTriggeredGreeting, greetingCooldown, onAutoGreetingTriggered, lastDetectionTime]);

  return (
    <Card className="w-full border-2 border-blue-200 shadow-xl">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-green-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="h-6 w-6 text-blue-600" />
            <span className="text-blue-800 text-lg md:text-xl">Smart Face Detection</span>
          </div>
          
          <div className="flex items-center space-x-3">
            {facesDetected && (
              <div className="flex items-center space-x-2 bg-green-100 px-3 py-2 rounded-full border border-green-300">
                <Users className="h-5 w-5 text-green-600" />
                <span className="text-sm md:text-base font-semibold text-green-800">
                  {faceCount} Person{faceCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 ${
              isActive ? 'bg-green-500 border-green-400 shadow-lg shadow-green-400/50 animate-pulse' : 'bg-gray-300 border-gray-400'
            }`} />
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 p-4 md:p-6">
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
              <div className="text-center text-white p-6">
                <EyeOff className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 opacity-60" />
                <p className="text-lg md:text-xl font-medium">Camera Ready</p>
                <p className="text-sm md:text-base opacity-75 mt-2">Touch to activate smart detection</p>
              </div>
            </div>
          )}
          
          {facesDetected && (
            <div className="absolute top-3 left-3 bg-green-500 text-white px-4 py-2 rounded-lg text-sm md:text-base font-semibold shadow-lg flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Welcome! AI Assistant Active</span>
            </div>
          )}

          {greetingCooldown && (
            <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-lg text-xs md:text-sm font-medium">
              Greeting Active
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-900/80">
              <div className="text-center text-white p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-lg md:text-xl font-medium">Initializing Camera</p>
                <p className="text-sm md:text-base opacity-75">Setting up face detection...</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3">
          <Button
            onClick={isActive ? stopCamera : startCamera}
            disabled={isLoading}
            variant={isActive ? "destructive" : "default"}
            className="flex-1 h-12 md:h-14 text-lg md:text-xl font-medium"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Starting...
              </>
            ) : isActive ? (
              <>
                <CameraOff className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                Stop Detection
              </>
            ) : (
              <>
                <Camera className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                Start Detection
              </>
            )}
          </Button>
        </div>
        
        <div className="text-center text-sm md:text-base space-y-3">
          {isActive ? (
            facesDetected ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 md:p-6">
                <div className="flex items-center justify-center space-x-2 text-green-700 mb-2">
                  <Volume2 className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="font-bold text-lg md:text-xl">🤖 AI Assistant Ready</span>
                </div>
                <p className="text-green-600 text-base md:text-lg">Say "Hello" or speak naturally to begin conversation</p>
                <p className="text-green-500 text-sm md:text-base mt-2">I can detect your language automatically and respond accordingly</p>
              </div>
            ) : (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 md:p-6">
                <p className="text-blue-700 font-bold text-lg md:text-xl mb-2">👋 Step in front of the camera</p>
                <p className="text-blue-600 text-base md:text-lg">AI will automatically greet you when your face is detected</p>
                <p className="text-blue-500 text-sm md:text-base mt-2">Works best when you're 2-4 feet from the screen</p>
              </div>
            )
          ) : (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 md:p-6">
              <p className="text-gray-600 font-medium text-lg md:text-xl">🎯 Smart Detection System</p>
              <p className="text-gray-500 text-base md:text-lg mt-2">Automatically detects faces and starts assistance</p>
              <p className="text-gray-400 text-sm md:text-base mt-1">Privacy-focused: No face data is stored or transmitted</p>
            </div>
          )}
        </div>

        {/* Mobile-specific instructions */}
        <div className="md:hidden bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-yellow-800 font-medium text-sm">📱 Mobile Tips:</p>
          <p className="text-yellow-700 text-xs mt-1">• Hold device stable for best detection</p>
          <p className="text-yellow-700 text-xs">• Ensure good lighting for optimal performance</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedFaceDetectionCamera;
