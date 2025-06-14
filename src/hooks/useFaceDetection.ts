
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
  const callbackSetRef = useRef(false);
  const isEnabledRef = useRef(autoStart);

  const startCamera = async () => {
    if (!videoRef.current || !isEnabledRef.current) {
      console.log('🚫 Camera start blocked - face detection disabled');
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true }));
      console.log('🎥 Starting camera for face detection...');
      
      await cameraServiceRef.current.startCamera(videoRef.current);
      
      console.log('✅ Camera started successfully');
      setState(prev => ({ ...prev, isLoading: false, isActive: true }));
      
      // Only start detection if still enabled
      setTimeout(() => {
        if (isEnabledRef.current) {
          console.log('🎯 Starting face detection after camera ready...');
          detectionManagerRef.current.startDetection();
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ Error accessing camera:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const stopCamera = useCallback(() => {
    console.log('🛑 Stopping camera and all detection services...');
    
    // Stop all services immediately
    detectionManagerRef.current.stopDetection();
    cameraServiceRef.current.stopCamera();
    
    // Reset all state
    setState({
      isActive: false,
      facesDetected: false,
      faceCount: 0,
      isLoading: false,
      lastDetectionTime: 0
    });
    
    // Reset callback reference
    callbackSetRef.current = false;
    autoStartedRef.current = false;
    
    console.log('✅ All face detection services stopped');
  }, []);

  const detectFaces = async () => {
    if (!isEnabledRef.current) {
      return { facesDetected: false, faceCount: 0, confidence: 0, boundingBoxes: [], success: false };
    }
    return await faceDetectionServiceRef.current.detectFaces();
  };

  const setDetectionCallback = useCallback((callback: DetectionCallback) => {
    if (!isEnabledRef.current) {
      console.log('🚫 Detection callback blocked - face detection disabled');
      return;
    }
    
    if (callbackSetRef.current) {
      console.log('🔄 Callback already set, skipping...');
      return;
    }
    
    console.log('🔗 Setting NEW detection callback');
    callbackSetRef.current = true;
    
    detectionManagerRef.current.setDetectionCallback((detected: boolean, count: number) => {
      // Double-check enabled state before triggering callback
      if (!isEnabledRef.current) {
        console.log('🚫 Callback blocked - face detection disabled during execution');
        return;
      }
      
      console.log('📞 Detection manager callback triggered:', { detected, count });
      setState(prev => ({
        ...prev,
        facesDetected: detected,
        faceCount: count,
        lastDetectionTime: detected ? Date.now() : prev.lastDetectionTime
      }));
      callback(detected, count);
    });
  }, []);

  // Update enabled ref when autoStart changes
  useEffect(() => {
    isEnabledRef.current = autoStart;
    
    if (!autoStart) {
      console.log('🚫 Face detection disabled, stopping all services immediately...');
      stopCamera();
      return;
    }
  }, [autoStart, stopCamera]);

  // Auto-start camera when component mounts - only if autoStart is true
  useEffect(() => {
    if (autoStart && !autoStartedRef.current && isEnabledRef.current) {
      autoStartedRef.current = true;
      console.log('🚀 Auto-starting face detection camera...');
      
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        if (isEnabledRef.current) {
          startCamera();
        }
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
    isActive: state.isActive && isEnabledRef.current,
    facesDetected: state.facesDetected && isEnabledRef.current,
    faceCount: isEnabledRef.current ? state.faceCount : 0,
    isLoading: state.isLoading,
    lastDetectionTime: state.lastDetectionTime,
    startCamera,
    stopCamera,
    detectFaces,
    setDetectionCallback
  };
};
