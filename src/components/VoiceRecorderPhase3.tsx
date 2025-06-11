
import React, { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceRecorderPhase2 from './VoiceRecorderPhase2';
import { useDialogflowCXService } from '@/hooks/useDialogflowCXService';

interface IntentResult {
  intent: string;
  entities: any;
  confidence: number;
  responseText: string;
  responseData: any;
  processingTime: number;
}

const VoiceRecorderPhase3 = () => {
  const [intentResult, setIntentResult] = useState<IntentResult | null>(null);
  const [isProcessingIntent, setIsProcessingIntent] = useState(false);
  const [intentError, setIntentError] = useState<string>('');
  
  const { processWithDialogflowCX } = useDialogflowCXService();

  const handleTranscriptReady = async (transcript: string, detectedLanguage: string) => {
    console.log('🧠 Phase 3: Processing intent for transcript:', transcript);
    setIsProcessingIntent(true);
    setIntentError('');
    setIntentResult(null);
    
    const startTime = Date.now();
    const sessionId = `session_${Date.now()}`;
    
    try {
      const result = await processWithDialogflowCX(transcript, sessionId, detectedLanguage);
      const processingTime = Date.now() - startTime;
      
      console.log('✅ Intent processing successful:', result);
      
      setIntentResult({
        intent: result.intent,
        entities: result.entities,
        confidence: result.confidence,
        responseText: result.responseText,
        responseData: result.responseData,
        processingTime
      });
      
    } catch (error) {
      console.error('❌ Intent processing failed:', error);
      setIntentError(error.message || 'Failed to process intent');
    } finally {
      setIsProcessingIntent(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Speech-to-Text Component */}
      <VoiceRecorderPhase2 onTranscriptReady={handleTranscriptReady} />
      
      {/* Intent Processing */}
      {isProcessingIntent && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
            <h3 className="text-purple-800 font-semibold text-lg mb-2">Processing Intent...</h3>
            <p className="text-purple-600">Understanding your request using Dialogflow CX</p>
          </CardContent>
        </Card>
      )}
      
      {/* Intent Results */}
      {intentResult && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="bg-purple-100">
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <Brain className="h-6 w-6" />
              <span>Intent Processing Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">AI Response:</h4>
              <p className="text-lg text-gray-700">"{intentResult.responseText}"</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Intent Detected:</h4>
                <p className="text-lg font-mono text-purple-600">{intentResult.intent}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Confidence:</h4>
                <p className="text-lg font-bold text-green-600">
                  {Math.round(intentResult.confidence * 100)}%
                </p>
              </div>
            </div>
            
            {Object.keys(intentResult.entities).length > 0 && (
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Entities Extracted:</h4>
                <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(intentResult.entities, null, 2)}
                </pre>
              </div>
            )}
            
            {intentResult.responseData && (
              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Response Data:</h4>
                <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(intentResult.responseData, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="text-center text-sm text-gray-500">
              Processing Time: {intentResult.processingTime}ms
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Intent Error Display */}
      {intentError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
            <h3 className="text-red-800 font-semibold text-lg mb-2">Intent Processing Error</h3>
            <p className="text-red-600">{intentError}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceRecorderPhase3;
