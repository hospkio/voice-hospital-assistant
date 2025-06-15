
import React, { useEffect } from 'react';
import { useKioskState } from '@/hooks/useKioskState';
import KioskHeader from '@/components/KioskHeader';
import MainKioskInterface from '@/components/MainKioskInterface';
import KioskFooter from '@/components/KioskFooter';
import AppointmentBookingModal from '@/components/AppointmentBookingModal';
import { toast } from 'sonner';
import { useKioskActions } from '@/hooks/useKioskActions';
import { useKioskSpeechRecognition } from '@/hooks/useKioskSpeechRecognition';

const EnhancedKiosk: React.FC = () => {
  const { state, updateState, clearSensitiveData, validateState } = useKioskState();
  
  const {
    handleLanguageChange,
    handleVoiceData,
    handleListeningChange,
    handleFaceDetected,
    handleQuickAction,
    handleDepartmentSelect,
    handleShowAppointmentModal,
    handleAutoGreetingTriggered,
    handleToggleAutoInteraction,
    handleToggleFaceDetection,
  } = useKioskActions({ state, updateState });

  useKioskSpeechRecognition({
    isListening: state.isListening,
    language: state.selectedLanguage,
    onResult: handleVoiceData,
    onListeningChange: handleListeningChange,
  });

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
        selectedLanguage={state.selectedLanguage}
      />
      
      <KioskFooter />
      
      {state.showAppointmentModal && (
        <AppointmentBookingModal
          isOpen={state.showAppointmentModal}
          onClose={() => updateState({ showAppointmentModal: false })}
          department={state.selectedDepartment}
        />
      )}
    </div>
  );
};

export default EnhancedKiosk;
