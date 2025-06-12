
import React from 'react';

const VoiceInstructions: React.FC = () => {
  return (
    <div className="text-center text-sm md:text-base text-gray-600 bg-gray-50 p-4 rounded-lg">
      <p className="font-medium mb-2">🎤 Enhanced Voice Instructions:</p>
      <p>• Recording stops automatically after 3 seconds of silence</p>
      <p>• Real-time audio level monitoring with silence detection</p>
      <p>• Speak clearly and close to your device</p>
      <p>• Wait for "Processing..." before speaking again</p>
    </div>
  );
};

export default VoiceInstructions;
