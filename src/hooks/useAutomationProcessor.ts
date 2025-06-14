
import { useState, useEffect } from 'react';
import { useDialogflowAutomation } from '@/hooks/useDialogflowAutomation';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';

interface UseAutomationProcessorProps {
  transcript: string;
  confidence: number;
  detectedLanguage: string;
  selectedLanguage: string;
  isProcessing: boolean;
}

export const useAutomationProcessor = ({
  transcript,
  confidence,
  detectedLanguage,
  selectedLanguage,
  isProcessing
}: UseAutomationProcessorProps) => {
  const [automationResponse, setAutomationResponse] = useState<any>(null);

  const { processUserQuery } = useDialogflowAutomation();
  const { textToSpeech, playAudio } = useGoogleCloudServices();

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

  const resetAutomationResponse = () => {
    setAutomationResponse(null);
  };

  return {
    automationResponse,
    resetAutomationResponse
  };
};
