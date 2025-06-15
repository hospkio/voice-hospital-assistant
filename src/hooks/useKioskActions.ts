
import { useRef } from 'react';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';
import { toast } from 'sonner';
import SecurityHelpers from '@/utils/securityHelpers';
import { KioskState } from './useKioskState';

interface UseKioskActionsProps {
    state: KioskState;
    updateState: (updates: Partial<KioskState>) => void;
}

export const useKioskActions = ({ state, updateState }: UseKioskActionsProps) => {
    const { textToSpeech, playAudio, processWithDialogflowCX } = useGoogleCloudServices();
    const processingRef = useRef(false);

    const handleLanguageChange = (language: string) => {
        console.log('🌐 Language changed to:', language);
        updateState({ selectedLanguage: language });
        SecurityHelpers.logSecurityEvent('Language changed', { newLanguage: language, sessionId: state.sessionId });
        toast.success(`Language changed to ${language}`);
    };
    
    const handleVoiceData = async (transcript: string, confidence: number, detectedLanguage: string) => {
        if (processingRef.current) {
            console.log('🔄 Already processing, skipping...');
            return;
        }
        
        processingRef.current = true;
        console.log('🎤 Voice data received:', { transcript, confidence, detectedLanguage });

        try {
            if (!transcript?.trim()) return;
            
            const sanitizedTranscript = transcript.replace(/[<>]/g, '').trim();
            if (!sanitizedTranscript) {
                SecurityHelpers.logSecurityEvent('Invalid voice input detected', { transcript: transcript.substring(0, 100), sessionId: state.sessionId });
                toast.error('Invalid input detected. Please try again.');
                return;
            }
            
            if (detectedLanguage && detectedLanguage !== state.selectedLanguage) {
                console.log('🔄 Auto-updating language from', state.selectedLanguage, 'to', detectedLanguage);
                updateState({ selectedLanguage: detectedLanguage });
            }
            
            const response = await processWithDialogflowCX(sanitizedTranscript, state.sessionId, detectedLanguage);
            
            if (response.success) {
                updateState({ 
                    currentResponse: { text: response.responseText, timestamp: Date.now() },
                    conversationHistory: [...state.conversationHistory, { query: sanitizedTranscript, response: response.responseText, timestamp: Date.now(), language: detectedLanguage, confidence }]
                });
                
                const ttsResponse = await textToSpeech(response.responseText, detectedLanguage);
                if (ttsResponse.success && ttsResponse.audioContent) {
                    await playAudio(ttsResponse.audioContent);
                }
            } else {
                toast.error('Failed to process your request. Please try again.');
            }
        } catch (error) {
            console.error('❌ Error processing voice data:', error);
            SecurityHelpers.logSecurityEvent('Voice processing error', { error: error instanceof Error ? error.message : 'Unknown error', sessionId: state.sessionId });
            toast.error('An error occurred. Please try again.');
        } finally {
            processingRef.current = false;
        }
    };

    const handleListeningChange = (listening: boolean) => {
        console.log('🎤 Listening state changed:', listening);
        updateState({ isListening: listening });
        if (listening) toast.info('Listening for your voice...');
    };

    const handleFaceDetected = (detected: boolean, count: number) => {
        if (state.faceDetectionEnabled) {
            updateState({ facesDetected: detected, faceCount: count, lastGreetingTime: detected ? Date.now() : state.lastGreetingTime });
        } else {
            updateState({ facesDetected: false, faceCount: 0 });
        }
    };

    const handleQuickAction = async (query: string) => {
        await handleVoiceData(query, 1.0, state.selectedLanguage);
    };

    const handleDepartmentSelect = (department: string) => {
        updateState({ selectedDepartment: department });
        toast.success(`Selected ${department} department`);
    };

    const handleShowAppointmentModal = () => updateState({ showAppointmentModal: true });

    const handleAutoGreetingTriggered = async () => {
        if (!state.autoInteractionEnabled || !state.faceDetectionEnabled) return;
        
        const greetings: Record<string, string> = {
            'en-US': 'Hello! Welcome to our smart healthcare kiosk...',
            'hi-IN': 'नमस्ते! हमारे स्मार्ट हेल्थकेयर कियोस्क में आपका स्वागत है...',
            'ml-IN': 'നമസ്കാരം! ഞങ്ങളുടെ സ്മാർട്ട് ഹെൽത്ത്കെയർ കിയോസ്കിലേക്ക് സ്വാഗതം...',
            'ta-IN': 'வணக்கம்! எங்கள் ஸ்மார்ட் ஹெல்த்கேர் கியோஸ்க்கிற்கு வரவேற்கிறோம்...'
        };
        const greeting = greetings[state.selectedLanguage] || greetings['en-US'];
        
        const ttsResponse = await textToSpeech(greeting, state.selectedLanguage);
        if (ttsResponse.success && ttsResponse.audioContent) {
            await playAudio(ttsResponse.audioContent);
        }
        updateState({ currentResponse: { text: greeting, audioContent: ttsResponse.audioContent, timestamp: Date.now() } });
    };

    const handleToggleAutoInteraction = (enabled?: boolean) => {
        const newState = typeof enabled === 'boolean' ? enabled : !state.autoInteractionEnabled;
        updateState({ autoInteractionEnabled: newState });
        toast.success(`Auto interaction ${newState ? 'enabled' : 'disabled'}`);
    };

    const handleToggleFaceDetection = (enabled: boolean) => {
        updateState({ faceDetectionEnabled: enabled });
        toast.success(`Face detection ${enabled ? 'enabled' : 'disabled'}`);
    };

    return {
        handleLanguageChange,
        handleVoiceData,
        handleListeningChange,
        handleFaceDetected,
        handleQuickAction,
        handleDepartmentSelect,
        handleShowAppointmentModal,
        handleAutoGreetingTriggered,
        handleToggleAutoInteraction,
        handleToggleFaceDetection
    };
};
