
export interface UseAutoGreetingLogicProps {
  selectedLanguage: string;
  faceDetectionEnabled: boolean;
  autoInteractionEnabled: boolean;
  setDetectionCallback: (callback: (detected: boolean, count: number) => void) => void;
}

export interface AutoGreetingState {
  greetingMessage: string;
  hasGreeted: boolean;
  isOnCooldown: boolean;
  lastGreetingTime: number;
}

export interface SessionRefs {
  sessionActiveRef: React.MutableRefObject<boolean>;
  lastGreetingTimeRef: React.MutableRefObject<number>;
  faceDetectedRef: React.MutableRefObject<boolean>;
  callbackSetRef: React.MutableRefObject<boolean>;
}
