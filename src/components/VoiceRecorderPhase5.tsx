
import React from 'react';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useAutoGreetingLogic } from '@/hooks/useAutoGreetingLogic';
import { useAutomationProcessor } from '@/hooks/useAutomationProcessor';
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
  const { speechToText } = useGoogleCloudServices();
  
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

  const { greetingMessage, hasGreeted, resetGreeting, isOnCooldown } = useAutoGreetingLogic({
    selectedLanguage,
    faceDetectionEnabled,
    autoInteractionEnabled,
    setDetectionCallback
  });

  const { automationResponse, resetAutomationResponse } = useAutomationProcessor({
    transcript,
    confidence,
    detectedLanguage,
    selectedLanguage,
    isProcessing
  });

  const resetSession = () => {
    console.log('🔄 Resetting session...');
    resetTranscript();
    resetGreeting();
    resetAutomationResponse();
  };

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
        isOnCooldown={isOnCooldown}
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
