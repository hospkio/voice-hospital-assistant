
import React from 'react';
import { Sparkles } from 'lucide-react';

interface StatusInfoProps {
  isActive: boolean;
  facesDetected: boolean;
}

const StatusInfo: React.FC<StatusInfoProps> = ({ isActive, facesDetected }) => {
  if (!isActive) {
    return (
      <div className="bg-gradient-to-r from-gray-100 to-blue-100 border-2 border-gray-300 rounded-2xl p-6">
        <h4 className="text-2xl font-bold text-gray-700 mb-3">🎯 Smart Detection System</h4>
        <p className="text-gray-600 text-xl mb-2">Automatically detects faces and starts assistance</p>
        <p className="text-gray-500 text-lg">Privacy-focused: No data stored or transmitted</p>
      </div>
    );
  }

  if (facesDetected) {
    return (
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
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 rounded-2xl p-6">
      <h4 className="text-2xl font-bold text-blue-800 mb-3">👋 Step in Front of Camera</h4>
      <p className="text-blue-600 text-xl mb-2">AI will automatically greet you when detected</p>
      <p className="text-blue-500 text-lg">Best distance: 2-4 feet from screen</p>
    </div>
  );
};

export default StatusInfo;
