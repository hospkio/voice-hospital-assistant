import React, { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, Mic, MicOff, Eye, MessageSquare, Volume2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';

const VoiceRecorderPhase5 = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('en-US');
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const { speechToText, textToSpeech, playAudio } = useGoogleCloudServices();
  const { 
    videoRef, 
    isActive: isCameraActive, 
    facesDetected, 
    faceCount,
    isLoading: cameraLoading, 
    startCamera, 
    stopCamera,
    setDetectionCallback
  } = useFaceDetection();

  const greetings = {
    'en-US': 'Hello! Welcome to our hospital. How can I help you today?',
    'hi-IN': 'नमस्ते! हमारे अस्पताल में आपका स्वागत है। आज मैं आपकी कैसे सहायता कर सकता हूं?',
    'ml-IN': 'നമസ്കാരം! ഞങ്ങളുടെ ആശുപത്രിയിലേക്ക് സ്വാഗതം. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?',
    'ta-IN': 'வணக்கம்! எங்கள் மருத்துவமனைக்கு வரவேற்கிறோம். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?'
  };

  // Set up face detection callback for auto-greeting
  useEffect(() => {
    setDetectionCallback((detected: boolean, count: number) => {
      if (detected && !hasGreeted) {
        console.log('👥 Face detected! Triggering auto-greeting...');
        triggerAutoGreeting();
      }
    });
  }, [hasGreeted, setDetectionCallback]);

  const triggerAutoGreeting = async () => {
    if (hasGreeted) return;
    
    console.log('🤖 Starting auto-greeting sequence...');
    setHasGreeted(true);
    
    // Default to English greeting initially
    const defaultGreeting = greetings['en-US'];
    setGreetingMessage(`Auto-greeting: ${defaultGreeting}`);
    
    try {
      // Generate and play greeting audio
      const ttsResponse = await textToSpeech(defaultGreeting, 'en-US');
      if (ttsResponse.success && ttsResponse.audioContent) {
        await playAudio(ttsResponse.audioContent);
      }
      
      // Start recording after greeting
      setTimeout(() => {
        startRecording();
      }, 2000);
    } catch (error) {
      console.error('Error in auto-greeting:', error);
    }
  };

  const startRecording = async () => {
    try {
      console.log('🎤 Starting recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      
      // Start recording
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Start monitoring audio levels and silence
      monitorAudioLevels();
      resetSilenceTimer();
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
      
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const monitorAudioLevels = () => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const checkLevel = () => {
      analyserRef.current!.getByteFrequencyData(dataArray);
      const level = Math.max(...dataArray) / 255;
      setAudioLevel(level);
      
      // Reset silence timer if there's audio
      if (level > 0.01) {
        resetSilenceTimer();
      }
      
      if (isRecording) {
        animationRef.current = requestAnimationFrame(checkLevel);
      }
    };
    
    checkLevel();
  };

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    silenceTimerRef.current = setTimeout(() => {
      console.log('🔇 Silence detected, stopping recording...');
      stopRecording();
    }, 3000); // 3 seconds of silence
  };

  const processAudio = async (audioBlob: Blob) => {
    console.log('🔄 Processing audio...');
    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      const result = await speechToText(audioBlob, detectedLanguage);
      
      if (result.transcript) {
        setTranscript(result.transcript);
        setDetectedLanguage(result.detectedLanguage || detectedLanguage);
        setConfidence(result.confidence);
        
        // Update greeting language if different language detected
        if (result.detectedLanguage && result.detectedLanguage !== 'en-US') {
          const newGreeting = greetings[result.detectedLanguage as keyof typeof greetings];
          if (newGreeting) {
            setGreetingMessage(`Language adapted greeting: ${newGreeting}`);
            
            // Play greeting in detected language
            try {
              const ttsResponse = await textToSpeech(newGreeting, result.detectedLanguage);
              if (ttsResponse.success && ttsResponse.audioContent) {
                await playAudio(ttsResponse.audioContent);
              }
            } catch (error) {
              console.error('Error playing adapted greeting:', error);
            }
          }
        }
        
        console.log('✅ Transcription successful:', result.transcript);
      }
    } catch (error) {
      console.error('❌ Error processing audio:', error);
      setTranscript('Error processing audio');
    } finally {
      setIsProcessing(false);
      setProcessingTime(Date.now() - startTime);
    }
  };

  const resetSession = () => {
    setTranscript('');
    setGreetingMessage('');
    setHasGreeted(false);
    setConfidence(0);
    setProcessingTime(0);
    setDetectedLanguage('en-US');
  };

  return (
    <div className="space-y-6">
      {/* Main Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Face Detection Camera */}
        <Card className="border-2 border-teal-200">
          <CardHeader className="bg-teal-50">
            <CardTitle className="flex items-center space-x-2 text-teal-800">
              <Eye className="h-5 w-5" />
              <span>Face Detection Camera</span>
              {facesDetected && (
                <div className="ml-auto flex items-center space-x-2 bg-green-100 px-3 py-1 rounded-full">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="text-green-800 font-bold">{faceCount}</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video mb-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {!isCameraActive && !cameraLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800/90">
                  <div className="text-center text-white">
                    <CameraOff className="h-12 w-12 mx-auto mb-3 opacity-60" />
                    <p className="text-lg">Camera Off</p>
                  </div>
                </div>
              )}
              
              {facesDetected && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                  Face Detected - Auto-greeting Active
                </div>
              )}
            </div>
            
            <Button
              onClick={isCameraActive ? stopCamera : startCamera}
              disabled={cameraLoading}
              className={`w-full ${isCameraActive ? 'bg-red-500 hover:bg-red-600' : 'bg-teal-500 hover:bg-teal-600'}`}
            >
              {cameraLoading ? (
                'Starting Camera...'
              ) : isCameraActive ? (
                <>
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Camera
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Voice Recording */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Mic className="h-5 w-5" />
              <span>Voice Recording</span>
              {isRecording && (
                <div className="ml-auto bg-red-100 px-3 py-1 rounded-full">
                  <span className="text-red-800 font-bold">RECORDING</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {/* Audio Level Visualization */}
            <div className="mb-4">
              <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-100 ease-out"
                  style={{ width: `${audioLevel * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-1">Audio Level: {(audioLevel * 100).toFixed(0)}%</p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'}`}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetSession}
                variant="outline"
                className="w-full"
              >
                Reset Session
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Greeting Message */}
        {greetingMessage && (
          <Card className="border-2 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center space-x-2 text-green-800">
                <Volume2 className="h-5 w-5" />
                <span>Auto Greeting</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                <p className="text-green-800 font-medium">{greetingMessage}</p>
                <p className="text-green-600 text-sm mt-2">Language: {detectedLanguage}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transcription Results */}
        {transcript && (
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center space-x-2 text-purple-800">
                <MessageSquare className="h-5 w-5" />
                <span>Speech Recognition</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
                  <p className="text-purple-800 font-medium">{transcript}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Language:</span>
                    <span className="ml-2">{detectedLanguage}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Confidence:</span>
                    <span className="ml-2">{(confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="font-semibold">Processing:</span>
                    <span className="ml-2">{processingTime}ms</span>
                  </div>
                  <div>
                    <span className="font-semibold">Faces:</span>
                    <span className="ml-2">{faceCount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Status Information */}
      <Card className="border-2 border-gray-200">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-gray-800">Phase 5 Status</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${isCameraActive ? 'bg-green-500' : 'bg-gray-300'}`} />
              <p className="font-semibold">Camera</p>
              <p className="text-gray-600">{isCameraActive ? 'Active' : 'Inactive'}</p>
            </div>
            
            <div className="text-center">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${facesDetected ? 'bg-blue-500' : 'bg-gray-300'}`} />
              <p className="font-semibold">Face Detection</p>
              <p className="text-gray-600">{facesDetected ? 'Detected' : 'None'}</p>
            </div>
            
            <div className="text-center">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${hasGreeted ? 'bg-purple-500' : 'bg-gray-300'}`} />
              <p className="font-semibold">Auto Greeting</p>
              <p className="text-gray-600">{hasGreeted ? 'Completed' : 'Waiting'}</p>
            </div>
            
            <div className="text-center">
              <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${isRecording ? 'bg-red-500' : transcript ? 'bg-green-500' : 'bg-gray-300'}`} />
              <p className="font-semibold">Voice</p>
              <p className="text-gray-600">{isRecording ? 'Recording' : transcript ? 'Processed' : 'Ready'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceRecorderPhase5;
