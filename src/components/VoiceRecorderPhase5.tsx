
import React, { useState, useEffect } from 'react';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useDialogflowAutomation } from '@/hooks/useDialogflowAutomation';
import DebugPanel from '@/components/voice-recorder-phase5/DebugPanel';
import CameraSection from '@/components/voice-recorder-phase5/CameraSection';
import VoiceRecordingSection from '@/components/voice-recorder-phase5/VoiceRecordingSection';
import ResultsDisplay from '@/components/voice-recorder-phase5/ResultsDisplay';
import StatusPanel from '@/components/voice-recorder-phase5/StatusPanel';

interface VoiceRecorderPhase5Props {
  selectedLanguage?: string;
  faceDetectionEnabled?: boolean;
  autoInteractionEnabled?: boolean;
}

const VoiceRecorderPhase5: React.FC<VoiceRecorderPhase5Props> = ({ 
  selectedLanguage = 'en-US',
  faceDetectionEnabled = true,
  autoInteractionEnabled = true
}) => {
  const [greetingMessage, setGreetingMessage] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [automationResponse, setAutomationResponse] = useState<any>(null);

  const { speechToText, textToSpeech, playAudio } = useGoogleCloudServices();
  const { processUserQuery } = useDialogflowAutomation();
  
  const { 
    videoRef, 
    isActive: isCameraActive, 
    facesDetected, 
    faceCount,
    isLoading: cameraLoading, 
    startCamera, 
    stopCamera,
    setDetectionCallback
  } = useFaceDetection(faceDetectionEnabled);

  const {
    isRecording,
    audioLevel,
    isProcessing,
    processingTime,
    transcript,
    confidence,
    detectedLanguage,
    startRecording,
    stopRecording,
    resetTranscript
  } = useAudioRecorder(speechToText, {
    autoStop: false,
    silenceDuration: 10000,
    audioThreshold: 0.1
  });

  const greetings = {
    'en-US': 'Hello! Welcome to our hospital. How can I help you today?',
    'hi-IN': 'नमस्ते! हमारे अस्पताल में आपका स्वागत है। आज मैं आपकी कैसे सहायता कर सकता हूं?',
    'ml-IN': 'നമസ്കാരം! ഞങ്ങളുടെ ആശുപത്രിയിലേക്ക് സ്വാഗതം. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?',
    'ta-IN': 'வணக்கம்! எங்கள் மருத்துவமனைக்கு வரவேற்கிறோம். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?'
  };

  // Process transcript through automation system when it's ready
  useEffect(() => {
    const processTranscript = async () => {
      if (transcript && transcript.trim().length > 3 && confidence > 0.5) {
        console.log('🤖 Processing transcript through automation system:', transcript);
        
        try {
          const sessionId = `phase5_session_${Date.now()}`;
          const result = await processUserQuery(transcript, sessionId, detectedLanguage || selectedLanguage);
          
          console.log('✅ Automation system response:', result);
          setAutomationResponse(result);
          
          // Play the response if it's successful
          if (result.success && result.responseText) {
            console.log('🔊 Playing automation response...');
            const ttsResponse = await textToSpeech(result.responseText, detectedLanguage || selectedLanguage);
            if (ttsResponse.success && ttsResponse.audioContent) {
              await playAudio(ttsResponse.audioContent);
            }
          }
        } catch (error) {
          console.error('❌ Error processing transcript through automation:', error);
          setAutomationResponse({ 
            success: false, 
            responseText: 'I apologize, but I am having trouble processing your request right now.',
            error: error.message 
          });
        }
      }
    };

    if (transcript && !isProcessing) {
      processTranscript();
    }
  }, [transcript, isProcessing, confidence, detectedLanguage, selectedLanguage, processUserQuery, textToSpeech, playAudio]);

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
      
      if (faceDetectionEnabled && autoInteractionEnabled) {
        setTimeout(() => {
          console.log('🎤 Starting recording after greeting...');
          startRecording();
        }, 2000);
      }
    } catch (error) {
      console.error('Error in auto-greeting:', error);
    }
  };

  const resetSession = () => {
    console.log('🔄 Resetting session...');
    resetTranscript();
    setGreetingMessage('');
    setHasGreeted(false);
    setAutomationResponse(null);
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

  const handleStartCamera = () => {
    if (faceDetectionEnabled) {
      startCamera();
    } else {
      console.log('🚫 Face detection disabled, cannot start camera');
    }
  };

  return (
    <div className="space-y-6">
      <DebugPanel
        isCameraActive={isCameraActive && faceDetectionEnabled}
        facesDetected={faceDetectionEnabled ? facesDetected : false}
        faceCount={faceDetectionEnabled ? faceCount : 0}
        hasGreeted={hasGreeted && faceDetectionEnabled && autoInteractionEnabled}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CameraSection
          videoRef={videoRef}
          isCameraActive={isCameraActive && faceDetectionEnabled}
          facesDetected={faceDetectionEnabled ? facesDetected : false}
          faceCount={faceDetectionEnabled ? faceCount : 0}
          cameraLoading={cameraLoading}
          startCamera={handleStartCamera}
          stopCamera={stopCamera}
        />

        <VoiceRecordingSection
          isRecording={isRecording}
          audioLevel={audioLevel}
          isProcessing={isProcessing}
          startRecording={startRecording}
          stopRecording={stopRecording}
          resetSession={resetSession}
        />
      </div>

      <ResultsDisplay
        greetingMessage={
          !faceDetectionEnabled ? 'Face detection is disabled' :
          !autoInteractionEnabled ? 'Auto interaction is disabled' :
          greetingMessage
        }
        transcript={transcript}
        detectedLanguage={detectedLanguage}
        confidence={confidence}
        processingTime={processingTime}
        faceCount={faceDetectionEnabled ? faceCount : 0}
        automationResponse={automationResponse}
      />

      <StatusPanel
        isCameraActive={isCameraActive && faceDetectionEnabled}
        facesDetected={faceDetectionEnabled ? facesDetected : false}
        hasGreeted={hasGreeted && faceDetectionEnabled && autoInteractionEnabled}
        isRecording={isRecording}
        transcript={transcript}
      />
    </div>
  );
};

export default VoiceRecorderPhase5;
