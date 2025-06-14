
import React, { useState, useEffect } from 'react';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import DebugPanel from '@/components/voice-recorder-phase5/DebugPanel';
import CameraSection from '@/components/voice-recorder-phase5/CameraSection';
import VoiceRecordingSection from '@/components/voice-recorder-phase5/VoiceRecordingSection';
import ResultsDisplay from '@/components/voice-recorder-phase5/ResultsDisplay';
import StatusPanel from '@/components/voice-recorder-phase5/StatusPanel';

interface VoiceRecorderPhase5Props {
  selectedLanguage?: string;
  faceDetectionEnabled?: boolean;
}

const VoiceRecorderPhase5: React.FC<VoiceRecorderPhase5Props> = ({ 
  selectedLanguage = 'en-US',
  faceDetectionEnabled = true
}) => {
  const [greetingMessage, setGreetingMessage] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);

  const { speechToText, textToSpeech, playAudio } = useGoogleCloudServices();
  const { 
    videoRef, 
    isActive: isCameraActive, 
    facesDetected, 
    faceCount,
    isLoading: cameraLoading, 
    startCamera, 
    stopCamera,
    setDetectionCallback
  } = useFaceDetection(faceDetectionEnabled); // Only auto-start if face detection is enabled

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

  // Set up face detection callback for auto-greeting - only if face detection is enabled
  useEffect(() => {
    if (!faceDetectionEnabled) {
      console.log('🚫 Face detection disabled in Phase5, skipping callback setup');
      
      // Reset greeting state when face detection is disabled
      setHasGreeted(false);
      setGreetingMessage('Face detection is disabled');
      return;
    }

    console.log('🔧 Setting up face detection callback in Phase5...');
    setDetectionCallback((detected: boolean, count: number) => {
      console.log('📞 Phase5 received face detection callback:', { 
        detected, 
        count, 
        hasGreeted, 
        selectedLanguage, 
        faceDetectionEnabled 
      });
      
      if (detected && !hasGreeted && faceDetectionEnabled) {
        console.log('👥 Face detected in Phase5! Triggering auto-greeting...');
        triggerAutoGreeting();
      }
    });
  }, [hasGreeted, setDetectionCallback, selectedLanguage, faceDetectionEnabled]);

  const triggerAutoGreeting = async () => {
    if (hasGreeted || !faceDetectionEnabled) {
      console.log('⚠️ Already greeted or face detection disabled, skipping...', { hasGreeted, faceDetectionEnabled });
      return;
    }
    
    console.log('🤖 Starting auto-greeting sequence with language:', selectedLanguage);
    setHasGreeted(true);
    
    // Use the selected language for greeting
    const currentGreeting = greetings[selectedLanguage] || greetings['en-US'];
    setGreetingMessage(`Auto-greeting (${selectedLanguage}): ${currentGreeting}`);
    
    try {
      // Generate and play greeting audio in the selected language
      console.log('🔊 Generating TTS for greeting in language:', selectedLanguage);
      const ttsResponse = await textToSpeech(currentGreeting, selectedLanguage);
      if (ttsResponse.success && ttsResponse.audioContent) {
        console.log('🔊 Playing greeting audio in', selectedLanguage);
        await playAudio(ttsResponse.audioContent);
      }
      
      // Start recording after greeting only if face detection is enabled
      if (faceDetectionEnabled) {
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
  };

  // Reset greeting state when face detection is disabled
  useEffect(() => {
    if (!faceDetectionEnabled) {
      console.log('🔄 Face detection disabled, resetting greeting state...');
      setHasGreeted(false);
      setGreetingMessage('Face detection is disabled');
    }
  }, [faceDetectionEnabled]);

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
        hasGreeted={hasGreeted && faceDetectionEnabled}
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
        greetingMessage={faceDetectionEnabled ? greetingMessage : 'Face detection is disabled'}
        transcript={transcript}
        detectedLanguage={detectedLanguage}
        confidence={confidence}
        processingTime={processingTime}
        faceCount={faceDetectionEnabled ? faceCount : 0}
      />

      <StatusPanel
        isCameraActive={isCameraActive && faceDetectionEnabled}
        facesDetected={faceDetectionEnabled ? facesDetected : false}
        hasGreeted={hasGreeted && faceDetectionEnabled}
        isRecording={isRecording}
        transcript={transcript}
      />
    </div>
  );
};

export default VoiceRecorderPhase5;
