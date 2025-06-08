import React, { useEffect, useRef } from 'react';
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
  const greetingTriggeredRef = useRef(false);

  // Welcome message on load
  useEffect(() => {
    const welcomeMessage = {
      responseText: "🌟 Welcome to MediCare Smart Kiosk! Your intelligent healthcare assistant powered by advanced AI and voice recognition technology. I can help you with hospital directions, appointment bookings, department information, and much more - all in multiple languages including English, Hindi, Tamil, Malayalam, Telugu, and more!",
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

  const handleAutoGreeting = async () => {
    if (greetingTriggeredRef.current) {
      console.log('🚫 Auto-greeting already triggered, skipping');
      return;
    }

    greetingTriggeredRef.current = true;
    console.log('🎯 Auto-greeting triggered by face detection');
    updateState({ isAutoDetecting: true });
    
    const enhancedGreetings = {
      'en-US': "Hello and welcome to MediCare Hospital! I'm your intelligent AI assistant, here to help you with directions, appointments, and hospital information. I can understand and respond in multiple languages. How may I assist you today?",
      'ta-IN': "வணக்கம்! மெடிகேர் மருத்துவமனைக்கு வரவேற்கிறோம்! நான் உங்கள் புத்திசாலி AI உதவியாளர். திசைகள், அப்பாயிண்ட்மென்ட்கள், மற்றும் மருத்துவமனை தகவல்களுக்கு நான் உங்களுக்கு உதவ முடியும். பல மொழிகளில் பேசி புரிந்துகொள்ள முடியும். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      'ml-IN': "നമസ്കാരം! മെഡികെയർ ഹോസ്പിറ്റലിലേക്ക് സ്വാഗതം! ഞാൻ നിങ്ങളുടെ ബുദ്ധിമാനായ AI അസിസ്റ്റന്റാണ്. ദിശകൾ, അപ്പോയിന്റ്മെന്റുകൾ, ആശുപത്രി വിവരങ്ങൾ എന്നിവയിൽ സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്. പല ഭാഷകളിലും സംസാരിക്കാനും മനസ്സിലാക്കാനും കഴിയും। ഇന്ന് എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?",
      'hi-IN': "नमस्ते! मेडिकेयर अस्पताल में आपका स्वागत है! मैं आपका बुद्धिमान AI सहायक हूं। दिशा-निर्देश, अपॉइंटमेंट, और अस्पताल की जानकारी के लिए मैं यहां हूं। कई भाषाओं में बात कर सकता और समझ सकता हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?",
      'te-IN': "నమస్కారం! మెడికేర్ హాస్పిటల్‌కు స్వాగతం! నేను మీ తెలివైన AI సహాయకుడను। దిశలు, అపాయింట్‌మెంట్లు, మరియు హాస్పిటల్ సమాచారం కోసం నేను ఇక్కడ ఉన్నాను। అనేక భాషలలో మాట్లాడగలను మరియు అర్థం చేసుకోగలను। ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?"
    };

    try {
      console.log('🔊 Playing enhanced greeting with visual feedback');
      
      toast({
        title: "👋 Welcome! Face Detected",
        description: "AI Assistant is now active and ready to help you. Please speak clearly.",
        duration: 8000,
      });

      const greeting = enhancedGreetings[state.selectedLanguage] || enhancedGreetings['en-US'];
      
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
        lastGreetingTime: Date.now()
      });

      console.log('🎵 Starting TTS for greeting...');
      const ttsResult = await textToSpeech(greeting, state.selectedLanguage);
      
      if (ttsResult.success && ttsResult.audioContent) {
        console.log('✅ Playing greeting audio...');
        await playAudio(ttsResult.audioContent);
        console.log('🎉 Greeting audio completed successfully');
        
        toast({
          title: "🎤 Voice Recognition Active",
          description: "You can now speak naturally. I'll detect your language automatically.",
          duration: 5000,
        });
        
        // Reset greeting trigger after successful greeting
        setTimeout(() => {
          greetingTriggeredRef.current = false;
          console.log('🔄 Greeting trigger reset - ready for next detection');
        }, 30000);
        
      } else {
        console.error('❌ TTS failed:', ttsResult.error);
        greetingTriggeredRef.current = false;
        toast({
          title: "⚠️ Audio Issue",
          description: "Face detected but audio playback failed. You can still use voice commands.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('💥 Auto-greeting error:', error);
      greetingTriggeredRef.current = false;
      
      toast({
        title: "⚠️ System Error",
        description: "Face detected but greeting system failed. Please use voice commands manually.",
        variant: "destructive",
      });
    } finally {
      updateState({ isAutoDetecting: false });
    }
  };

  const handleVoiceInput = async (transcript: string, confidence: number, detectedLanguage: string) => {
    console.log('🎤 Processing voice input:', { transcript, confidence, detectedLanguage });
    
    if (detectedLanguage !== state.selectedLanguage) {
      updateState({ selectedLanguage: detectedLanguage });
      console.log('🌐 Language auto-switched to:', detectedLanguage);
      
      toast({
        title: "🌍 Language Auto-Detected",
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

    console.log('🤖 Processing with Dialogflow CX...');
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
        console.log('✅ Response audio played successfully');
      } else {
        console.error('❌ Response audio failed:', ttsResult.error);
      }
    } catch (error) {
      console.error('💥 Response audio playback failed:', error);
    }

    toast({
      title: "🎤 Voice Processed Successfully",
      description: `Language: ${detectedLanguage} (${Math.round(confidence * 100)}% confidence)`,
      duration: 3000,
    });
  };

  const handleFaceDetection = (detected: boolean, count: number) => {
    updateState({ facesDetected: detected, faceCount: count });
    
    if (detected) {
      console.log(`👥 Face detection updated: ${count} face(s) detected`);
    }
  };

  const handleQuickAction = async (query: string) => {
    console.log('⚡ Quick action triggered:', query);
    await handleVoiceInput(query, 1.0, state.selectedLanguage);
  };

  const handleDepartmentSelect = (department: string) => {
    updateState({ selectedDepartment: department });
    handleQuickAction(`Tell me about ${department} department and show me directions`);
  };

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
