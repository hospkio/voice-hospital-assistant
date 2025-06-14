
import { useState, useEffect, useRef } from 'react';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';

interface UseAutoGreetingLogicProps {
  selectedLanguage: string;
  faceDetectionEnabled: boolean;
  autoInteractionEnabled: boolean;
  setDetectionCallback: (callback: (detected: boolean, count: number) => void) => void;
}

const greetings = {
  'en-US': 'Hello! Welcome to our hospital. How can I help you today?',
  'hi-IN': 'नमस्ते! हमारे अस्पताल में आपका स्वागत है। आज मैं आपकी कैसे सहायता कर सकता हूं?',
  'ml-IN': 'നമസ്കാരം! ഞങ്ങളുടെ ആശുപത്രിയിലേക്ക് സ്വാഗതം. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?',
  'ta-IN': 'வணக்கம்! எங்கள் மருத்துவமனைக்கு வரவேற்கிறோம். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?'
};

const SESSION_DURATION_MS = 60000; // 60 seconds - how long to remember a user session
const COOLDOWN_DURATION_MS = 30000; // 30 seconds between greetings
const FACE_LOST_RESET_DELAY = 8000; // 8 seconds after face lost to end session

export const useAutoGreetingLogic = ({
  selectedLanguage,
  faceDetectionEnabled,
  autoInteractionEnabled,
  setDetectionCallback
}: UseAutoGreetingLogicProps) => {
  const [greetingMessage, setGreetingMessage] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  
  // Session and state management
  const sessionActiveRef = useRef(false);
  const lastGreetingTimeRef = useRef(0);
  const faceDetectedRef = useRef(false);
  const callbackSetRef = useRef(false);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { textToSpeech, playAudio } = useGoogleCloudServices();

  // Clean up all timers
  const clearAllTimers = () => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    if (cooldownTimeoutRef.current) {
      clearTimeout(cooldownTimeoutRef.current);
      cooldownTimeoutRef.current = null;
    }
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }
  };

  // Reset session completely
  const resetSession = () => {
    console.log('🔄 Resetting greeting session');
    clearAllTimers();
    sessionActiveRef.current = false;
    faceDetectedRef.current = false;
    setHasGreeted(false);
    setIsOnCooldown(false);
    setGreetingMessage('');
  };

  // Start a new user session
  const startNewSession = async () => {
    if (sessionActiveRef.current) {
      console.log('⚠️ Session already active, skipping greeting');
      return;
    }

    console.log('🎉 Starting new user session - triggering greeting');
    sessionActiveRef.current = true;
    setHasGreeted(true);
    setIsOnCooldown(true);
    lastGreetingTimeRef.current = Date.now();

    const currentGreeting = greetings[selectedLanguage] || greetings['en-US'];
    setGreetingMessage(`Auto-greeting (${selectedLanguage}): ${currentGreeting}`);

    try {
      console.log('🔊 Playing greeting audio...');
      const ttsResponse = await textToSpeech(currentGreeting, selectedLanguage);
      if (ttsResponse.success && ttsResponse.audioContent) {
        await playAudio(ttsResponse.audioContent);
      }
      console.log('✅ Greeting played successfully');
    } catch (error) {
      console.error('❌ Error playing greeting:', error);
    }

    // Set session duration timer
    sessionTimeoutRef.current = setTimeout(() => {
      console.log('⏰ Session duration expired, ending session');
      resetSession();
    }, SESSION_DURATION_MS);

    // Set cooldown timer
    cooldownTimeoutRef.current = setTimeout(() => {
      console.log('🟢 Cooldown period ended');
      setIsOnCooldown(false);
    }, COOLDOWN_DURATION_MS);
  };

  // Handle face detection events
  const handleFaceDetection = (detected: boolean, count: number) => {
    const wasDetected = faceDetectedRef.current;
    faceDetectedRef.current = detected;

    console.log('👥 Face detection:', { 
      detected, 
      count, 
      wasDetected, 
      sessionActive: sessionActiveRef.current,
      hasGreeted,
      isOnCooldown
    });

    // Clear reset timer if face is detected
    if (detected && resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = null;
    }

    // New face detected - start session if not already active
    if (detected && !wasDetected && !sessionActiveRef.current) {
      const timeSinceLastGreeting = Date.now() - lastGreetingTimeRef.current;
      
      if (timeSinceLastGreeting > COOLDOWN_DURATION_MS) {
        console.log('🆕 New user detected, starting session');
        startNewSession();
      } else {
        console.log('⏰ Still in global cooldown, ignoring new user');
      }
    }

    // Face lost - start reset timer
    if (!detected && wasDetected && sessionActiveRef.current) {
      console.log('👋 Face lost, starting reset timer');
      resetTimeoutRef.current = setTimeout(() => {
        console.log('🔄 Face lost timeout reached, resetting session');
        resetSession();
      }, FACE_LOST_RESET_DELAY);
    }
  };

  // Set up detection callback
  useEffect(() => {
    if (!faceDetectionEnabled || !autoInteractionEnabled) {
      console.log('🚫 Auto-greeting disabled, resetting session');
      resetSession();
      callbackSetRef.current = false;
      setGreetingMessage(
        !faceDetectionEnabled ? 'Face detection is disabled' : 
        !autoInteractionEnabled ? 'Auto interaction is disabled' : ''
      );
      return;
    }

    if (callbackSetRef.current) {
      console.log('🔗 Callback already set, skipping');
      return;
    }

    console.log('🔧 Setting up face detection callback for auto-greeting');
    callbackSetRef.current = true;
    setDetectionCallback(handleFaceDetection);
  }, [faceDetectionEnabled, autoInteractionEnabled, setDetectionCallback]);

  // Reset when settings change
  useEffect(() => {
    if (!faceDetectionEnabled || !autoInteractionEnabled) {
      resetSession();
      callbackSetRef.current = false;
    }
  }, [faceDetectionEnabled, autoInteractionEnabled]);

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
  }, []);

  return {
    greetingMessage,
    hasGreeted,
    resetGreeting,
    isOnCooldown,
    lastGreetingTime: lastGreetingTimeRef.current
  };
};
