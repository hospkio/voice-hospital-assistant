
export interface FaceDetectionResult {
  facesDetected: boolean;
  faceCount: number;
  confidence: number;
  boundingBoxes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
  success: boolean;
}

export interface FaceDetectionState {
  isActive: boolean;
  facesDetected: boolean;
  faceCount: number;
  isLoading: boolean;
  lastDetectionTime: number;
}

export type DetectionCallback = (detected: boolean, count: number) => void;
