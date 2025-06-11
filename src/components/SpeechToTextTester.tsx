
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface SpeechToTextTesterProps {
  audioBlob: Blob | null;
  onReset: () => void;
}

const SpeechToTextTester: React.FC<SpeechToTextTesterProps> = ({ audioBlob, onReset }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  const testSpeechToText = async () => {
    if (!audioBlob) {
      setError('No audio data available');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult('');

    try {
      console.log('🎵 Testing Speech-to-Text with audio blob size:', audioBlob.size);

      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('languageCode', 'auto');

      console.log('📡 Sending request to /functions/v1/speech-to-text...');

      const response = await fetch('/functions/v1/speech-to-text', {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

      const responseText = await response.text();
      console.log('📥 Raw response:', responseText);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
      }

      console.log('✅ Speech-to-Text result:', data);

      if (data.success) {
        setResult(`Transcript: "${data.transcript}"\nConfidence: ${data.confidence}\nLanguage: ${data.detectedLanguage}`);
      } else {
        setError(data.error || 'Speech-to-text failed');
      }

    } catch (error) {
      console.error('❌ Speech-to-Text error:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!audioBlob) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Record some audio first to test Speech-to-Text</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-green-200">
      <CardHeader>
        <CardTitle className="text-center">Speech-to-Text Tester - Step 2</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-green-600 mb-4">Audio recorded: {(audioBlob.size / 1024).toFixed(1)} KB</p>
          
          <div className="space-x-2">
            <Button 
              onClick={testSpeechToText} 
              disabled={isProcessing}
              className="bg-green-500 hover:bg-green-600"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Test Speech-to-Text'
              )}
            </Button>
            
            <Button onClick={onReset} variant="outline">
              Record Again
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-red-800 font-semibold">Error:</h4>
            <p className="text-red-600 text-sm whitespace-pre-wrap">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-green-800 font-semibold">Success:</h4>
            <p className="text-green-700 text-sm whitespace-pre-wrap">{result}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpeechToTextTester;
