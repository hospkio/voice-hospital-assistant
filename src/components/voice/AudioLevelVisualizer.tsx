
import React from 'react';

interface AudioLevelVisualizerProps {
  isListening: boolean;
  audioLevel: number;
  silenceTimer: number;
  silenceDuration: number;
}

const AudioLevelVisualizer: React.FC<AudioLevelVisualizerProps> = ({
  isListening,
  audioLevel,
  silenceTimer,
  silenceDuration
}) => {
  if (!isListening) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-center items-end space-x-2 h-16">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-3 md:w-4 bg-gradient-to-t from-blue-500 to-green-400 rounded-full transition-all duration-150"
            style={{
              height: `${Math.max(8, (audioLevel / 255) * 60 + Math.random() * 10)}px`,
            }}
          />
        ))}
      </div>
      
      {silenceTimer > 0 && (
        <div className="text-center bg-orange-100 border border-orange-300 rounded-lg p-3">
          <p className="text-orange-700 font-medium">
            🔇 Silence detected: {(silenceTimer/1000).toFixed(1)}s
          </p>
          <p className="text-orange-600 text-sm">
            Auto-stops in {Math.max(0, (silenceDuration - silenceTimer)/1000).toFixed(1)}s
          </p>
        </div>
      )}
    </div>
  );
};

export default AudioLevelVisualizer;
