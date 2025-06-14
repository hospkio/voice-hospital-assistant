
import { useState, useRef, useEffect, useCallback } from 'react';
import { credentialsManager } from '@/utils/credentialsManager';

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
  const detectionRef = useRef<boolean>(false);
  const detectionCallbackRef = useRef<((detected: boolean, count: number) => void) | null>(null);
  const consecutiveDetectionsRef = useRef<number>(0);
  const consecutiveMissesRef = useRef<number>(0);

  const startCamera = async () => {
    try {
      setIsLoading(true);
      console.log('🎥 Starting camera for face detection...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          console.log('📹 Video loaded, starting face detection...');
          if (videoRef.current) {
            videoRef.current.play().then(() => {
              setIsLoading(false);
              setIsActive(true);
              startFaceDetection();
            }).catch(error => {
              console.error('Error playing video:', error);
              setIsLoading(false);
            });
          }
        };

        videoRef.current.onerror = (error) => {
          console.error('Video error:', error);
          setIsLoading(false);
        };
      }
      
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
    detectionRef.current = false;
    consecutiveDetectionsRef.current = 0;
    consecutiveMissesRef.current = 0;
  }, []);

  const detectFaces = async (): Promise<FaceDetectionResult> => {
    if (!videoRef.current || !isActive || videoRef.current.readyState < 2) {
      console.log('🚫 Cannot detect faces - video not ready');
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
      
      console.log('🔍 Analyzing image for faces...');
      
      const credentials = credentialsManager.getCredentials();
      const apiKey = credentials.vision.apiKey || credentials.apiKey;
      
      // For testing, let's use a more frequent simulated detection
      console.log('⚠️ Using simulated face detection for testing');
      const simulatedDetection = Math.random() > 0.3; // 70% chance of detection for testing
      console.log(`🎲 Simulated detection result: ${simulatedDetection}`);
      
      return {
        facesDetected: simulatedDetection,
        faceCount: simulatedDetection ? 1 : 0,
        confidence: simulatedDetection ? 0.9 : 0,
        boundingBoxes: simulatedDetection ? [{ x: 100, y: 100, width: 200, height: 200, confidence: 0.9 }] : [],
        success: true
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
      try {
        const detection = await detectFaces();
        console.log('🔍 Detection result:', detection);
        
        if (detection.success) {
          const currentDetected = detection.facesDetected;
          const wasDetected = detectionRef.current;
          
          // Simplified detection logic for testing
          if (currentDetected && !wasDetected) {
            console.log(`👥 FACE DETECTED! ${detection.faceCount} face(s) detected with confidence: ${detection.confidence}`);
            detectionRef.current = true;
            setFacesDetected(true);
            setFaceCount(detection.faceCount);
            setLastDetectionTime(Date.now());
            
            // Trigger callback immediately for testing
            if (detectionCallbackRef.current) {
              console.log('📞 Calling detection callback with face detected');
              detectionCallbackRef.current(true, detection.faceCount);
            }
          } else if (!currentDetected && wasDetected) {
            console.log('👋 Face detection lost');
            detectionRef.current = false;
            setFacesDetected(false);
            setFaceCount(0);
            
            if (detectionCallbackRef.current) {
              console.log('📞 Calling detection callback with face lost');
              detectionCallbackRef.current(false, 0);
            }
          }
          
          // Update count if already detected
          if (detectionRef.current && currentDetected) {
            setFaceCount(detection.faceCount);
          }
        }
      } catch (error) {
        console.error('🚫 Face detection error:', error);
      }
    }, 2000); // Check every 2 seconds for easier testing
  }, []);

  // Set detection callback
  const setDetectionCallback = useCallback((callback: (detected: boolean, count: number) => void) => {
    console.log('🔗 Setting detection callback');
    detectionCallbackRef.current = callback;
  }, []);

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
    detectFaces,
    setDetectionCallback
  };
};
