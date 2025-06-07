
import { useState } from 'react';

interface KioskState {
  isListening: boolean;
  selectedLanguage: string;
  currentResponse: any;
  sessionId: string;
  conversationHistory: any[];
  selectedDepartment?: string;
  facesDetected: boolean;
  faceCount: number;
  autoInteractionEnabled: boolean;
  showAppointmentModal: boolean;
  lastGreetingTime: number;
  isAutoDetecting: boolean;
}

export const useKioskState = () => {
  const [state, setState] = useState<KioskState>({
    isListening: false,
    selectedLanguage: 'en-US',
    currentResponse: null,
    sessionId: `session_${Date.now()}`,
    conversationHistory: [],
    selectedDepartment: undefined,
    facesDetected: false,
    faceCount: 0,
    autoInteractionEnabled: true,
    showAppointmentModal: false,
    lastGreetingTime: 0,
    isAutoDetecting: false
  });

  const updateState = (updates: Partial<KioskState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return {
    state,
    updateState
  };
};
