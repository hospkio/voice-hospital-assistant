
export class CameraService {
  private streamRef: MediaStream | null = null;
  private videoRef: HTMLVideoElement | null = null;

  async startCamera(videoElement: HTMLVideoElement): Promise<void> {
    try {
      console.log('🎥 Starting camera for face detection...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      this.streamRef = stream;
      this.videoRef = videoElement;
      videoElement.srcObject = stream;
      
      return new Promise((resolve, reject) => {
        videoElement.onloadedmetadata = () => {
          console.log('📹 Video loaded, starting face detection...');
          videoElement.play().then(() => {
            console.log('🎬 Video playing, ready state:', videoElement.readyState);
            resolve();
          }).catch(reject);
        };

        videoElement.onerror = (error) => {
          console.error('Video error:', error);
          reject(error);
        };
      });
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
      throw error;
    }
  }

  stopCamera(): void {
    console.log('🛑 Stopping camera...');
    
    if (this.streamRef) {
      this.streamRef.getTracks().forEach(track => track.stop());
      this.streamRef = null;
    }
    
    this.videoRef = null;
  }

  isVideoReady(): boolean {
    if (!this.videoRef) {
      console.log('🚫 No video element available');
      return false;
    }

    const readyState = this.videoRef.readyState;
    const videoWidth = this.videoRef.videoWidth;
    const videoHeight = this.videoRef.videoHeight;
    
    console.log('🔍 Video state check:', {
      readyState,
      videoWidth,
      videoHeight,
      currentTime: this.videoRef.currentTime,
      paused: this.videoRef.paused
    });

    return readyState >= 2 && videoWidth > 0 && videoHeight > 0;
  }
}
