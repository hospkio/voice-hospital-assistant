
import { useDialogflowService } from './useDialogflowService';
import { useSpeechToTextService } from './useSpeechToTextService';
import { useTextToSpeechService } from './useTextToSpeechService';
import { useAudioPlayerService } from './useAudioPlayerService';

export const useGoogleCloudServices = () => {
  const { processWithDialogflow, isLoading: dialogflowLoading } = useDialogflowService();
  const { speechToText, isLoading: speechLoading } = useSpeechToTextService();
  const { textToSpeech, isLoading: ttsLoading } = useTextToSpeechService();
  const { playAudio } = useAudioPlayerService();

  const isLoading = dialogflowLoading || speechLoading || ttsLoading;

  return {
    processWithDialogflow,
    speechToText,
    textToSpeech,
    playAudio,
    isLoading
  };
};
