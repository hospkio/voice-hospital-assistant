
import React from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceControlButtonProps {
  isListening: boolean;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
}

const VoiceControlButton: React.FC<VoiceControlButtonProps> = ({
  isListening,
  isLoading,
  onStart,
  onStop
}) => {
  return (
    <div className="flex justify-center">
      <Button
        onClick={isListening ? onStop : onStart}
        disabled={isLoading}
        size="lg"
        className={`h-24 w-24 md:h-28 md:w-28 rounded-full text-white transition-all duration-300 shadow-lg ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' 
            : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-10 w-10 md:h-12 md:w-12 animate-spin" />
        ) : isListening ? (
          <Square className="h-10 w-10 md:h-12 md:w-12" />
        ) : (
          <Mic className="h-10 w-10 md:h-12 md:w-12" />
        )}
      </Button>
    </div>
  );
};

export default VoiceControlButton;
