
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const VoiceRecorderPhase1 = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    return () => {
      cleanup();
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const checkMicrophonePermission = async () => {
    try {
      console.log('🎤 Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      });
      
      // Test that we actually have audio
      const tracks = stream.getAudioTracks();
      if (tracks.length === 0) {
        throw new Error('No audio tracks available');
      }
      
      console.log('✅ Microphone permission granted');
      console.log('🎵 Audio track:', tracks[0].label);
      
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      setHasPermission(false);
      return false;
    }
  };

  const setupAudioLevelMonitoring = (stream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(average);
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };
      
      updateAudioLevel();
    } catch (error) {
      console.warn('Could not setup audio level monitoring:', error);
    }
  };

  const startRecording = async () => {
    if (!await checkMicrophonePermission()) {
      return;
    }

    try {
      console.log('🎤 Starting recording...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Setup audio level monitoring
      setupAudioLevelMonitoring(stream);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/webm'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        console.log('📊 Audio data chunk:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log('🛑 Recording stopped, processing...');
        const blob = new Blob(chunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/webm' 
        });
        
        console.log('🎵 Audio blob created:', blob.size, 'bytes, type:', blob.type);
        setAudioBlob(blob);
        
        // Create URL for playback
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        cleanup();
      };

      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        cleanup();
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log('✅ Recording started successfully');

    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      cleanup();
    }
  };

  const stopRecording = () => {
    console.log('🛑 Stopping recording...');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
  };

  const playAudio = () => {
    if (!audioUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration);
      console.log('🎵 Audio duration:', audio.duration, 'seconds');
    };

    audio.ontimeupdate = () => {
      setPlaybackTime(audio.currentTime);
    };

    audio.onplay = () => {
      setIsPlaying(true);
      console.log('▶️ Audio playback started');
    };

    audio.onpause = () => {
      setIsPlaying(false);
      console.log('⏸️ Audio playback paused');
    };

    audio.onended = () => {
      setIsPlaying(false);
      setPlaybackTime(0);
      console.log('🏁 Audio playback finished');
    };

    audio.onerror = (error) => {
      console.error('❌ Audio playback error:', error);
      setIsPlaying(false);
    };

    audio.play().catch(error => {
      console.error('❌ Failed to play audio:', error);
    });
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsRecording(false);
    setRecordingTime(0);
    setAudioLevel(0);
  };

  const reset = () => {
    cleanup();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl('');
    setIsPlaying(false);
    setPlaybackTime(0);
    setAudioDuration(0);
  };

  if (hasPermission === false) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <h3 className="text-red-600 font-semibold text-lg mb-2">Microphone Access Required</h3>
          <p className="text-red-500 mb-4">Please allow microphone access to continue.</p>
          <Button onClick={checkMicrophonePermission} variant="outline">
            Check Permission Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-center">Phase 1: Voice Recording System</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recording Controls */}
          <div className="text-center space-y-4">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              size="lg"
              className={`h-20 w-20 rounded-full transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isRecording ? (
                <Square className="h-8 w-8" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>

            <div>
              <p className={`text-lg font-semibold ${isRecording ? 'text-red-600' : 'text-gray-700'}`}>
                {isRecording ? `Recording... ${recordingTime}s` : 'Click to start recording'}
              </p>
              {hasPermission === null && (
                <p className="text-gray-500 text-sm">Permission check required</p>
              )}
            </div>
          </div>

          {/* Audio Level Visualization */}
          {isRecording && (
            <div className="space-y-2">
              <p className="text-center text-sm text-gray-600">Audio Level</p>
              <Progress value={audioLevel} className="h-2" />
              <div className="flex justify-center space-x-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-100 ${
                      audioLevel > i * 25 ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                    style={{ height: Math.max(8, (audioLevel / 255) * 40) }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Playback Controls */}
          {audioBlob && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-4">
              <div className="text-center">
                <p className="text-green-800 font-semibold">Recording Complete!</p>
                <p className="text-green-600 text-sm">
                  Audio size: {(audioBlob.size / 1024).toFixed(1)} KB
                </p>
              </div>

              <div className="flex justify-center space-x-2">
                <Button
                  onClick={isPlaying ? pauseAudio : playAudio}
                  variant="outline"
                  size="sm"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>

                <Button onClick={reset} variant="outline" size="sm">
                  Record Again
                </Button>
              </div>

              {/* Playback Progress */}
              {audioDuration > 0 && (
                <div className="space-y-2">
                  <Progress value={(playbackTime / audioDuration) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{playbackTime.toFixed(1)}s</span>
                    <span>{audioDuration.toFixed(1)}s</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status Information */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">System Status:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Microphone:</span> 
                <span className={hasPermission ? 'text-green-600' : 'text-red-600'}>
                  {hasPermission ? ' ✅ Ready' : ' ❌ No access'}
                </span>
              </div>
              <div>
                <span className="font-medium">MediaRecorder:</span>
                <span className="text-green-600"> ✅ Supported</span>
              </div>
              <div>
                <span className="font-medium">Recording:</span>
                <span className={isRecording ? 'text-red-600' : 'text-gray-600'}>
                  {isRecording ? ' 🔴 Active' : ' ⚫ Inactive'}
                </span>
              </div>
              <div>
                <span className="font-medium">Audio Data:</span>
                <span className={audioBlob ? 'text-green-600' : 'text-gray-600'}>
                  {audioBlob ? ' ✅ Ready' : ' ⏳ None'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceRecorderPhase1;
