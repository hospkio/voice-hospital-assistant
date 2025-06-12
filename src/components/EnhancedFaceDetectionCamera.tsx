
import React, { useEffect, useState, useRef } from 'react';
import { Camera, CameraOff, Users, Eye, EyeOff, Sparkles, Zap } from 'lucide-react';
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
    stopCamera,
    setDetectionCallback
  } = useFaceDetection();

  const [hasTriggeredGreeting, setHasTriggeredGreeting] = useState(false);
  const [greetingCooldown, setGreetingCooldown] = useState(false);
  const previousDetectionRef = useRef(false);
  const greetingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set up detection callback
  useEffect(() => {
    setDetectionCallback((detected: boolean, count: number) => {
      console.log('📊 Face detection callback:', { detected, count });
      onFaceDetected(detected, count);
      
      // Handle auto-greeting logic
      if (detected && !previousDetectionRef.current && !hasTriggeredGreeting && !greetingCooldown && onAutoGreetingTriggered) {
        console.log('🎉 NEW FACE DETECTED! Triggering auto-greeting...');
        setHasTriggeredGreeting(true);
        setGreetingCooldown(true);
        
        // Small delay to ensure face is stable
        greetingTimeoutRef.current = setTimeout(() => {
          console.log('🤖 Executing auto-greeting...');
          onAutoGreetingTriggered();
        }, 1000);
        
        // Reset greeting trigger after 45 seconds
        setTimeout(() => {
          setHasTriggeredGreeting(false);
          console.log('🔄 Greeting trigger reset');
        }, 45000);
        
        // Cooldown period of 15 seconds
        setTimeout(() => {
          setGreetingCooldown(false);
          console.log('🟢 Greeting cooldown ended');
        }, 15000);
      }
      
      previousDetectionRef.current = detected;
    });
  }, [onFaceDetected, hasTriggeredGreeting, greetingCooldown, onAutoGreetingTriggered, setDetectionCallback]);

  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => {
        console.log('🚀 Auto-starting camera...');
        startCamera();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart, startCamera]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (greetingTimeoutRef.current) {
        clearTimeout(greetingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Card className="w-full border-0 shadow-2xl bg-gradient-to-br from-blue-50 via-white to-green-50 overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur">
              <Eye className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold">Smart Face Detection</h3>
              <p className="text-blue-100 text-sm">AI-Powered Recognition System</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {facesDetected && (
              <div className="flex items-center space-x-2 bg-green-500 px-4 py-2 rounded-full animate-pulse">
                <Users className="h-5 w-5" />
                <span className="font-bold text-lg">
                  {faceCount} Person{faceCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            <div className={`w-6 h-6 rounded-full border-3 transition-all duration-300 ${
              isActive 
                ? 'bg-green-400 border-green-300 shadow-lg shadow-green-400/50 animate-pulse' 
                : 'bg-gray-400 border-gray-300'
            }`} />
          </div>
        </CardTitle>
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
          
          {/* Overlay States */}
          {!isActive && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm">
              <div className="text-center text-white p-8">
                <div className="mb-6 relative">
                  <EyeOff className="h-20 w-20 mx-auto opacity-60" />
                  <Sparkles className="h-8 w-8 absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
                </div>
                <h4 className="text-2xl font-bold mb-3">AI Vision Ready</h4>
                <p className="text-xl opacity-80 mb-2">Advanced Face Detection System</p>
                <p className="text-lg opacity-60">Touch to activate smart detection</p>
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900/90 to-purple-900/90 backdrop-blur-sm">
              <div className="text-center text-white p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                  <Zap className="h-8 w-8 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-yellow-400" />
                </div>
                <h4 className="text-2xl font-bold mb-3">Initializing AI Vision</h4>
                <p className="text-xl opacity-80">Setting up advanced face detection...</p>
              </div>
            </div>
          )}

          {/* Active Detection Indicators */}
          {facesDetected && (
            <>
              <div className="absolute top-4 left-4 bg-green-500 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg flex items-center space-x-3 animate-pulse">
                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                <span>🤖 AI Assistant Active</span>
              </div>
              
              <div className="absolute bottom-4 left-4 bg-blue-500/90 text-white px-4 py-2 rounded-lg backdrop-blur text-sm">
                <span className="font-medium">Ready for voice commands</span>
              </div>
            </>
          )}

          {greetingCooldown && (
            <div className="absolute top-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium animate-bounce">
              🎤 Greeting Active
            </div>
          )}
        </div>
        
        {/* Control Button */}
        <Button
          onClick={isActive ? stopCamera : startCamera}
          disabled={isLoading}
          className={`w-full h-16 text-xl font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl ${
            isActive 
              ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
              : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Starting AI Vision...</span>
            </div>
          ) : isActive ? (
            <div className="flex items-center space-x-3">
              <CameraOff className="h-6 w-6" />
              <span>Stop Detection</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Camera className="h-6 w-6" />
              <span>Start AI Detection</span>
            </div>
          )}
        </Button>
        
        {/* Status Information */}
        <div className="text-center space-y-4">
          {isActive ? (
            facesDetected ? (
              <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-2xl p-6">
                <div className="flex items-center justify-center space-x-3 text-green-700 mb-3">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                  <span className="font-bold text-2xl">🤖 AI Assistant Ready</span>
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
                <p className="text-green-600 text-xl font-medium mb-2">
                  Say "Hello" or speak naturally to begin
                </p>
                <p className="text-green-500 text-lg">
                  I can detect your language automatically
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-2xl p-6">
                <h4 className="text-2xl font-bold text-blue-800 mb-3">👋 Step in Front of Camera</h4>
                <p className="text-blue-600 text-xl mb-2">AI will automatically greet you when detected</p>
                <p className="text-blue-500 text-lg">Best distance: 2-4 feet from screen</p>
              </div>
            )
          ) : (
            <div className="bg-gradient-to-r from-gray-100 to-blue-100 border-2 border-gray-300 rounded-2xl p-6">
              <h4 className="text-2xl font-bold text-gray-700 mb-3">🎯 Smart Detection System</h4>
              <p className="text-gray-600 text-xl mb-2">Automatically detects faces and starts assistance</p>
              <p className="text-gray-500 text-lg">Privacy-focused: No data stored or transmitted</p>
            </div>
          )}
        </div>

        {/* Mobile Tips */}
        <div className="md:hidden bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-4">
          <h5 className="text-yellow-800 font-bold text-lg mb-2">📱 Mobile Tips:</h5>
          <ul className="text-yellow-700 space-y-1">
            <li>• Hold device stable for best detection</li>
            <li>• Ensure good lighting</li>
            <li>• Face the camera directly</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedFaceDetectionCamera;
