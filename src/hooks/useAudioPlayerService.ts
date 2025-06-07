
export const useAudioPlayerService = () => {
  const playAudio = async (audioContent: string): Promise<void> => {
    try {
      // Convert base64 audio to blob
      const audioData = atob(audioContent);
      const audioArray = new Uint8Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        audioArray[i] = audioData.charCodeAt(i);
      }
      
      const audioBlob = new Blob([audioArray], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.play();
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  };

  return {
    playAudio
  };
};
