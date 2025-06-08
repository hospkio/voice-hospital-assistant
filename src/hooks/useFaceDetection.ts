
import { useState, useRef, useEffect, useCallback } from 'react';

interface FaceDetectionResult {
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

export const useFaceDetection = () => {
  const [isActive, setIsActive] = useState(false);
  const [facesDetected, setFacesDetected] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastDetectionTime, setLastDetectionTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      console.log('🎥 Starting camera for face detection...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: 'user'
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to load before starting detection
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Video loaded, starting face detection...');
          startFaceDetection();
        };
      }
      
      setIsActive(true);
      console.log('✅ Camera started successfully');
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
      setIsLoading(false);
    }
  };

  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera...');
    
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
    setIsLoading(false);
  }, []);

  const detectFaces = async (): Promise<FaceDetectionResult> => {
    if (!videoRef.current || !isActive || videoRef.current.readyState < 2) {
      return { facesDetected: false, faceCount: 0, confidence: 0, boundingBoxes: [], success: false };
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Cannot get canvas context');
      
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log('🔍 Sending image for face detection...');
      
      const response = await fetch('/functions/v1/vision-detect-faces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageData.split(',')[1]
        }),
      });

      if (!response.ok) {
        throw new Error(`Face detection failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('👁️ Face detection result:', result);
      
      return {
        facesDetected: result.facesDetected || false,
        faceCount: result.faceCount || 0,
        confidence: result.confidence || 0,
        boundingBoxes: result.boundingBoxes || [],
        success: result.success || false
      };
    } catch (error) {
      console.error('❌ Error detecting faces:', error);
      return { facesDetected: false, faceCount: 0, confidence: 0, boundingBoxes: [], success: false };
    }
  };

  const startFaceDetection = useCallback(() => {
    if (intervalRef.current) return;
    
    console.log('🎯 Starting face detection interval...');
    intervalRef.current = setInterval(async () => {
      const detection = await detectFaces();
      
      if (detection.success) {
        setFacesDetected(detection.facesDetected);
        setFaceCount(detection.faceCount);
        setLastDetectionTime(Date.now());
        
        if (detection.facesDetected) {
          console.log(`👥 ${detection.faceCount} face(s) detected with confidence: ${detection.confidence}`);
        }
      }
    }, 2000); // Check every 2 seconds for better performance
  }, []);

  useEffect(() => {
    setIsLoading(false);
  }, [isActive]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isActive,
    facesDetected,
    faceCount,
    isLoading,
    lastDetectionTime,
    startCamera,
    stopCamera,
    detectFaces
  };
};
