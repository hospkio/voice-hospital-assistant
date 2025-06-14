
import { useState, useRef, useEffect, useCallback } from 'react';

interface UseAutoGreetingProps {
  onAutoGreetingTriggered?: () => void;
  autoInteractionEnabled?: boolean; // Add this prop
}

export const useAutoGreeting = ({ onAutoGreetingTriggered, autoInteractionEnabled = true }: UseAutoGreetingProps) => {
  const [hasTriggeredGreeting, setHasTriggeredGreeting] = useState(false);
  const [greetingCooldown, setGreetingCooldown] = useState(false);
  const previousDetectionRef = useRef(false);
  const greetingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastGreetingTimeRef = useRef<number>(0);

  const handleFaceDetection = useCallback((detected: boolean, count: number) => {
    // If no callback is provided OR auto interaction is disabled, don't process face detection
    if (!onAutoGreetingTriggered || !autoInteractionEnabled) {
      console.log('🚫 Auto-greeting disabled, skipping face detection handling', {
        hasCallback: !!onAutoGreetingTriggered,
        autoInteractionEnabled
      });
      return;
    }

    console.log('🎯 Face detection handler called:', { 
      detected, 
      count, 
      previousDetection: previousDetectionRef.current, 
      hasTriggeredGreeting, 
      greetingCooldown,
      autoInteractionEnabled
    });
    
    const currentTime = Date.now();
    const timeSinceLastGreeting = currentTime - lastGreetingTimeRef.current;
    
    // Check if this is a NEW face detection (transition from false to true)
    const isNewDetection = detected && !previousDetectionRef.current;
    
    if (isNewDetection && !hasTriggeredGreeting && !greetingCooldown && autoInteractionEnabled) {
      if (timeSinceLastGreeting > 30000) {
        console.log('🎉 NEW FACE DETECTED! Triggering auto-greeting...');
        setHasTriggeredGreeting(true);
        setGreetingCooldown(true);
        lastGreetingTimeRef.current = currentTime;
        
        // Trigger greeting immediately
        console.log('🤖 Executing auto-greeting now...');
        onAutoGreetingTriggered();
        
        // Reset flags after delays
        setTimeout(() => {
          setHasTriggeredGreeting(false);
          console.log('🔄 Greeting trigger reset');
        }, 45000);
        
        setTimeout(() => {
          setGreetingCooldown(false);
          console.log('🟢 Greeting cooldown ended');
        }, 15000);
      } else {
        console.log('⏰ Auto-greeting on cooldown, time since last:', timeSinceLastGreeting);
      }
    }
    
    previousDetectionRef.current = detected;
  }, [hasTriggeredGreeting, greetingCooldown, onAutoGreetingTriggered, autoInteractionEnabled]);

  // Reset states when callback is removed OR auto interaction is disabled
  useEffect(() => {
    if (!onAutoGreetingTriggered || !autoInteractionEnabled) {
      console.log('🔄 Auto-greeting disabled, resetting states...', {
        hasCallback: !!onAutoGreetingTriggered,
        autoInteractionEnabled
      });
      setHasTriggeredGreeting(false);
      setGreetingCooldown(false);
      previousDetectionRef.current = false;
      lastGreetingTimeRef.current = 0;
    }
  }, [onAutoGreetingTriggered, autoInteractionEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (greetingTimeoutRef.current) {
        clearTimeout(greetingTimeoutRef.current);
      }
    };
  }, []);

  return {
    hasTriggeredGreeting,
    greetingCooldown,
    handleFaceDetection
  };
};
