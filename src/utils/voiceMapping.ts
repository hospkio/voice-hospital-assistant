
export function getVoiceName(languageCode: string): string {
  const voiceMap = {
    'en-US': 'en-US-Wavenet-D',
    'ta-IN': 'ta-IN-Wavenet-A',
    'ml-IN': 'ml-IN-Wavenet-A'
  };
  
  return voiceMap[languageCode] || voiceMap['en-US'];
}
