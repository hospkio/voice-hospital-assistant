
import React, { useEffect } from 'react';
import KioskHeader from '@/components/KioskHeader';
import KioskFooter from '@/components/KioskFooter';
import MainKioskInterface from '@/components/MainKioskInterface';
import AppointmentBookingModal from '@/components/AppointmentBookingModal';
import { useKioskState } from '@/hooks/useKioskState';
import { useDialogflowCXService } from '@/hooks/useDialogflowCXService';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';
import { useAutoLanguageDetection } from '@/hooks/useAutoLanguageDetection';
import { useToast } from '@/hooks/use-toast';
import { hospitalDataService } from '@/services/hospitalDataService';

const EnhancedKiosk = () => {
  const { toast } = useToast();
  const { state, updateState } = useKioskState();
  const { processWithDialogflowCX } = useDialogflowCXService();
  const { textToSpeech, playAudio } = useGoogleCloudServices();
  const { startListening: detectLanguage } = useAutoLanguageDetection();

  // Welcome message on load
  useEffect(() => {
    const welcomeMessage = {
      responseText: "Welcome to MediCare Smart Kiosk! Your intelligent healthcare assistant with advanced AI and voice recognition. I can help you with directions, appointments, and hospital information in multiple languages.",
      intent: 'welcome',
      entities: {},
      confidence: 1.0,
      responseTime: 0,
      responseData: { type: 'welcome' },
      success: true
    };
    updateState({ currentResponse: welcomeMessage });
  }, []);

  const handleAutoGreeting = async () => {
    console.log('Auto-greeting triggered by face detection');
    updateState({ isAutoDetecting: true });
    
    const greetings = {
      'en-US': "Hello! Welcome to MediCare Hospital. I'm your AI assistant here to help you with directions, appointments, and information. How may I assist you today?",
      'ta-IN': "வணக்கம்! மெடிகேர் மருத்துவமனைக்கு வரவேற்கிறோம். திசைகள், அப்பாயிண்ட்மென்ட்கள் மற்றும் தகவல்களுக்கு நான் உங்கள் AI உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      'ml-IN': "നമസ്കാരം! മെഡികെയർ ഹോസ്പിറ്റലിലേക്ക് സ്വാഗതം. ദിശകൾ, അപ്പോയിന്റ്മെന്റുകൾ, വിവരങ്ങൾ എന്നിവയിൽ സഹായിക്കാൻ ഞാൻ നിങ്ങളുടെ AI അസിസ്റ്റന്റാണ്. ഇന്ന് എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?",
      'hi-IN': "नमस्ते! मेडिकेयर अस्पताल में आपका स्वागत है। दिशा-निर्देश, अपॉइंटमेंट और जानकारी के लिए मैं आपका AI सहायक हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?"
    };

    try {
      console.log('Playing greeting and showing toast');
      
      toast({
        title: "👋 Face detected!",
        description: "Welcome! I'm ready to help you. Please speak to start.",
        duration: 4000,
      });

      const greeting = greetings[state.selectedLanguage] || greetings['en-US'];
      
      const greetingResponse = {
        responseText: greeting,
        intent: 'auto-greeting',
        entities: {},
        confidence: 1.0,
        responseTime: 0,
        responseData: { type: 'auto-greeting', triggered: 'face-detection' },
        success: true
      };

      updateState({ 
        currentResponse: greetingResponse,
        conversationHistory: [...state.conversationHistory, {
          type: 'assistant',
          content: greeting,
          timestamp: new Date(),
          intent: 'auto-greeting',
          confidence: 1.0,
          trigger: 'face-detection'
        }],
        lastGreetingTime: Date.now()
      });

      console.log('Attempting to play greeting audio');
      const ttsResult = await textToSpeech(greeting, state.selectedLanguage);
      if (ttsResult.success && ttsResult.audioContent) {
        console.log('Playing greeting audio');
        await playAudio(ttsResult.audioContent);
        console.log('Greeting audio played successfully');
      } else {
        console.error('TTS failed:', ttsResult.error);
      }

      // Wait a moment then start listening for user response
      setTimeout(async () => {
        try {
          console.log('Starting automatic language detection');
          updateState({ isListening: true });
          
          const languageResult = await detectLanguage();
          if (languageResult && languageResult.transcript) {
            console.log('Detected speech:', languageResult);
            updateState({ selectedLanguage: languageResult.detectedLanguage });
            await handleVoiceInput(languageResult.transcript, languageResult.confidence, languageResult.detectedLanguage);
          }
        } catch (error) {
          console.log('No speech detected during auto-detection phase:', error);
        } finally {
          updateState({ isAutoDetecting: false, isListening: false });
        }
      }, 3000);

    } catch (error) {
      console.error('Auto-greeting error:', error);
      updateState({ isAutoDetecting: false });
      
      toast({
        title: "⚠️ Audio Error",
        description: "Face detected but audio playback failed. Please check your speakers.",
        variant: "destructive",
      });
    }
  };

  const handleVoiceInput = async (transcript: string, confidence: number, detectedLanguage: string) => {
    console.log('Voice input received:', { transcript, confidence, detectedLanguage });
    
    if (detectedLanguage !== state.selectedLanguage) {
      updateState({ selectedLanguage: detectedLanguage });
      console.log('Language switched to:', detectedLanguage);
    }
    
    await hospitalDataService.createOrUpdateKioskSession(state.sessionId, detectedLanguage);
    
    const newHistory = [...state.conversationHistory, {
      type: 'user',
      content: transcript,
      timestamp: new Date(),
      language: detectedLanguage,
      confidence
    }];

    const dialogflowResponse = await processWithDialogflowCX(transcript, state.sessionId, detectedLanguage);
    
    if (dialogflowResponse.intent?.toLowerCase().includes('appointment')) {
      updateState({ showAppointmentModal: true });
    }
    
    let selectedDepartment = state.selectedDepartment;
    if (dialogflowResponse.responseData?.department) {
      selectedDepartment = dialogflowResponse.responseData.department;
    }
    
    updateState({
      currentResponse: dialogflowResponse,
      selectedDepartment,
      conversationHistory: [...newHistory, {
        type: 'assistant',
        content: dialogflowResponse.responseText,
        timestamp: new Date(),
        intent: dialogflowResponse.intent,
        confidence: dialogflowResponse.confidence
      }]
    });

    // Auto-play response
    try {
      const ttsResult = await textToSpeech(dialogflowResponse.responseText, detectedLanguage);
      if (ttsResult.success && ttsResult.audioContent) {
        await playAudio(ttsResult.audioContent);
      }
    } catch (error) {
      console.error('Response audio playback failed:', error);
    }

    toast({
      title: "🎤 Voice processed",
      description: `Language: ${detectedLanguage} (${Math.round(confidence * 100)}% confidence)`,
    });
  };

  const handleFaceDetection = (detected: boolean, count: number) => {
    updateState({ facesDetected: detected, faceCount: count });
  };

  const handleQuickAction = async (query: string) => {
    await handleVoiceInput(query, 1.0, state.selectedLanguage);
  };

  const handleDepartmentSelect = (department: string) => {
    updateState({ selectedDepartment: department });
    handleQuickAction(`Tell me about ${department} department and show me directions`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col touch-manipulation">
      <KioskHeader
        facesDetected={state.facesDetected}
        faceCount={state.faceCount}
        selectedLanguage={state.selectedLanguage}
        autoInteractionEnabled={state.autoInteractionEnabled}
        onLanguageChange={(lang) => updateState({ selectedLanguage: lang })}
        onToggleAutoInteraction={() => updateState({ 
          autoInteractionEnabled: !state.autoInteractionEnabled 
        })}
      />

      <MainKioskInterface
        state={state}
        isListening={state.isListening}
        onVoiceData={handleVoiceInput}
        onListeningChange={(listening) => updateState({ isListening: listening })}
        onFaceDetected={handleFaceDetection}
        onQuickAction={handleQuickAction}
        onDepartmentSelect={handleDepartmentSelect}
        onShowAppointmentModal={() => updateState({ showAppointmentModal: true })}
        onAutoGreetingTriggered={handleAutoGreeting}
      />

      <KioskFooter />

      <AppointmentBookingModal
        isOpen={state.showAppointmentModal}
        onClose={() => updateState({ showAppointmentModal: false })}
        department={state.selectedDepartment}
      />
    </div>
  );
};

export default EnhancedKiosk;
