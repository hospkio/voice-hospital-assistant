
import { useEffect, useRef } from 'react';
import { UseAutoGreetingLogicProps } from './autoGreeting/types';
import { useTimerManager } from './autoGreeting/useTimerManager';
import { useSessionManager } from './autoGreeting/useSessionManager';
import { useFaceDetectionHandler } from './autoGreeting/useFaceDetectionHandler';

export const useAutoGreetingLogic = ({
  selectedLanguage,
  faceDetectionEnabled,
  autoInteractionEnabled,
  setDetectionCallback
}: UseAutoGreetingLogicProps) => {
  // Session and state management refs
  const sessionActiveRef = useRef(false);
  const lastGreetingTimeRef = useRef(0);
  const faceDetectedRef = useRef(false);
  const callbackSetRef = useRef(false);

  const sessionRefs = {
    sessionActiveRef,
    lastGreetingTimeRef,
    faceDetectedRef,
    callbackSetRef
  };

  // Timer management
  const { sessionTimeoutRef, cooldownTimeoutRef, resetTimeoutRef, clearAllTimers } = useTimerManager();

  // Session management
  const { state, setState, resetSession, startNewSession } = useSessionManager({
    selectedLanguage,
    sessionRefs,
    sessionTimeoutRef,
    cooldownTimeoutRef,
    clearAllTimers
  });

  // Face detection handling
  const { handleFaceDetection } = useFaceDetectionHandler({
    sessionRefs,
    resetTimeoutRef,
    startNewSession,
    resetSession
  });

  // Set up detection callback
  useEffect(() => {
    if (!faceDetectionEnabled || !autoInteractionEnabled) {
      console.log('🚫 Auto-greeting disabled, resetting session');
      resetSession();
      callbackSetRef.current = false;
      setState(prev => ({
        ...prev,
        greetingMessage: !faceDetectionEnabled ? 'Face detection is disabled' : 
                        !autoInteractionEnabled ? 'Auto interaction is disabled' : ''
      }));
      return;
    }

    if (callbackSetRef.current) {
      console.log('🔗 Callback already set, skipping');
      return;
    }

    console.log('🔧 Setting up face detection callback for auto-greeting');
    callbackSetRef.current = true;
    setDetectionCallback(handleFaceDetection);
  }, [faceDetectionEnabled, autoInteractionEnabled, setDetectionCallback, handleFaceDetection, resetSession, setState]);

  // Reset when settings change
  useEffect(() => {
    if (!faceDetectionEnabled || !autoInteractionEnabled) {
      resetSession();
      callbackSetRef.current = false;
    }
  }, [faceDetectionEnabled, autoInteractionEnabled, resetSession]);

  // Manual reset function
  const resetGreeting = () => {
    console.log('🔄 Manual greeting reset');
    resetSession();
    callbackSetRef.current = false;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    greetingMessage: state.greetingMessage,
    hasGreeted: state.hasGreeted,
    resetGreeting,
    isOnCooldown: state.isOnCooldown,
    lastGreetingTime: state.lastGreetingTime
  };
};
