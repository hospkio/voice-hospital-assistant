
import React from 'react';
import { Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EnhancedVoiceRecorder from '@/components/EnhancedVoiceRecorder';
import EnhancedResponseDisplay from '@/components/EnhancedResponseDisplay';
import EnhancedFaceDetectionCamera from '@/components/EnhancedFaceDetectionCamera';
import QuickActionsPanel from '@/components/QuickActionsPanel';
import SessionStatusPanel from '@/components/SessionStatusPanel';

interface AssistantTabContentProps {
  state: any;
  isListening: boolean;
  onVoiceData: (transcript: string, confidence: number, detectedLanguage: string) => void;
  onListeningChange: (listening: boolean) => void;
  onFaceDetected: (detected: boolean, count: number) => void;
  onQuickAction: (query: string) => void;
  onAutoGreetingTriggered: () => void;
}

const AssistantTabContent: React.FC<AssistantTabContentProps> = ({
  state,
  isListening,
  onVoiceData,
  onListeningChange,
  onFaceDetected,
  onQuickAction,
  onAutoGreetingTriggered
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Voice Assistant Card */}
          <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 text-white">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Volume2 className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Voice Assistant</h3>
                  <p className="text-blue-100 text-sm">AI-Powered Speech Recognition</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <EnhancedVoiceRecorder 
                isListening={isListening}
                onVoiceData={onVoiceData}
                language={state.selectedLanguage}
                onListeningChange={onListeningChange}
              />
            </CardContent>
          </Card>

          {/* Face Detection Card */}
          <EnhancedFaceDetectionCamera 
            onFaceDetected={onFaceDetected}
            autoStart={state.autoInteractionEnabled}
            onAutoGreetingTriggered={onAutoGreetingTriggered}
          />
        </div>

        {/* Response Display */}
        <EnhancedResponseDisplay 
          response={state.currentResponse}
          language={state.selectedLanguage}
        />
      </div>

      {/* Control Panel */}
      <div className="space-y-6">
        <QuickActionsPanel onQuickAction={onQuickAction} />
        <SessionStatusPanel 
          selectedLanguage={state.selectedLanguage}
          sessionId={state.sessionId}
          conversationHistory={state.conversationHistory}
          autoInteractionEnabled={state.autoInteractionEnabled}
          facesDetected={state.facesDetected}
          faceCount={state.faceCount}
        />
      </div>
    </div>
  );
};

export default AssistantTabContent;
