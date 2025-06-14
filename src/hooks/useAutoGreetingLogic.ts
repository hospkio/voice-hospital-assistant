
import { useState, useEffect } from 'react';
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

  const { textToSpeech, playAudio } = useGoogleCloudServices();

  // Set up face detection callback for auto-greeting
  useEffect(() => {
    if (!faceDetectionEnabled || !autoInteractionEnabled) {
      console.log('🚫 Face detection or auto interaction disabled, skipping callback setup', {
        faceDetectionEnabled,
        autoInteractionEnabled
      });
      
      setHasGreeted(false);
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
        timeSinceLastGreeting: Date.now() - lastGreetingTime
      });
      
      if (detected && !hasGreeted && !isOnCooldown) {
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
        setTimeout(() => {
          console.log('🔄 No face detected for a while, resetting greeting state...');
          setHasGreeted(false);
        }, FACE_DETECTION_RESET_DELAY);
      }
    });
  }, [hasGreeted, isOnCooldown, lastGreetingTime, setDetectionCallback, selectedLanguage, faceDetectionEnabled, autoInteractionEnabled]);

  const triggerAutoGreeting = async () => {
    if (hasGreeted || isOnCooldown || !faceDetectionEnabled || !autoInteractionEnabled) {
      console.log('⚠️ Greeting blocked:', { 
        hasGreeted, 
        isOnCooldown,
        faceDetectionEnabled, 
        autoInteractionEnabled 
      });
      return;
    }
    
    console.log('🤖 Starting auto-greeting sequence with language:', selectedLanguage);
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
    }
    
    // Set cooldown period
    setTimeout(() => {
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
      setHasGreeted(false);
      setIsOnCooldown(false);
      setLastGreetingTime(0);
      setGreetingMessage(
        !faceDetectionEnabled ? 'Face detection is disabled' : 
        !autoInteractionEnabled ? 'Auto interaction is disabled' : ''
      );
    }
  }, [faceDetectionEnabled, autoInteractionEnabled]);

  const resetGreeting = () => {
    console.log('🔄 Manual greeting reset');
    setGreetingMessage('');
    setHasGreeted(false);
    setIsOnCooldown(false);
    setLastGreetingTime(0);
  };

  return {
    greetingMessage,
    hasGreeted,
    resetGreeting,
    isOnCooldown,
    lastGreetingTime
  };
};
