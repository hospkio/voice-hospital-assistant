
import { useState, useRef, useEffect } from 'react';

interface DetectionResult {
  peopleDetected: boolean;
  confidence: number;
  boundingBoxes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export const useCameraDetection = () => {
  const [isActive, setIsActive] = useState(false);
  const [peopleDetected, setPeopleDetected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 640, 
          height: 480,
          facingMode: 'user'
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsActive(true);
      startDetection();
    } catch (error) {
      console.error('Error accessing camera:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setIsActive(false);
    setPeopleDetected(false);
  };

  const detectPeople = async (): Promise<DetectionResult> => {
    if (!videoRef.current || !isActive) {
      return { peopleDetected: false, confidence: 0, boundingBoxes: [] };
    }

    try {
      // Capture frame from video
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get canvas context');
      
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      // Send to Google Vision API
      const response = await fetch('/functions/v1/vision-detect-people', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData.split(',')[1] // Remove data:image/jpeg;base64, prefix
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error detecting people:', error);
      return { peopleDetected: false, confidence: 0, boundingBoxes: [] };
    }
  };

  const startDetection = () => {
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(async () => {
      const detection = await detectPeople();
      setPeopleDetected(detection.peopleDetected);
      
      if (detection.peopleDetected) {
        console.log('People detected with confidence:', detection.confidence);
      }
    }, 2000); // Check every 2 seconds
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    isActive,
    peopleDetected,
    isLoading,
    startCamera,
    stopCamera,
    detectPeople
  };
};
