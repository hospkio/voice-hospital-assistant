
import React from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraControlButtonProps {
  isActive: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

const CameraControlButton: React.FC<CameraControlButtonProps> = ({
  isActive,
  isLoading,
  onToggle
}) => {
  return (
    <Button
      onClick={onToggle}
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
  );
};

export default CameraControlButton;
