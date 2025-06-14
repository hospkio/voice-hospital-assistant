
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
}

const VoiceRecorderPhase5: React.FC<VoiceRecorderPhase5Props> = ({ 
  selectedLanguage = 'en-US' 
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
  } = useFaceDetection(true); // Auto-start enabled

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
  } = useAudioRecorder(speechToText);

  const greetings = {
    'en-US': 'Hello! Welcome to our hospital. How can I help you today?',
    'hi-IN': 'नमस्ते! हमारे अस्पताल में आपका स्वागत है। आज मैं आपकी कैसे सहायता कर सकता हूं?',
    'ml-IN': 'നമസ്കാരം! ഞങ്ങളുടെ ആശുപത്രിയിലേക്ക് സ്വാഗതം. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?',
    'ta-IN': 'வணக்கம்! எங்கள் மருத்துவமனைக்கு வரவேற்கிறோம். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?'
  };

  // Set up face detection callback for auto-greeting
  useEffect(() => {
    console.log('🔧 Setting up face detection callback in Phase5...');
    setDetectionCallback((detected: boolean, count: number) => {
      console.log('📞 Phase5 received face detection callback:', { detected, count, hasGreeted, selectedLanguage });
      
      if (detected && !hasGreeted) {
        console.log('👥 Face detected in Phase5! Triggering auto-greeting...');
        triggerAutoGreeting();
      }
    });
  }, [hasGreeted, setDetectionCallback, selectedLanguage]);

  const triggerAutoGreeting = async () => {
    if (hasGreeted) {
      console.log('⚠️ Already greeted, skipping...');
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
      
      // Start recording after greeting
      setTimeout(() => {
        console.log('🎤 Starting recording after greeting...');
        startRecording();
      }, 2000);
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

  return (
    <div className="space-y-6">
      <DebugPanel
        isCameraActive={isCameraActive}
        facesDetected={facesDetected}
        faceCount={faceCount}
        hasGreeted={hasGreeted}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CameraSection
          videoRef={videoRef}
          isCameraActive={isCameraActive}
          facesDetected={facesDetected}
          faceCount={faceCount}
          cameraLoading={cameraLoading}
          startCamera={startCamera}
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
        greetingMessage={greetingMessage}
        transcript={transcript}
        detectedLanguage={detectedLanguage}
        confidence={confidence}
        processingTime={processingTime}
        faceCount={faceCount}
      />

      <StatusPanel
        isCameraActive={isCameraActive}
        facesDetected={facesDetected}
        hasGreeted={hasGreeted}
        isRecording={isRecording}
        transcript={transcript}
      />
    </div>
  );
};

export default VoiceRecorderPhase5;
