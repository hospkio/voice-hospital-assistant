
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import VoiceRecorderPhase1 from '@/components/VoiceRecorderPhase1';

const VoiceTestPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Kiosk
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Voice System Development</h1>
        </div>

        {/* Phase Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-blue-800 font-semibold text-xl mb-3">Current Phase: Basic Voice Recording</h2>
          <div className="text-blue-700 space-y-2">
            <p><strong>✅ Phase 1:</strong> Basic Voice Recording - Microphone access, recording, playback</p>
            <p><strong>⏳ Phase 2:</strong> Speech-to-Text - Google Cloud integration</p>
            <p><strong>⏳ Phase 3:</strong> Intent Processing - Dialogflow integration</p>
            <p><strong>⏳ Phase 4:</strong> Response System - Database queries and TTS</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-green-800 font-semibold text-lg mb-3">Phase 1 Testing Instructions:</h3>
          <ol className="text-green-700 space-y-2">
            <li><strong>1.</strong> Click the microphone button to start recording</li>
            <li><strong>2.</strong> Speak clearly for a few seconds</li>
            <li><strong>3.</strong> Click the red stop button to end recording</li>
            <li><strong>4.</strong> Use the play button to hear your recording</li>
            <li><strong>5.</strong> Check console logs for technical details</li>
          </ol>
          <p className="text-green-600 text-sm mt-3">
            <strong>Success criteria:</strong> Clear audio recording and playback with visual feedback
          </p>
        </div>

        {/* Voice Recorder Component */}
        <VoiceRecorderPhase1 />

        {/* System Information */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-800 font-semibold mb-3">Browser Compatibility:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>User Agent:</strong> {navigator.userAgent.split(' ')[0]}</p>
              <p><strong>Media Devices:</strong> {navigator.mediaDevices ? '✅ Supported' : '❌ Not supported'}</p>
            </div>
            <div>
              <p><strong>MediaRecorder:</strong> {'MediaRecorder' in window ? '✅ Supported' : '❌ Not supported'}</p>
              <p><strong>Web Audio:</strong> {'AudioContext' in window ? '✅ Supported' : '❌ Not supported'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceTestPage;
