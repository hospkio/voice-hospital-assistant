
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

export const useAutoGreetingLogic = ({
  selectedLanguage,
  faceDetectionEnabled,
  autoInteractionEnabled,
  setDetectionCallback
}: UseAutoGreetingLogicProps) => {
  const [greetingMessage, setGreetingMessage] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);

  const { textToSpeech, playAudio } = useGoogleCloudServices();

  // Set up face detection callback for auto-greeting
  useEffect(() => {
    if (!faceDetectionEnabled || !autoInteractionEnabled) {
      console.log('🚫 Face detection or auto interaction disabled in Phase5, skipping callback setup', {
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

    console.log('🔧 Setting up face detection callback in Phase5...');
    setDetectionCallback((detected: boolean, count: number) => {
      console.log('📞 Phase5 received face detection callback:', { 
        detected, 
        count, 
        hasGreeted, 
        selectedLanguage, 
        faceDetectionEnabled,
        autoInteractionEnabled 
      });
      
      if (detected && !hasGreeted && faceDetectionEnabled && autoInteractionEnabled) {
        console.log('👥 Face detected in Phase5! Triggering auto-greeting...');
        triggerAutoGreeting();
      }
    });
  }, [hasGreeted, setDetectionCallback, selectedLanguage, faceDetectionEnabled, autoInteractionEnabled]);

  const triggerAutoGreeting = async () => {
    if (hasGreeted || !faceDetectionEnabled || !autoInteractionEnabled) {
      console.log('⚠️ Greeting blocked:', { 
        hasGreeted, 
        faceDetectionEnabled, 
        autoInteractionEnabled 
      });
      return;
    }
    
    console.log('🤖 Starting auto-greeting sequence with language:', selectedLanguage);
    setHasGreeted(true);
    
    const currentGreeting = greetings[selectedLanguage] || greetings['en-US'];
    setGreetingMessage(`Auto-greeting (${selectedLanguage}): ${currentGreeting}`);
    
    try {
      console.log('🔊 Generating TTS for greeting in language:', selectedLanguage);
      const ttsResponse = await textToSpeech(currentGreeting, selectedLanguage);
      if (ttsResponse.success && ttsResponse.audioContent) {
        console.log('🔊 Playing greeting audio in', selectedLanguage);
        await playAudio(ttsResponse.audioContent);
      }
      
      // REMOVED: Automatic recording trigger after greeting
      // Users must now manually press the microphone button to start voice interaction
      console.log('✅ Auto-greeting completed. User must manually press microphone to start voice interaction.');
      
    } catch (error) {
      console.error('Error in auto-greeting:', error);
    }
  };

  // Reset greeting state when either setting is disabled
  useEffect(() => {
    if (!faceDetectionEnabled || !autoInteractionEnabled) {
      console.log('🔄 Settings changed, resetting greeting state...', {
        faceDetectionEnabled,
        autoInteractionEnabled
      });
      setHasGreeted(false);
      setGreetingMessage(
        !faceDetectionEnabled ? 'Face detection is disabled' : 
        !autoInteractionEnabled ? 'Auto interaction is disabled' : ''
      );
    }
  }, [faceDetectionEnabled, autoInteractionEnabled]);

  const resetGreeting = () => {
    setGreetingMessage('');
    setHasGreeted(false);
  };

  return {
    greetingMessage,
    hasGreeted,
    resetGreeting
  };
};
