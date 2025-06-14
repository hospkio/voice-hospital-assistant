import React, { useEffect, useRef } from 'react';
import { useKioskState } from '@/hooks/useKioskState';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';
import KioskHeader from '@/components/KioskHeader';
import MainKioskInterface from '@/components/MainKioskInterface';
import KioskFooter from '@/components/KioskFooter';
import AppointmentBookingModal from '@/components/AppointmentBookingModal';
import { toast } from 'sonner';
import SecurityHelpers from '@/utils/securityHelpers';

const EnhancedKiosk: React.FC = () => {
  const { state, updateState, clearSensitiveData, validateState } = useKioskState();
  const { speechToText, textToSpeech, playAudio, dialogflowProcess } = useGoogleCloudServices();
  const recognitionRef = useRef<any>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (state.isListening && !recognitionRef.current) {
      console.log('🎤 Initializing speech recognition...');
      initializeSpeechRecognition(state.selectedLanguage);
    } else if (!state.isListening && recognitionRef.current) {
      console.log('🛑 Stopping speech recognition...');
      stopSpeechRecognition();
    }
  }, [state.isListening, state.selectedLanguage]);

  useEffect(() => {
    if (recognitionRef.current) {
      console.log('🌐 Updating speech recognition language to:', state.selectedLanguage);
      recognitionRef.current.lang = state.selectedLanguage;
    }
  }, [state.selectedLanguage]);

  const initializeSpeechRecognition = (language: string) => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language;
      
      recognitionRef.current.onstart = () => {
        console.log('⏺️ Speech recognition started');
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('❌ Speech recognition error:', event.error);
        toast.error(`Speech recognition error: ${event.error}`);
      };
      
      recognitionRef.current.onend = () => {
        console.log('⏹️ Speech recognition ended');
        if (state.isListening) {
          console.log('🔄 Restarting speech recognition...');
          recognitionRef.current.start();
        }
      };
      
      recognitionRef.current.onresult = async (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
          
        const confidence = event.results[event.results.length - 1][0].confidence;
        
        console.log('👂 Interim transcript:', transcript, 'Confidence:', confidence);
        
        // Attempt language detection
        let detectedLanguage = language; // Default to current language
        try {
          const languageResult = await speechToText(transcript, language);
          if (languageResult?.languageCode) {
            detectedLanguage = languageResult.languageCode;
            console.log('🌐 Detected language:', detectedLanguage);
          }
        } catch (langError) {
          console.warn('⚠️ Language detection error:', langError);
        }
        
        handleVoiceData(transcript, confidence, detectedLanguage);
      };
      
      recognitionRef.current.start();
    } else {
      console.warn('Speech recognition not supported in this browser.');
      toast.error('Speech recognition not supported in this browser.');
      updateState({ isListening: false });
    }
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.onstart = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onend = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current = null;
    }
  };

  // Enhanced language change handler
  const handleLanguageChange = (language: string) => {
    console.log('🌐 Language changed to:', language);
    updateState({ selectedLanguage: language });
    
    // Log security event for language changes
    SecurityHelpers.logSecurityEvent('Language changed', { 
      newLanguage: language,
      sessionId: state.sessionId 
    });
    
    toast.success(`Language changed to ${language}`);
  };

  // Enhanced voice data handler with multi-language support
  const handleVoiceData = async (transcript: string, confidence: number, detectedLanguage: string) => {
    if (processingRef.current) {
      console.log('🔄 Already processing, skipping...');
      return;
    }
    
    processingRef.current = true;
    console.log('🎤 Voice data received:', { transcript, confidence, detectedLanguage });
    
    try {
      // Validate transcript
      if (!transcript?.trim()) {
        console.log('⚠️ Empty transcript received');
        return;
      }
      
      // Security validation
      if (!SecurityHelpers.validateInput(transcript)) {
        SecurityHelpers.logSecurityEvent('Invalid voice input detected', { 
          transcript: transcript.substring(0, 100),
          sessionId: state.sessionId 
        });
        toast.error('Invalid input detected. Please try again.');
        return;
      }
      
      // Update language if detected different from current
      if (detectedLanguage && detectedLanguage !== state.selectedLanguage) {
        console.log('🔄 Auto-updating language from', state.selectedLanguage, 'to', detectedLanguage);
        updateState({ selectedLanguage: detectedLanguage });
      }
      
      console.log('🤖 Processing with Dialogflow...');
      const response = await dialogflowProcess(transcript, state.selectedLanguage, state.sessionId);
      
      if (response.success) {
        console.log('✅ Dialogflow response received:', response);
        updateState({ 
          currentResponse: response,
          conversationHistory: [...state.conversationHistory, {
            query: transcript,
            response: response.text,
            timestamp: Date.now(),
            language: detectedLanguage || state.selectedLanguage,
            confidence
          }]
        });
        
        // Play audio response if available
        if (response.audioContent) {
          console.log('🔊 Playing audio response...');
          await playAudio(response.audioContent);
        }
      } else {
        console.error('❌ Dialogflow processing failed:', response.error);
        toast.error('Failed to process your request. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error processing voice data:', error);
      SecurityHelpers.logSecurityEvent('Voice processing error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        sessionId: state.sessionId 
      });
      toast.error('An error occurred. Please try again.');
    } finally {
      processingRef.current = false;
    }
  };

  // Enhanced listening state handler
  const handleListeningChange = (listening: boolean) => {
    console.log('🎤 Listening state changed:', listening);
    updateState({ isListening: listening });
    
    if (listening) {
      toast.info('Listening for your voice...');
    }
  };

  // Enhanced face detection handler
  const handleFaceDetected = (detected: boolean, count: number) => {
    console.log('👥 Face detection update:', { detected, count, enabled: state.faceDetectionEnabled });
    
    // Only update state if face detection is enabled
    if (state.faceDetectionEnabled) {
      updateState({ 
        facesDetected: detected, 
        faceCount: count,
        lastGreetingTime: detected ? Date.now() : state.lastGreetingTime 
      });
      
      if (detected && count > 0) {
        console.log(`👥 ${count} face(s) detected!`);
      }
    } else {
      // Ensure state shows no faces when detection is disabled
      updateState({ facesDetected: false, faceCount: 0 });
    }
  };

  // Quick action handler
  const handleQuickAction = async (query: string) => {
    console.log('⚡ Quick action triggered:', query);
    await handleVoiceData(query, 1.0, state.selectedLanguage);
  };

  // Department selection handler
  const handleDepartmentSelect = (department: string) => {
    console.log('🏥 Department selected:', department);
    updateState({ selectedDepartment: department });
    toast.success(`Selected ${department} department`);
  };

  // Appointment modal handler
  const handleShowAppointmentModal = () => {
    console.log('📅 Opening appointment modal...');
    updateState({ showAppointmentModal: true });
  };

  // Auto-greeting handler
  const handleAutoGreetingTriggered = async () => {
    if (!state.autoInteractionEnabled || !state.faceDetectionEnabled) {
      console.log('🚫 Auto-greeting disabled');
      return;
    }
    
    console.log('🤖 Auto-greeting triggered');
    const greeting = `Hello! Welcome to our smart healthcare kiosk. I'm here to help you with information about our hospital services, departments, and appointments. How can I assist you today?`;
    
    try {
      const ttsResponse = await textToSpeech(greeting, state.selectedLanguage);
      if (ttsResponse.success && ttsResponse.audioContent) {
        await playAudio(ttsResponse.audioContent);
      }
      
      updateState({ 
        currentResponse: { 
          text: greeting, 
          audioContent: ttsResponse.audioContent,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('❌ Auto-greeting error:', error);
    }
  };

  // Toggle auto interaction
  const handleToggleAutoInteraction = () => {
    const newState = !state.autoInteractionEnabled;
    console.log('🔄 Toggling auto interaction:', newState);
    updateState({ autoInteractionEnabled: newState });
    toast.success(`Auto interaction ${newState ? 'enabled' : 'disabled'}`);
  };

  // Toggle face detection
  const handleToggleFaceDetection = (enabled: boolean) => {
    console.log('🔄 Toggling face detection:', enabled);
    updateState({ faceDetectionEnabled: enabled });
    toast.success(`Face detection ${enabled ? 'enabled' : 'disabled'}`);
  };

  // Session validation effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!validateState()) {
        console.warn('⚠️ Invalid session state detected, clearing sensitive data');
        clearSensitiveData();
        toast.warning('Session validation failed. Starting fresh session.');
      }
    }, 300000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [validateState, clearSensitiveData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      <KioskHeader
        facesDetected={state.facesDetected}
        faceCount={state.faceCount}
        selectedLanguage={state.selectedLanguage}
        autoInteractionEnabled={state.autoInteractionEnabled}
        faceDetectionEnabled={state.faceDetectionEnabled}
        onLanguageChange={handleLanguageChange}
        onToggleAutoInteraction={handleToggleAutoInteraction}
      />
      
      <MainKioskInterface
        state={state}
        isListening={state.isListening}
        onVoiceData={handleVoiceData}
        onListeningChange={handleListeningChange}
        onFaceDetected={handleFaceDetected}
        onQuickAction={handleQuickAction}
        onDepartmentSelect={handleDepartmentSelect}
        onShowAppointmentModal={handleShowAppointmentModal}
        onAutoGreetingTriggered={handleAutoGreetingTriggered}
        faceDetectionEnabled={state.faceDetectionEnabled}
        onFaceDetectionToggle={handleToggleFaceDetection}
        onAutoInteractionToggle={handleToggleAutoInteraction}
        onLanguageChange={handleLanguageChange}
      />
      
      <KioskFooter />
      
      {state.showAppointmentModal && (
        <AppointmentBookingModal
          isOpen={state.showAppointmentModal}
          onClose={() => updateState({ showAppointmentModal: false })}
          selectedDepartment={state.selectedDepartment}
        />
      )}
    </div>
  );
};

export default EnhancedKiosk;
