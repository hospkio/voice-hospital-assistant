
import { useState, useRef, useEffect, useCallback } from 'react';
import { FaceDetectionState, DetectionCallback } from '@/types/faceDetection';
import { CameraService } from '@/services/cameraService';
import { FaceDetectionService } from '@/services/faceDetectionService';
import { DetectionManager } from '@/services/detectionManager';

export const useFaceDetection = (autoStart: boolean = true) => {
  const [state, setState] = useState<FaceDetectionState>({
    isActive: false,
    facesDetected: false,
    faceCount: 0,
    isLoading: false,
    lastDetectionTime: 0
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraServiceRef = useRef(new CameraService());
  const faceDetectionServiceRef = useRef(new FaceDetectionService(cameraServiceRef.current));
  const detectionManagerRef = useRef(new DetectionManager(faceDetectionServiceRef.current));
  const autoStartedRef = useRef(false);

  const startCamera = async () => {
    if (!videoRef.current) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      console.log('🎥 Starting camera for face detection...');
      
      await cameraServiceRef.current.startCamera(videoRef.current);
      
      console.log('✅ Camera started successfully');
      setState(prev => ({ ...prev, isLoading: false, isActive: true }));
      
      // Delay starting detection to ensure video is fully ready
      setTimeout(() => {
        detectionManagerRef.current.startDetection();
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera...');
    
    cameraServiceRef.current.stopCamera();
    detectionManagerRef.current.stopDetection();
    
    setState({
      isActive: false,
      facesDetected: false,
      faceCount: 0,
      isLoading: false,
      lastDetectionTime: 0
    });
  }, []);

  const detectFaces = async () => {
    return await faceDetectionServiceRef.current.detectFaces();
  };

  const setDetectionCallback = useCallback((callback: DetectionCallback) => {
    console.log('🔗 Setting detection callback');
    detectionManagerRef.current.setDetectionCallback((detected: boolean, count: number) => {
      setState(prev => ({
        ...prev,
        facesDetected: detected,
        faceCount: count,
        lastDetectionTime: detected ? Date.now() : prev.lastDetectionTime
      }));
      callback(detected, count);
    });
  }, []);

  // Auto-start camera when component mounts
  useEffect(() => {
    if (autoStart && !autoStartedRef.current) {
      autoStartedRef.current = true;
      console.log('🚀 Auto-starting face detection camera...');
      
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        startCamera();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isActive: state.isActive,
    facesDetected: state.facesDetected,
    faceCount: state.faceCount,
    isLoading: state.isLoading,
    lastDetectionTime: state.lastDetectionTime,
    startCamera,
    stopCamera,
    detectFaces,
    setDetectionCallback
  };
};
