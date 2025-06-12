
import React from 'react';

interface VoiceStatusDisplayProps {
  isListening: boolean;
  isLoading: boolean;
}

const VoiceStatusDisplay: React.FC<VoiceStatusDisplayProps> = ({
  isListening,
  isLoading
}) => {
  return (
    <div className="text-center space-y-3">
      <p className={`text-xl md:text-2xl font-bold ${
        isListening ? 'text-red-600' : isLoading ? 'text-blue-600' : 'text-gray-700'
      }`}>
        {isLoading ? 'Processing Speech...' : 
         isListening ? 'Listening... (Auto-stops on silence)' : 
         'Touch to Speak'}
      </p>
      
      {!isListening && !isLoading && (
        <p className="text-gray-500 text-lg md:text-xl">
          🎤 Tap microphone and speak clearly
        </p>
      )}
    </div>
  );
};

export default VoiceStatusDisplay;
