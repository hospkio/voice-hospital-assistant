
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

const GREETING_COOLDOWN_MS = 30000; // 30 seconds cooldown between greetings
const FACE_DETECTION_RESET_DELAY = 5000; // 5 seconds after no face to reset session
const DEBOUNCE_DELAY = 1000; // 1 second debounce for face detection

export const useAutoGreetingLogic = ({
  selectedLanguage,
  faceDetectionEnabled,
  autoInteractionEnabled,
  setDetectionCallback
}: UseAutoGreetingLogicProps) => {
  const [greetingMessage, setGreetingMessage] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [lastGreetingTime, setLastGreetingTime] = useState(0);
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastDetectionStateRef = useRef(false);
  const isProcessingGreetingRef = useRef(false);

  const { textToSpeech, playAudio } = useGoogleCloudServices();

  // Set up face detection callback for auto-greeting
  useEffect(() => {
    if (!faceDetectionEnabled || !autoInteractionEnabled) {
      console.log('🚫 Face detection or auto interaction disabled, skipping callback setup', {
        faceDetectionEnabled,
        autoInteractionEnabled
      });
      
      setHasGreeted(false);
      setIsOnCooldown(false);
      setGreetingMessage(
        !faceDetectionEnabled ? 'Face detection is disabled' : 
        !autoInteractionEnabled ? 'Auto interaction is disabled' : ''
      );
      return;
    }

    console.log('🔧 Setting up face detection callback...');
    setDetectionCallback((detected: boolean, count: number) => {
      console.log('📞 Face detection callback:', { 
        detected, 
        count, 
        hasGreeted, 
        isOnCooldown,
        isProcessing: isProcessingGreetingRef.current,
        timeSinceLastGreeting: Date.now() - lastGreetingTime,
        lastDetectionState: lastDetectionStateRef.current
      });
      
      // Clear any existing debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Clear any existing reset timer if face is detected
      if (detected && resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }

      // Debounce face detection events
      debounceTimerRef.current = setTimeout(() => {
        handleDebouncedFaceDetection(detected, count);
      }, DEBOUNCE_DELAY);
    });
  }, [hasGreeted, isOnCooldown, lastGreetingTime, setDetectionCallback, selectedLanguage, faceDetectionEnabled, autoInteractionEnabled]);

  const handleDebouncedFaceDetection = (detected: boolean, count: number) => {
    const isNewFaceDetection = detected && !lastDetectionStateRef.current;
    
    console.log('🎯 Debounced face detection:', {
      detected,
      count,
      isNewFaceDetection,
      hasGreeted,
      isOnCooldown,
      isProcessing: isProcessingGreetingRef.current
    });

    if (isNewFaceDetection && !hasGreeted && !isOnCooldown && !isProcessingGreetingRef.current) {
      const timeSinceLastGreeting = Date.now() - lastGreetingTime;
      
      if (timeSinceLastGreeting > GREETING_COOLDOWN_MS) {
        console.log('👥 New user detected! Triggering auto-greeting...');
        triggerAutoGreeting();
      } else {
        console.log('⏰ Greeting on cooldown, remaining:', GREETING_COOLDOWN_MS - timeSinceLastGreeting);
      }
    }
    
    // Reset greeting state when no face is detected for a while
    if (!detected && hasGreeted) {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
      
      resetTimerRef.current = setTimeout(() => {
        console.log('🔄 No face detected for a while, resetting greeting state...');
        setHasGreeted(false);
        setGreetingMessage('');
      }, FACE_DETECTION_RESET_DELAY);
    }

    lastDetectionStateRef.current = detected;
  };

  const triggerAutoGreeting = async () => {
    if (hasGreeted || isOnCooldown || !faceDetectionEnabled || !autoInteractionEnabled || isProcessingGreetingRef.current) {
      console.log('⚠️ Greeting blocked:', { 
        hasGreeted, 
        isOnCooldown,
        faceDetectionEnabled, 
        autoInteractionEnabled,
        isProcessing: isProcessingGreetingRef.current
      });
      return;
    }
    
    console.log('🤖 Starting auto-greeting sequence with language:', selectedLanguage);
    
    // Set processing flag to prevent multiple simultaneous greetings
    isProcessingGreetingRef.current = true;
    setHasGreeted(true);
    setIsOnCooldown(true);
    setLastGreetingTime(Date.now());
    
    const currentGreeting = greetings[selectedLanguage] || greetings['en-US'];
    setGreetingMessage(`Auto-greeting (${selectedLanguage}): ${currentGreeting}`);
    
    try {
      console.log('🔊 Generating TTS for greeting in language:', selectedLanguage);
      const ttsResponse = await textToSpeech(currentGreeting, selectedLanguage);
      if (ttsResponse.success && ttsResponse.audioContent) {
        console.log('🔊 Playing greeting audio in', selectedLanguage);
        await playAudio(ttsResponse.audioContent);
      }
      
      console.log('✅ Auto-greeting completed. User must manually press microphone to start voice interaction.');
      
    } catch (error) {
      console.error('Error in auto-greeting:', error);
    } finally {
      // Clear processing flag
      isProcessingGreetingRef.current = false;
    }
    
    // Set cooldown period
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
    }
    
    cooldownTimerRef.current = setTimeout(() => {
      console.log('🟢 Greeting cooldown ended');
      setIsOnCooldown(false);
    }, GREETING_COOLDOWN_MS);
  };

  // Reset greeting state when either setting is disabled
  useEffect(() => {
    if (!faceDetectionEnabled || !autoInteractionEnabled) {
      console.log('🔄 Settings changed, resetting greeting state...', {
        faceDetectionEnabled,
        autoInteractionEnabled
      });
      
      // Clear all timers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
      
      setHasGreeted(false);
      setIsOnCooldown(false);
      setLastGreetingTime(0);
      isProcessingGreetingRef.current = false;
      lastDetectionStateRef.current = false;
      setGreetingMessage(
        !faceDetectionEnabled ? 'Face detection is disabled' : 
        !autoInteractionEnabled ? 'Auto interaction is disabled' : ''
      );
    }
  }, [faceDetectionEnabled, autoInteractionEnabled]);

  const resetGreeting = () => {
    console.log('🔄 Manual greeting reset');
    
    // Clear all timers
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    
    setGreetingMessage('');
    setHasGreeted(false);
    setIsOnCooldown(false);
    setLastGreetingTime(0);
    isProcessingGreetingRef.current = false;
    lastDetectionStateRef.current = false;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  return {
    greetingMessage,
    hasGreeted,
    resetGreeting,
    isOnCooldown,
    lastGreetingTime
  };
};
