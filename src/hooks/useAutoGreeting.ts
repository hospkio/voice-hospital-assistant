
import { useState, useRef, useEffect } from 'react';

interface UseAutoGreetingProps {
  onAutoGreetingTriggered?: () => void;
}

export const useAutoGreeting = ({ onAutoGreetingTriggered }: UseAutoGreetingProps) => {
  const [hasTriggeredGreeting, setHasTriggeredGreeting] = useState(false);
  const [greetingCooldown, setGreetingCooldown] = useState(false);
  const previousDetectionRef = useRef(false);
  const greetingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastGreetingTimeRef = useRef<number>(0);

  const handleFaceDetection = (detected: boolean, count: number) => {
    console.log('📊 Face detection callback triggered:', { detected, count, previousDetection: previousDetectionRef.current });
    
    const currentTime = Date.now();
    const timeSinceLastGreeting = currentTime - lastGreetingTimeRef.current;
    
    if (detected && !previousDetectionRef.current && !hasTriggeredGreeting && !greetingCooldown && onAutoGreetingTriggered) {
      if (timeSinceLastGreeting > 30000) {
        console.log('🎉 NEW FACE DETECTED! Triggering auto-greeting...');
        setHasTriggeredGreeting(true);
        setGreetingCooldown(true);
        lastGreetingTimeRef.current = currentTime;
        
        greetingTimeoutRef.current = setTimeout(() => {
          console.log('🤖 Executing auto-greeting...');
          if (onAutoGreetingTriggered) {
            onAutoGreetingTriggered();
          }
        }, 1500);
        
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
  };

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
