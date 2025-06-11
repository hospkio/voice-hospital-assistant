
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import BasicVoiceRecorder from '@/components/BasicVoiceRecorder';
import SpeechToTextTester from '@/components/SpeechToTextTester';

const VoiceTestPage = () => {
  const navigate = useNavigate();
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleVoiceData = (blob: Blob) => {
    console.log('🎵 Audio received in test page:', blob.size, 'bytes');
    setAudioBlob(blob);
  };

  const handleError = (error: string) => {
    console.error('❌ Voice recorder error:', error);
    setErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: ${error}`]);
  };

  const handleReset = () => {
    setAudioBlob(null);
    setErrors([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Kiosk
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Voice System Test Page</h1>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-blue-800 font-semibold text-xl mb-3">Testing Instructions</h2>
          <ol className="text-blue-700 space-y-2">
            <li><strong>Step 1:</strong> Test voice recording - Click mic, speak clearly, click stop</li>
            <li><strong>Step 2:</strong> Test Speech-to-Text API - Process your recording</li>
            <li><strong>Step 3:</strong> Check browser console for detailed debugging info</li>
            <li><strong>Step 4:</strong> If errors occur, they'll be displayed below</li>
          </ol>
        </div>

        {/* Voice Recorder */}
        <BasicVoiceRecorder 
          onVoiceData={handleVoiceData}
          onError={handleError}
        />

        {/* Speech-to-Text Tester */}
        <SpeechToTextTester 
          audioBlob={audioBlob}
          onReset={handleReset}
        />

        {/* Error Log */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-3">Error Log:</h3>
            <div className="space-y-1">
              {errors.map((error, index) => (
                <p key={index} className="text-red-600 text-sm font-mono">{error}</p>
              ))}
            </div>
            <Button onClick={() => setErrors([])} variant="outline" size="sm" className="mt-3">
              Clear Errors
            </Button>
          </div>
        )}

        {/* System Information */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-800 font-semibold mb-3">System Information:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
              <p><strong>Media Devices:</strong> {navigator.mediaDevices ? '✅ Supported' : '❌ Not supported'}</p>
            </div>
            <div>
              <p><strong>WebRTC:</strong> {'RTCPeerConnection' in window ? '✅ Supported' : '❌ Not supported'}</p>
              <p><strong>MediaRecorder:</strong> {'MediaRecorder' in window ? '✅ Supported' : '❌ Not supported'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTestPage;
