
import { useState, useCallback, useRef } from 'react';
import { AUTO_GREETING_CONSTANTS, greetings } from './constants';
import { AutoGreetingState, SessionRefs } from './types';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';

interface UseSessionManagerProps {
  selectedLanguage: string;
  sessionRefs: SessionRefs;
  sessionTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  cooldownTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
  clearAllTimers: () => void;
}

export const useSessionManager = ({
  selectedLanguage,
  sessionRefs,
  sessionTimeoutRef,
  cooldownTimeoutRef,
  clearAllTimers
}: UseSessionManagerProps) => {
  const [state, setState] = useState<AutoGreetingState>({
    greetingMessage: '',
    hasGreeted: false,
    isOnCooldown: false,
    lastGreetingTime: 0
  });

  const { textToSpeech, playAudio } = useGoogleCloudServices();
  const greetingInProgressRef = useRef(false);

  const resetSession = useCallback(() => {
    console.log('🔄 Resetting greeting session');
    clearAllTimers();
    sessionRefs.sessionActiveRef.current = false;
    sessionRefs.faceDetectedRef.current = false;
    greetingInProgressRef.current = false;
    setState({
      greetingMessage: '',
      hasGreeted: false,
      isOnCooldown: false,
      lastGreetingTime: 0
    });
  }, [clearAllTimers, sessionRefs]);

  const startNewSession = useCallback(async () => {
    if (sessionRefs.sessionActiveRef.current || greetingInProgressRef.current) {
      console.log('⚠️ Session already active or greeting in progress, skipping');
      return;
    }

    // Prevent multiple simultaneous greetings
    greetingInProgressRef.current = true;

    console.log('🎉 Starting new user session - triggering greeting');
    sessionRefs.sessionActiveRef.current = true;
    sessionRefs.lastGreetingTimeRef.current = Date.now();

    const currentGreeting = greetings[selectedLanguage] || greetings['en-US'];
    
    setState(prev => ({
      ...prev,
      hasGreeted: true,
      isOnCooldown: true,
      lastGreetingTime: Date.now(),
      greetingMessage: `Auto-greeting (${selectedLanguage}): ${currentGreeting}`
    }));

    try {
      console.log('🔊 Playing greeting audio...');
      const ttsResponse = await textToSpeech(currentGreeting, selectedLanguage);
      if (ttsResponse.success && ttsResponse.audioContent) {
        await playAudio(ttsResponse.audioContent);
      }
      console.log('✅ Greeting played successfully');
    } catch (error) {
      console.error('❌ Error playing greeting:', error);
    } finally {
      greetingInProgressRef.current = false;
    }

    sessionTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Session duration expired, ending session');
      resetSession();
    }, AUTO_GREETING_CONSTANTS.SESSION_DURATION_MS);

    cooldownTimeoutRef.current = setTimeout(() => {
      console.log('🟢 Cooldown period ended');
      setState(prev => ({ ...prev, isOnCooldown: false }));
    }, AUTO_GREETING_CONSTANTS.COOLDOWN_DURATION_MS);
  }, [selectedLanguage, sessionRefs, textToSpeech, playAudio, sessionTimeoutRef, cooldownTimeoutRef, resetSession]);

  return {
    state,
    setState,
    resetSession,
    startNewSession
  };
};
