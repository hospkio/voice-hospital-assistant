import React, { useEffect, useRef, useCallback } from 'react';
import KioskHeader from '@/components/KioskHeader';
import KioskFooter from '@/components/KioskFooter';
import MainKioskInterface from '@/components/MainKioskInterface';
import AppointmentBookingModal from '@/components/AppointmentBookingModal';
import { useKioskState } from '@/hooks/useKioskState';
import { useDialogflowCXService } from '@/hooks/useDialogflowCXService';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';
import { useToast } from '@/hooks/use-toast';
import { hospitalDataService } from '@/services/hospitalDataService';

const EnhancedKiosk = () => {
  const { toast } = useToast();
  const { state, updateState } = useKioskState();
  const { processWithDialogflowCX } = useDialogflowCXService();
  const { textToSpeech, playAudio } = useGoogleCloudServices();
  const greetingTriggeredRef = useRef(false);
  const lastGreetingTimeRef = useRef(0);

  // Welcome message on load
  useEffect(() => {
    const welcomeMessage = {
      responseText: "🌟 Welcome to MediCare Smart Kiosk! I'm your intelligent AI assistant. Step in front of the camera and I'll automatically greet you. You can also use voice commands in multiple languages. How may I help you today?",
      intent: 'welcome',
      entities: {},
      confidence: 1.0,
      responseTime: 0,
      responseData: { 
        type: 'welcome',
        features: ['voice-recognition', 'face-detection', 'multi-language', 'navigation', 'appointments']
      },
      success: true
    };
    updateState({ currentResponse: welcomeMessage });
  }, [updateState]);

  const handleAutoGreeting = useCallback(async () => {
    const currentTime = Date.now();
    
    // Prevent multiple greetings within 30 seconds
    if (currentTime - lastGreetingTimeRef.current < 30000) {
      console.log('🚫 Auto-greeting on cooldown, skipping');
      return;
    }

    if (greetingTriggeredRef.current) {
      console.log('🚫 Auto-greeting already in progress, skipping');
      return;
    }

    greetingTriggeredRef.current = true;
    lastGreetingTimeRef.current = currentTime;
    
    console.log('🎯 AUTO-GREETING TRIGGERED by face detection');
    updateState({ isAutoDetecting: true });
    
    const greetings = {
      'en-US': "Hello! Welcome to MediCare Hospital! I'm your AI assistant. I can help you with directions, appointments, and hospital information in multiple languages. How may I assist you today?",
      'ta-IN': "வணக்கம்! மெடிகேர் மருத்துவமனைக்கு வரவேற்கிறோம்! நான் உங்கள் AI உதவியாளர். திசைகள், அப்பாயிண்ட்மென்ட்கள் மற்றும் மருத்துவமனை தகவல்களுக்கு உதவ முடியும். இன்று எப்படி உதவ முடியும்?",
      'hi-IN': "नमस्ते! मेडिकेयर अस्पताल में आपका स्वागत है! मैं आपका AI सहायक हूं। दिशा-निर्देश, अपॉइंटमेंट और अस्पताल की जानकारी में मदद कर सकता हूं। आज कैसे सहायता करूं?",
      'ml-IN': "നമസ്കാരം! മെഡികെയർ ഹോസ്പിറ്റലിലേക്ക് സ്വാഗതം! ഞാൻ നിങ്ങളുടെ AI അസിസ്റ്റന്റാണ്. ദിശകൾ, അപ്പോയിന്റ്മെന്റുകൾ, ആശുപത്രി വിവരങ്ങൾ എന്നിവയിൽ സഹായിക്കാം. ഇന്ന് എങ്ങനെ സഹായിക്കാം?",
      'te-IN': "నమస్కారం! మెడికేర్ హాస్పిటల్‌కు స్వాగతం! నేను మీ AI సహాయకుడను. దిశలు, అపాయింట్‌మెంట్లు మరియు హాస్పిటల్ సమాచారంలో సహాయం చేయగలను. ఈరోజు ఎలా సహాయం చేయగలను?"
    };

    try {
      console.log('🔊 Starting auto-greeting process...');
      
      toast({
        title: "👋 Face Detected!",
        description: "AI Assistant is now active. You can speak or use voice commands.",
        duration: 6000,
      });

      const greeting = greetings[state.selectedLanguage] || greetings['en-US'];
      
      const greetingResponse = {
        responseText: greeting,
        intent: 'auto-greeting',
        entities: {},
        confidence: 1.0,
        responseTime: 0,
        responseData: { 
          type: 'auto-greeting', 
          triggered: 'face-detection',
          language: state.selectedLanguage,
          timestamp: new Date().toISOString()
        },
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
          trigger: 'face-detection',
          language: state.selectedLanguage
        }],
        lastGreetingTime: currentTime
      });

      console.log('🎵 Playing greeting audio...');
      const ttsResult = await textToSpeech(greeting, state.selectedLanguage);
      
      if (ttsResult.success && ttsResult.audioContent) {
        console.log('✅ Playing greeting audio...');
        await playAudio(ttsResult.audioContent);
        console.log('🎉 Greeting completed successfully!');
        
        toast({
          title: "🎤 Voice Ready",
          description: "I can understand multiple languages. Please speak naturally.",
          duration: 4000,
        });
        
      } else {
        console.error('❌ TTS failed:', ttsResult.error);
        toast({
          title: "⚠️ Audio Issue",
          description: "Face detected but audio failed. Voice commands still work.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('💥 Auto-greeting error:', error);
      
      toast({
        title: "⚠️ Greeting Error",
        description: "Face detected but greeting failed. Please use voice commands.",
        variant: "destructive",
      });
    } finally {
      updateState({ isAutoDetecting: false });
      greetingTriggeredRef.current = false;
      
      console.log('🔄 Auto-greeting process completed');
    }
  }, [state.selectedLanguage, state.conversationHistory, updateState, textToSpeech, playAudio, toast]);

  const handleVoiceInput = async (transcript: string, confidence: number, detectedLanguage: string) => {
    console.log('🎤 PROCESSING VOICE INPUT:', { transcript, confidence, detectedLanguage });
    
    if (detectedLanguage !== state.selectedLanguage) {
      updateState({ selectedLanguage: detectedLanguage });
      console.log('🌐 Language auto-switched to:', detectedLanguage);
      
      toast({
        title: "🌍 Language Detected",
        description: `Now responding in ${detectedLanguage}`,
        duration: 3000,
      });
    }
    
    await hospitalDataService.createOrUpdateKioskSession(state.sessionId, detectedLanguage);
    
    const newHistory = [...state.conversationHistory, {
      type: 'user',
      content: transcript,
      timestamp: new Date(),
      language: detectedLanguage,
      confidence
    }];

    console.log('🤖 Sending to Dialogflow CX...');
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
        confidence: dialogflowResponse.confidence,
        language: detectedLanguage
      }]
    });

    try {
      console.log('🔊 Playing response audio...');
      const ttsResult = await textToSpeech(dialogflowResponse.responseText, detectedLanguage);
      if (ttsResult.success && ttsResult.audioContent) {
        await playAudio(ttsResult.audioContent);
        console.log('✅ Response audio completed');
      } else {
        console.error('❌ Response audio failed:', ttsResult.error);
      }
    } catch (error) {
      console.error('💥 Audio playback failed:', error);
    }

    toast({
      title: "✅ Voice Processed",
      description: `Language: ${detectedLanguage} (${Math.round(confidence * 100)}% confidence)`,
      duration: 3000,
    });
  };

  const handleQuickAction = async (query: string) => {
    console.log('⚡ Quick action triggered:', query);
    await handleVoiceInput(query, 1.0, state.selectedLanguage);
  };

  const handleDepartmentSelect = (department: string) => {
    updateState({ selectedDepartment: department });
    handleQuickAction(`Tell me about ${department} department and show me directions`);
  };

  const handleFaceDetection = useCallback((detected: boolean, count: number) => {
    console.log(`👥 MAIN KIOSK - Face detection callback: detected=${detected}, count=${count}`);
    updateState({ facesDetected: detected, faceCount: count });
    
    if (detected) {
      console.log(`👥 FACE DETECTION: ${count} face(s) detected - triggering auto greeting`);
      // Trigger auto greeting immediately when face detected
      handleAutoGreeting();
    }
  }, [updateState, handleAutoGreeting]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col touch-manipulation selection:bg-blue-200">
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
