
import React, { useState } from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceRecorderPhase1 from './VoiceRecorderPhase1';
import { useSpeechToTextService } from '@/hooks/useSpeechToTextService';

interface TranscriptionResult {
  transcript: string;
  confidence: number;
  detectedLanguage: string;
  processingTime: number;
}

interface VoiceRecorderPhase2Props {
  onTranscriptReady?: (transcript: string, detectedLanguage: string) => void;
}

const VoiceRecorderPhase2: React.FC<VoiceRecorderPhase2Props> = ({ onTranscriptReady }) => {
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  
  const { speechToText } = useSpeechToTextService();

  const handleAudioReady = async (audioBlob: Blob) => {
    console.log('🎵 Phase 2: Processing audio for speech-to-text...');
    setIsProcessing(true);
    setError('');
    setTranscriptionResult(null);
    
    const startTime = Date.now();
    
    try {
      const result = await speechToText(audioBlob, 'auto');
      const processingTime = Date.now() - startTime;
      
      console.log('✅ Speech-to-text successful:', result);
      
      const transcription = {
        transcript: result.transcript,
        confidence: result.confidence,
        detectedLanguage: result.detectedLanguage,
        processingTime
      };
      
      setTranscriptionResult(transcription);
      
      // Notify parent component for Phase 3
      if (onTranscriptReady) {
        onTranscriptReady(result.transcript, result.detectedLanguage);
      }
      
    } catch (error) {
      console.error('❌ Speech-to-text failed:', error);
      setError(error.message || 'Failed to process speech');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice Recorder with Auto-Stop */}
      <VoiceRecorderPhase1 
        onTranscriptReady={handleAudioReady}
        autoStopEnabled={true}
        silenceThreshold={30}
        silenceDuration={3000}
      />
      
      {/* Speech-to-Text Processing */}
      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-blue-800 font-semibold text-lg mb-2">Processing Speech...</h3>
            <p className="text-blue-600">Converting your voice to text using Google Cloud Speech API</p>
          </CardContent>
        </Card>
      )}
      
      {/* Transcription Results */}
      {transcriptionResult && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="bg-green-100">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-6 w-6" />
              <span>Speech-to-Text Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">Transcript:</h4>
              <p className="text-lg italic text-gray-700">"{transcriptionResult.transcript}"</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg">
                <span className="font-medium text-gray-600">Confidence:</span>
                <p className="text-lg font-bold text-green-600">
                  {Math.round(transcriptionResult.confidence * 100)}%
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="font-medium text-gray-600">Language:</span>
                <p className="text-lg font-bold text-blue-600">{transcriptionResult.detectedLanguage}</p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <span className="font-medium text-gray-600">Processing:</span>
                <p className="text-lg font-bold text-purple-600">{transcriptionResult.processingTime}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
            <h3 className="text-red-800 font-semibold text-lg mb-2">Speech Processing Error</h3>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VoiceRecorderPhase2;
