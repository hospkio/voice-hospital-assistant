
import { useState, useRef, useEffect } from 'react';

interface FaceDetectionResult {
  facesDetected: boolean;
  faceCount: number;
  confidence: number;
  boundingBoxes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export const useFaceDetection = () => {
  const [isActive, setIsActive] = useState(false);
  const [facesDetected, setFacesDetected] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: 1280, 
          height: 720,
          facingMode: 'user'
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsActive(true);
      startFaceDetection();
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
    setFacesDetected(false);
    setFaceCount(0);
  };

  const detectFaces = async (): Promise<FaceDetectionResult> => {
    if (!videoRef.current || !isActive) {
      return { facesDetected: false, faceCount: 0, confidence: 0, boundingBoxes: [] };
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get canvas context');
      
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      const response = await fetch('/functions/v1/vision-detect-faces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData.split(',')[1]
        }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error detecting faces:', error);
      return { facesDetected: false, faceCount: 0, confidence: 0, boundingBoxes: [] };
    }
  };

  const startFaceDetection = () => {
    if (intervalRef.current) return;
    
    intervalRef.current = setInterval(async () => {
      const detection = await detectFaces();
      setFacesDetected(detection.facesDetected);
      setFaceCount(detection.faceCount);
      
      if (detection.facesDetected) {
        console.log(`${detection.faceCount} face(s) detected with confidence:`, detection.confidence);
      }
    }, 1000); // Check every second for better responsiveness
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return {
    videoRef,
    isActive,
    facesDetected,
    faceCount,
    isLoading,
    startCamera,
    stopCamera,
    detectFaces
  };
};
