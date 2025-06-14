
import { useState, useRef, useEffect, useCallback } from 'react';

interface UseAutoGreetingProps {
  onAutoGreetingTriggered?: () => void;
}

export const useAutoGreeting = ({ onAutoGreetingTriggered }: UseAutoGreetingProps) => {
  const [hasTriggeredGreeting, setHasTriggeredGreeting] = useState(false);
  const [greetingCooldown, setGreetingCooldown] = useState(false);
  const previousDetectionRef = useRef(false);
  const greetingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastGreetingTimeRef = useRef<number>(0);

  const handleFaceDetection = useCallback((detected: boolean, count: number) => {
    // If no callback is provided, don't process face detection
    if (!onAutoGreetingTriggered) {
      console.log('🚫 No auto-greeting callback provided, skipping face detection handling');
      return;
    }

    console.log('🎯 Face detection handler called:', { 
      detected, 
      count, 
      previousDetection: previousDetectionRef.current, 
      hasTriggeredGreeting, 
      greetingCooldown 
    });
    
    const currentTime = Date.now();
    const timeSinceLastGreeting = currentTime - lastGreetingTimeRef.current;
    
    // Check if this is a NEW face detection (transition from false to true)
    const isNewDetection = detected && !previousDetectionRef.current;
    
    if (isNewDetection && !hasTriggeredGreeting && !greetingCooldown) {
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
  }, [hasTriggeredGreeting, greetingCooldown, onAutoGreetingTriggered]);

  // Reset states when callback is removed
  useEffect(() => {
    if (!onAutoGreetingTriggered) {
      console.log('🔄 Auto-greeting callback removed, resetting states...');
      setHasTriggeredGreeting(false);
      setGreetingCooldown(false);
      previousDetectionRef.current = false;
      lastGreetingTimeRef.current = 0;
    }
  }, [onAutoGreetingTriggered]);

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
