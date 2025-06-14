
import React from 'react';
import { Eye, Users } from 'lucide-react';
import { CardTitle } from '@/components/ui/card';

interface CameraHeaderProps {
  facesDetected: boolean;
  faceCount: number;
  isActive: boolean;
}

const CameraHeader: React.FC<CameraHeaderProps> = ({
  facesDetected,
  faceCount,
  isActive
}) => {
  return (
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
  );
};

export default CameraHeader;
