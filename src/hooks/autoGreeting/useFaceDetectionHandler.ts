
import { useCallback } from 'react';
import { AUTO_GREETING_CONSTANTS } from './constants';
import { SessionRefs } from './types';

interface UseFaceDetectionHandlerProps {
  sessionRefs: SessionRefs;
  resetTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  startNewSession: () => Promise<void>;
  resetSession: () => void;
}

export const useFaceDetectionHandler = ({
  sessionRefs,
  resetTimeoutRef,
  startNewSession,
  resetSession
}: UseFaceDetectionHandlerProps) => {
  
  const handleFaceDetection = useCallback((detected: boolean, count: number) => {
    const wasDetected = sessionRefs.faceDetectedRef.current;
    sessionRefs.faceDetectedRef.current = detected;

    console.log('👥 Face detection:', { 
      detected, 
      count, 
      wasDetected, 
      sessionActive: sessionRefs.sessionActiveRef.current
    });

    // Clear reset timer if face is detected
    if (detected && resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    // New face detected - start session if not already active
    if (detected && !wasDetected && !sessionRefs.sessionActiveRef.current) {
      const timeSinceLastGreeting = Date.now() - sessionRefs.lastGreetingTimeRef.current;
      
      if (timeSinceLastGreeting > AUTO_GREETING_CONSTANTS.COOLDOWN_DURATION_MS) {
        console.log('🆕 New user detected, starting session');
        startNewSession();
      } else {
        console.log('⏰ Still in global cooldown, ignoring new user');
      }
    }

    // Face lost - start reset timer
    if (!detected && wasDetected && sessionRefs.sessionActiveRef.current) {
      console.log('👋 Face lost, starting reset timer');
      resetTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Face lost timeout reached, resetting session');
        resetSession();
      }, AUTO_GREETING_CONSTANTS.FACE_LOST_RESET_DELAY);
    }
  }, [sessionRefs, resetTimeoutRef, startNewSession, resetSession]);

  return { handleFaceDetection };
};
