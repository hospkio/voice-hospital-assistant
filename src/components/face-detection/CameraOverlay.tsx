
import React from 'react';
import { EyeOff, Sparkles, Zap } from 'lucide-react';

interface CameraOverlayProps {
  isActive: boolean;
  isLoading: boolean;
  facesDetected: boolean;
  greetingCooldown: boolean;
}

const CameraOverlay: React.FC<CameraOverlayProps> = ({
  isActive,
  isLoading,
  facesDetected,
  greetingCooldown
}) => {
  if (isActive && !isLoading) {
    return (
      <>
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
      </>
    );
  }

  if (!isActive && !isLoading) {
    return (
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
    );
  }

  if (isLoading) {
    return (
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
    );
  }

  return null;
};

export default CameraOverlay;
