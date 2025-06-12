
import React from 'react';
import { Sparkles } from 'lucide-react';

interface WelcomeBannerProps {
  facesDetected: boolean;
  currentResponse: any;
}

const WelcomeBanner: React.FC<WelcomeBannerProps> = ({ facesDetected, currentResponse }) => {
  if (facesDetected || currentResponse) {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 p-1 rounded-3xl shadow-2xl">
      <div className="bg-white rounded-2xl p-8 md:p-12 text-center relative">
        <div className="absolute top-4 right-4 text-6xl opacity-20">🏥</div>
        <div className="flex items-center justify-center space-x-4 mb-6">
          <Sparkles className="h-12 w-12 text-purple-500 animate-pulse" />
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
            Welcome to MediCare Smart Kiosk
          </h2>
          <Sparkles className="h-12 w-12 text-purple-500 animate-pulse" />
        </div>
        
        <p className="text-xl md:text-2xl text-gray-700 mb-8 font-medium">
          🤖 Your Intelligent Healthcare Assistant with AI-Powered Voice Recognition
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-all">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-blue-800 mb-2">Smart Detection</h3>
            <p className="text-blue-600">Automatically detects when you approach and starts conversation</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 hover:shadow-lg transition-all">
            <div className="text-4xl mb-4">🗣️</div>
            <h3 className="text-xl font-bold text-green-800 mb-2">Multi-Language</h3>
            <p className="text-green-600">Speaks your language automatically - English, Hindi, Tamil & more</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200 hover:shadow-lg transition-all">
            <div className="text-4xl mb-4">🏥</div>
            <h3 className="text-xl font-bold text-purple-800 mb-2">Complete Help</h3>
            <p className="text-purple-600">Directions, appointments, department info & emergency assistance</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBanner;
