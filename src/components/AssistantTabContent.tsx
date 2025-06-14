
import React from 'react';
import { Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EnhancedVoiceRecorder from '@/components/EnhancedVoiceRecorder';
import EnhancedResponseDisplay from '@/components/EnhancedResponseDisplay';
import EnhancedFaceDetectionCamera from '@/components/EnhancedFaceDetectionCamera';
import QuickActionsPanel from '@/components/QuickActionsPanel';
import SessionStatusPanel from '@/components/SessionStatusPanel';
import { useDialogflowAutomation } from '@/hooks/useDialogflowAutomation';

interface AssistantTabContentProps {
  state: any;
  isListening: boolean;
  onVoiceData: (transcript: string, confidence: number, detectedLanguage: string) => void;
  onListeningChange: (listening: boolean) => void;
  onFaceDetected: (detected: boolean, count: number) => void;
  onQuickAction: (query: string) => void;
  onAutoGreetingTriggered: () => void;
  faceDetectionEnabled: boolean;
}

const AssistantTabContent: React.FC<AssistantTabContentProps> = ({
  state,
  isListening,
  onVoiceData,
  onListeningChange,
  onFaceDetected,
  onQuickAction,
  onAutoGreetingTriggered,
  faceDetectionEnabled
}) => {
  const { processUserQuery } = useDialogflowAutomation();

  // Enhanced voice data handler that processes queries through our automation system
  const handleVoiceData = async (transcript: string, confidence: number, detectedLanguage: string) => {
    console.log('🎤 Voice data received in AssistantTab:', { transcript, confidence, detectedLanguage });
    
    // Call the original handler first
    onVoiceData(transcript, confidence, detectedLanguage);
    
    // If we have a good transcript, process it through our automation system
    if (transcript && transcript.trim().length > 3 && confidence > 0.5) {
      try {
        console.log('🤖 Processing query through automation system...');
        const sessionId = state.sessionId || `session_${Date.now()}`;
        const result = await processUserQuery(transcript, sessionId, detectedLanguage);
        
        console.log('✅ Automation system response:', result);
        
        // Update the current response in state if there's a way to do it
        // For now, we'll log the result - the parent component should handle state updates
        if (result.success && result.responseText) {
          console.log('📢 Generated response:', result.responseText);
        }
      } catch (error) {
        console.error('❌ Error processing query through automation:', error);
      }
    }
  };

  // Enhanced quick action handler
  const handleQuickAction = async (query: string) => {
    console.log('⚡ Quick action triggered:', query);
    
    // Call the original handler
    onQuickAction(query);
    
    // Process through automation system
    try {
      const sessionId = state.sessionId || `session_${Date.now()}`;
      const result = await processUserQuery(query, sessionId, state.selectedLanguage || 'en-US');
      
      console.log('✅ Quick action automation response:', result);
    } catch (error) {
      console.error('❌ Error processing quick action:', error);
    }
  };

  // Create a wrapped auto-greeting handler that checks BOTH settings
  const handleAutoGreetingTriggered = () => {
    console.log('🤖 AssistantTab auto-greeting check:', {
      autoInteractionEnabled: state.autoInteractionEnabled,
      faceDetectionEnabled,
      bothEnabled: state.autoInteractionEnabled && faceDetectionEnabled
    });
    
    // Only trigger auto-greeting if BOTH settings are enabled
    if (state.autoInteractionEnabled && faceDetectionEnabled) {
      console.log('✅ Both settings enabled, triggering auto-greeting');
      onAutoGreetingTriggered();
    } else {
      console.log('🚫 Auto-greeting blocked by settings', {
        autoInteractionEnabled: state.autoInteractionEnabled,
        faceDetectionEnabled
      });
    }
  };

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
                  <p className="text-blue-100 text-sm">AI-Powered Speech Recognition with Database Integration</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <EnhancedVoiceRecorder 
                isListening={isListening}
                onVoiceData={handleVoiceData}
                language={state.selectedLanguage}
                onListeningChange={onListeningChange}
              />
            </CardContent>
          </Card>

          {/* Face Detection Card */}
          <EnhancedFaceDetectionCamera 
            onFaceDetected={onFaceDetected}
            autoStart={state.autoInteractionEnabled && faceDetectionEnabled}
            onAutoGreetingTriggered={handleAutoGreetingTriggered}
            faceDetectionEnabled={faceDetectionEnabled}
            autoInteractionEnabled={state.autoInteractionEnabled}
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
        <QuickActionsPanel onQuickAction={handleQuickAction} />
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
