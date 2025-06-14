
export const AUTO_GREETING_CONSTANTS = {
  SESSION_DURATION_MS: 60000, // 60 seconds - how long to remember a user session
  COOLDOWN_DURATION_MS: 30000, // 30 seconds between greetings
  FACE_LOST_RESET_DELAY: 8000, // 8 seconds after face lost to end session
} as const;

export const greetings = {
  'en-US': 'Hello! Welcome to our hospital. How can I help you today?',
  'hi-IN': 'नमस्ते! हमारे अस्पताल में आपका स्वागत है। आज मैं आपकी कैसे सहायता कर सकता हूं?',
  'ml-IN': 'നമസ്കാരം! ഞങ്ങളുടെ ആശുപത്രിയിലേക്ക് സ്വാഗതം. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?',
  'ta-IN': 'வணக்கம்! எங்கள் மருத்துவமனைக்கு வரவேற்கிறோம். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?'
} as const;
