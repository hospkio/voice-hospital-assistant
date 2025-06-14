
import { useState } from 'react';
import SecurityHelpers from '@/utils/securityHelpers';

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
    sessionId: SecurityHelpers.generateSessionId(), // Use secure session ID generation
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
    // Enhanced security validation for critical state updates
    const sanitizedUpdates = { ...updates };

    // Validate session ID if being updated
    if (updates.sessionId && !SecurityHelpers.validateSessionId(updates.sessionId)) {
      SecurityHelpers.logSecurityEvent('Invalid session ID update attempt', { 
        sessionId: updates.sessionId 
      });
      delete sanitizedUpdates.sessionId;
    }

    // Validate face count
    if (typeof updates.faceCount === 'number' && (updates.faceCount < 0 || updates.faceCount > 50)) {
      SecurityHelpers.logSecurityEvent('Suspicious face count', { 
        faceCount: updates.faceCount 
      });
      delete sanitizedUpdates.faceCount;
    }

    // Validate language selection
    if (updates.selectedLanguage) {
      const validLanguages = ['en-US', 'ta-IN', 'ml-IN'];
      if (!validLanguages.includes(updates.selectedLanguage)) {
        SecurityHelpers.logSecurityEvent('Invalid language selection', { 
          language: updates.selectedLanguage 
        });
        delete sanitizedUpdates.selectedLanguage;
      }
    }

    setState(prev => ({ ...prev, ...sanitizedUpdates }));
  };

  // Enhanced method to clear sensitive state data
  const clearSensitiveData = () => {
    setState(prev => ({
      ...prev,
      conversationHistory: [],
      currentResponse: null,
      sessionId: SecurityHelpers.generateSessionId()
    }));
  };

  // Method to validate current state
  const validateState = (): boolean => {
    return SecurityHelpers.validateSessionId(state.sessionId) &&
           typeof state.faceCount === 'number' &&
           state.faceCount >= 0;
  };

  return {
    state,
    updateState,
    clearSensitiveData,
    validateState
  };
};
