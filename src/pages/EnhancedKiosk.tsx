
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

  // Auto-greeting when faces are detected
  useEffect(() => {
    if (state.facesDetected && state.autoInteractionEnabled && !state.isAutoDetecting) {
      const now = Date.now();
      if (now - state.lastGreetingTime > 15000) {
        handleAutoGreeting();
        updateState({ lastGreetingTime: now });
      }
    }
  }, [state.facesDetected, state.autoInteractionEnabled]);

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
    updateState({ isAutoDetecting: true });
    
    const greetings = {
      'en-US': "Hello! Welcome to MediCare Hospital. I'm your AI assistant here to help you with directions, appointments, and information. How may I assist you today?",
      'ta-IN': "வணக்கம்! மெடிகேர் மருத்துவமனைக்கு வரவேற்கிறோம். திசைகள், அப்பாயிண்ட்மென்ட்கள் மற்றும் தகவல்களுக்கு நான் உங்கள் AI உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      'ml-IN': "നമസ്കാരം! മെഡികെയർ ഹോസ്പിറ്റലിലേക്ക് സ്വാഗതം. ദിശകൾ, അപ്പോയിന്റ്മെന്റുകൾ, വിവരങ്ങൾ എന്നിവയിൽ സഹായിക്കാൻ ഞാൻ നിങ്ങളുടെ AI അസിസ്റ്റന്റാണ്. ഇന്ന് എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?",
      'hi-IN': "नमस्ते! मेडिकेयर अस्पताल में आपका स्वागत है। दिशा-निर्देश, अपॉइंटमेंट और जानकारी के लिए मैं आपका AI सहायक हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?"
    };

    try {
      toast({
        title: "👋 Face detected!",
        description: "Please speak to start. I'll detect your language automatically.",
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
        }]
      });

      const ttsResult = await textToSpeech(greeting, state.selectedLanguage);
      if (ttsResult.success) {
        await playAudio(ttsResult.audioContent);
      }

      setTimeout(async () => {
        try {
          const languageResult = await detectLanguage();
          if (languageResult) {
            updateState({ selectedLanguage: languageResult.detectedLanguage });
            await handleVoiceInput(languageResult.transcript, languageResult.confidence, languageResult.detectedLanguage);
          }
        } catch (error) {
          console.log('No speech detected during auto-detection phase');
        } finally {
          updateState({ isAutoDetecting: false });
        }
      }, 2000);

    } catch (error) {
      console.error('Auto-greeting error:', error);
      updateState({ isAutoDetecting: false });
    }
  };

  const handleVoiceInput = async (transcript: string, confidence: number, detectedLanguage: string) => {
    console.log('Voice input received:', { transcript, confidence, detectedLanguage });
    
    if (detectedLanguage !== state.selectedLanguage) {
      updateState({ selectedLanguage: detectedLanguage });
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
