import { useDialogflowService } from './useDialogflowService';
import { useSpeechToTextService } from './useSpeechToTextService';
import { useTextToSpeechService } from './useTextToSpeechService';
import { useAudioPlayerService } from './useAudioPlayerService';
import { useDialogflowCXService } from './useDialogflowCXService';

export const useGoogleCloudServices = () => {
  const { processWithDialogflowCX, isLoading: dialogflowCXLoading } = useDialogflowCXService();
  const { processWithDialogflow, isLoading: dialogflowLoading } = useDialogflowService();
  const { speechToText, isLoading: speechLoading } = useSpeechToTextService();
  const { textToSpeech, isLoading: ttsLoading } = useTextToSpeechService();
  const { playAudio } = useAudioPlayerService();

  const isLoading = dialogflowCXLoading || dialogflowLoading || speechLoading || ttsLoading;

  return {
    // Enhanced Dialogflow CX (primary)
    processWithDialogflowCX,
    // Fallback Dialogflow (secondary)
    processWithDialogflow,
    speechToText,
    textToSpeech,
    playAudio,
    isLoading
  };
};
