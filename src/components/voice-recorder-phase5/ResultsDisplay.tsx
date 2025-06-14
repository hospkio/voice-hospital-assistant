
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MessageSquare, 
  Globe, 
  Users, 
  CheckCircle, 
  AlertCircle,
  Brain,
  Database
} from 'lucide-react';

interface ResultsDisplayProps {
  greetingMessage: string;
  transcript: string;
  detectedLanguage: string;
  confidence: number;
  processingTime: number;
  faceCount: number;
  automationResponse?: any;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  greetingMessage,
  transcript,
  detectedLanguage,
  confidence,
  processingTime,
  faceCount,
  automationResponse
}) => {
  return (
    <div className="space-y-4">
      {/* Greeting Message */}
      {greetingMessage && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <MessageSquare className="h-5 w-5" />
              <span>Auto Greeting</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">{greetingMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* Automation Response */}
      {automationResponse && (
        <Card className={`border-2 ${
          automationResponse.success 
            ? 'border-blue-200 bg-blue-50' 
            : 'border-red-200 bg-red-50'
        }`}>
          <CardHeader className={`${
            automationResponse.success ? 'bg-blue-100' : 'bg-red-100'
          }`}>
            <CardTitle className={`flex items-center space-x-2 ${
              automationResponse.success ? 'text-blue-800' : 'text-red-800'
            }`}>
              <Brain className="h-5 w-5" />
              <span>Hospital Assistant Response</span>
              {automationResponse.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">Response:</h4>
              <p className="text-lg text-gray-700">"{automationResponse.responseText}"</p>
            </div>
            
            {automationResponse.success && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-1">Intent:</h5>
                  <Badge variant="outline">{automationResponse.intent}</Badge>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-1">Confidence:</h5>
                  <Badge variant={automationResponse.confidence > 0.7 ? "default" : "secondary"}>
                    {Math.round(automationResponse.confidence * 100)}%
                  </Badge>
                </div>
              </div>
            )}
            
            {automationResponse.entities && Object.keys(automationResponse.entities).length > 0 && (
              <div className="bg-white p-3 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-2">Entities Extracted:</h5>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(automationResponse.entities).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {automationResponse.responseData && (
              <div className="bg-white p-3 rounded-lg">
                <h5 className="font-medium text-gray-800 mb-2">
                  <Database className="inline h-4 w-4 mr-1" />
                  Database Results:
                </h5>
                <div className="text-sm text-gray-600">
                  {automationResponse.responseData.queryResult && 
                   automationResponse.responseData.queryResult.data && 
                   automationResponse.responseData.queryResult.data.length > 0 ? (
                    <p>Found {automationResponse.responseData.queryResult.data.length} relevant record(s)</p>
                  ) : (
                    <p>No specific database records returned</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Speech Recognition Results */}
      {transcript && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Mic className="h-5 w-5" />
              <span>Speech Recognition Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Transcript:</h4>
              <p className="text-lg text-gray-700">"{transcript}"</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg text-center">
                <Globe className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <div className="text-sm font-medium text-gray-600">Language</div>
                <div className="text-lg font-bold text-blue-600">
                  {detectedLanguage || 'Unknown'}
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg text-center">
                <CheckCircle className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <div className="text-sm font-medium text-gray-600">Confidence</div>
                <div className="text-lg font-bold text-green-600">
                  {Math.round(confidence * 100)}%
                </div>
              </div>
              
              <div className="bg-white p-3 rounded-lg text-center">
                <Users className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <div className="text-sm font-medium text-gray-600">Faces</div>
                <div className="text-lg font-bold text-purple-600">{faceCount}</div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              Processing Time: {processingTime}ms
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResultsDisplay;
