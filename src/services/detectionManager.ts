
import { DetectionCallback } from '@/types/faceDetection';
import { FaceDetectionService } from './faceDetectionService';

export class DetectionManager {
  private faceDetectionService: FaceDetectionService;
  private intervalRef: NodeJS.Timeout | null = null;
  private detectionCallback: DetectionCallback | null = null;
  private currentDetection = false;

  constructor(faceDetectionService: FaceDetectionService) {
    this.faceDetectionService = faceDetectionService;
  }

  setDetectionCallback(callback: DetectionCallback): void {
    console.log('🔗 Setting detection callback');
    this.detectionCallback = callback;
  }

  startDetection(): void {
    if (this.intervalRef) {
      console.log('🔄 Face detection already running, clearing previous interval');
      clearInterval(this.intervalRef);
    }
    
    console.log('🎯 Starting face detection interval...');
    this.intervalRef = setInterval(async () => {
      try {
        const detection = await this.faceDetectionService.detectFaces();
        console.log('🔍 Detection result:', detection);
        
        if (detection.success) {
          const currentDetected = detection.facesDetected;
          const wasDetected = this.currentDetection;
          
          if (currentDetected && !wasDetected) {
            console.log(`🎉 NEW FACE DETECTED! Count: ${detection.faceCount}, Confidence: ${detection.confidence}`);
            this.currentDetection = true;
            
            if (this.detectionCallback) {
              console.log('📞 Calling detection callback - FACE DETECTED');
              this.detectionCallback(true, detection.faceCount);
            }
          } else if (!currentDetected && wasDetected) {
            console.log('👋 Face detection lost');
            this.currentDetection = false;
            
            if (this.detectionCallback) {
              console.log('📞 Calling detection callback - FACE LOST');
              this.detectionCallback(false, 0);
            }
          }
        } else {
          console.log('⚠️ Detection failed, video may not be ready yet');
        }
      } catch (error) {
        console.error('🚫 Face detection error:', error);
      }
    }, 3000); // 3 seconds for better stability
  }

  stopDetection(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
    this.currentDetection = false;
  }

  getCurrentDetection(): boolean {
    return this.currentDetection;
  }
}
