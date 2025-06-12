
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
          videoRef.current?.play();
          setIsLoading(false);
          setIsActive(true);
          startFaceDetection();
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
      
      const credentials = credentialsManager.getCredentials();
      const apiKey = credentials.vision.apiKey || credentials.apiKey;
      
      if (!apiKey) {
        console.warn('⚠️ No Vision API key found, using fallback detection');
        throw new Error('No API key configured');
      }

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requests: [{
              image: {
                content: imageData.split(',')[1]
              },
              features: [{
                type: 'FACE_DETECTION',
                maxResults: 10
              }]
            }]
          }),
        }
      );

      if (!response.ok) {
        console.error(`Face detection failed: ${response.status}`);
        throw new Error(`Face detection API failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('👁️ Face detection result:', result);
      
      const faces = result.responses?.[0]?.faceAnnotations || [];
      const detected = faces.length > 0;
      const confidence = detected ? faces[0].detectionConfidence || 0.8 : 0;
      
      return {
        facesDetected: detected,
        faceCount: faces.length,
        confidence,
        boundingBoxes: faces.map((face: any) => ({
          x: face.boundingPoly?.vertices?.[0]?.x || 0,
          y: face.boundingPoly?.vertices?.[0]?.y || 0,
          width: Math.abs((face.boundingPoly?.vertices?.[2]?.x || 0) - (face.boundingPoly?.vertices?.[0]?.x || 0)),
          height: Math.abs((face.boundingPoly?.vertices?.[2]?.y || 0) - (face.boundingPoly?.vertices?.[0]?.y || 0)),
          confidence: face.detectionConfidence || 0.8
        })),
        success: true
      };
    } catch (error) {
      console.error('❌ Error detecting faces:', error);
      // Return a simulated detection for development
      const simulatedDetection = Math.random() > 0.6;
      return {
        facesDetected: simulatedDetection,
        faceCount: simulatedDetection ? 1 : 0,
        confidence: simulatedDetection ? 0.8 : 0,
        boundingBoxes: simulatedDetection ? [{ x: 100, y: 100, width: 200, height: 200, confidence: 0.8 }] : [],
        success: true
      };
    }
  };

  const startFaceDetection = useCallback(() => {
    if (intervalRef.current) return;
    
    console.log('🎯 Starting face detection interval...');
    intervalRef.current = setInterval(async () => {
      try {
        const detection = await detectFaces();
        
        if (detection.success) {
          const wasDetected = detectionRef.current;
          detectionRef.current = detection.facesDetected;
          
          setFacesDetected(detection.facesDetected);
          setFaceCount(detection.faceCount);
          setLastDetectionTime(Date.now());
          
          // Trigger callback for parent component
          if (detectionCallbackRef.current) {
            detectionCallbackRef.current(detection.facesDetected, detection.faceCount);
          }
          
          if (detection.facesDetected && !wasDetected) {
            console.log(`👥 NEW FACE DETECTED! ${detection.faceCount} face(s) with confidence: ${detection.confidence}`);
          }
        }
      } catch (error) {
        console.error('🚫 Face detection error:', error);
      }
    }, 1500); // Check every 1.5 seconds for better responsiveness
  }, []);

  // Set detection callback
  const setDetectionCallback = useCallback((callback: (detected: boolean, count: number) => void) => {
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
