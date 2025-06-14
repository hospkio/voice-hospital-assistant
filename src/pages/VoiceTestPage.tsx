
import React, { useState } from 'react';
import { ArrowLeft, Mic, MessageSquare, Brain, Database, Eye, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import VoiceRecorderPhase1 from '@/components/VoiceRecorderPhase1';
import VoiceRecorderPhase2 from '@/components/VoiceRecorderPhase2';
import VoiceRecorderPhase3 from '@/components/VoiceRecorderPhase3';
import VoiceRecorderPhase5 from '@/components/VoiceRecorderPhase5';

const VoiceTestPage = () => {
  const navigate = useNavigate();
  const [activePhase, setActivePhase] = useState('phase3');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate('/')} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">Voice System Development & Testing</h1>
        </div>

        {/* Audio Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-3">
            <Volume2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-blue-800 font-semibold text-xl">Audio Output Enabled</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2 text-blue-700">
              <p>• Phase 3 & 5 now include automatic audio responses</p>
              <p>• System will speak back answers from hospital database</p>
              <p>• Manual play buttons available for all responses</p>
            </div>
            <div className="space-y-2 text-blue-700">
              <p>• Try asking: "Where is the cardiology department?"</p>
              <p>• Or: "I need to book an appointment with a doctor"</p>
              <p>• Face detection triggers auto-greeting with voice</p>
            </div>
          </div>
        </div>

        {/* Phase Progress */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-blue-800 font-semibold text-xl mb-3">Development Phases</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Mic className="h-5 w-5 text-green-600" />
                <span className="font-semibold text-green-800">Phase 1: Voice Recording</span>
              </div>
              <p className="text-green-700">✅ Auto-stop on silence</p>
              <p className="text-green-700">✅ Audio level monitoring</p>
              <p className="text-green-700">✅ Playback & controls</p>
            </div>
            
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Phase 2: Speech-to-Text</span>
              </div>
              <p className="text-blue-700">✅ Google Cloud Speech API</p>
              <p className="text-blue-700">✅ Language detection</p>
              <p className="text-blue-700">✅ Confidence scoring</p>
            </div>
            
            <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-800">Phase 3: Intent + Audio</span>
              </div>
              <p className="text-purple-700">✅ Hospital data queries</p>
              <p className="text-purple-700">✅ Intent processing</p>
              <p className="text-purple-700">🔊 Audio responses</p>
            </div>
            
            <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-5 w-5 text-orange-600" />
                <span className="font-semibold text-orange-800">Phase 4: Database & TTS</span>
              </div>
              <p className="text-orange-700">⏳ Advanced queries</p>
              <p className="text-orange-700">⏳ Multi-language TTS</p>
              <p className="text-orange-700">⏳ Complete integration</p>
            </div>

            <div className="bg-teal-100 border border-teal-300 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="h-5 w-5 text-teal-600" />
                <span className="font-semibold text-teal-800">Phase 5: Complete System</span>
              </div>
              <p className="text-teal-700">✅ Face detection</p>
              <p className="text-teal-700">✅ Auto voice greeting</p>
              <p className="text-teal-700">🔊 Full audio integration</p>
            </div>
          </div>
        </div>

        {/* Testing Interface */}
        <Tabs value={activePhase} onValueChange={setActivePhase}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="phase1" className="flex items-center space-x-2">
              <Mic className="h-4 w-4" />
              <span>Phase 1</span>
            </TabsTrigger>
            <TabsTrigger value="phase2" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Phase 2</span>
            </TabsTrigger>
            <TabsTrigger value="phase3" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Phase 3</span>
            </TabsTrigger>
            <TabsTrigger value="phase5" className="flex items-center space-x-2">
              <Eye className="h-4 w-4" />
              <span>Phase 5</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phase1" className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-green-800 font-semibold text-lg mb-3">Phase 1: Voice Recording with Auto-Stop</h3>
              <div className="space-y-2 text-green-700 mb-4">
                <p>• Click microphone to start recording</p>
                <p>• Recording automatically stops after 3 seconds of silence</p>
                <p>• Visual audio level feedback</p>
                <p>• Playback recorded audio</p>
              </div>
            </div>
            <VoiceRecorderPhase1 />
          </TabsContent>

          <TabsContent value="phase2" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-blue-800 font-semibold text-lg mb-3">Phase 2: Speech-to-Text Integration</h3>
              <div className="space-y-2 text-blue-700 mb-4">
                <p>• Voice recording + Google Cloud Speech API</p>
                <p>• Automatic language detection</p>
                <p>• Confidence scoring and processing time</p>
                <p>• Real-time transcription results</p>
              </div>
            </div>
            <VoiceRecorderPhase2 />
          </TabsContent>

          <TabsContent value="phase3" className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h3 className="text-purple-800 font-semibold text-lg mb-3">Phase 3: Complete Voice System with Audio Response</h3>
              <div className="space-y-2 text-purple-700 mb-4">
                <p>• Voice → Speech-to-Text → Hospital Database Query</p>
                <p>• Intelligent intent recognition and entity extraction</p>
                <p>• 🔊 Automatic audio response playback</p>
                <p>• Hospital-specific query understanding with voice feedback</p>
              </div>
            </div>
            <VoiceRecorderPhase3 />
          </TabsContent>

          <TabsContent value="phase5" className="space-y-6">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
              <h3 className="text-teal-800 font-semibold text-lg mb-3">Phase 5: Complete System with Face Detection & Audio</h3>
              <div className="space-y-2 text-teal-700 mb-4">
                <p>• Face detection triggers automatic voice greeting</p>
                <p>• Complete voice interaction with hospital database</p>
                <p>• 🔊 Multi-language audio responses</p>
                <p>• Full integration: Vision + Voice + Database + Audio Output</p>
              </div>
            </div>
            <VoiceRecorderPhase5 />
          </TabsContent>
        </Tabs>

        {/* Browser Compatibility Info */}
        <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
          <h3 className="text-gray-800 font-semibold mb-3">System Information:</h3>
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
