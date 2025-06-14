
import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Info, AlertCircle, CheckCircle, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ResponseDisplayProps {
  response: any;
  language: string;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response, language }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (response?.text) {
      // Auto-play text-to-speech
      speakText(response.text);
    }
  }, [response]);

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const getResponseIcon = () => {
    if (!response) return Info;
    
    switch (response.intent) {
      case 'navigation':
        return MapPin;
      case 'appointment':
        return Calendar;
      case 'emergency':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getResponseColor = () => {
    if (!response) return 'blue';
    
    switch (response.intent) {
      case 'navigation':
        return 'blue';
      case 'appointment':
        return 'green';
      case 'emergency':
        return 'red';
      default:
        return 'gray';
    }
  };

  if (!response) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="p-8 text-center">
          <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            Ready to help!
          </h3>
          <p className="text-gray-500">
            Ask me about directions, appointments, or hospital information
          </p>
        </CardContent>
      </Card>
    );
  }

  const ResponseIcon = getResponseIcon();
  const color = getResponseColor();

  return (
    <Card className={`border-2 border-${color}-200 bg-${color}-50`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ResponseIcon className={`h-6 w-6 text-${color}-600`} />
            <span className={`text-${color}-800 capitalize`}>
              {response.intent || 'Response'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={response.urgent ? 'destructive' : 'secondary'}>
              {response.type || 'info'}
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => speakText(response.text)}
              disabled={isPlaying}
            >
              <Volume2 className={`h-4 w-4 ${isPlaying ? 'animate-pulse' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Response Text */}
        <div className={`text-lg text-${color}-800 leading-relaxed`}>
          {response.text}
        </div>

        {/* Additional Details */}
        {response.department && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Department Details:</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Department:</span> {response.department}</p>
              {response.floor && (
                <p><span className="font-medium">Floor:</span> {response.floor}</p>
              )}
              {response.room && (
                <p><span className="font-medium">Room:</span> {response.room}</p>
              )}
              {response.hours && (
                <p><span className="font-medium">Hours:</span> {response.hours}</p>
              )}
            </div>
          </div>
        )}

        {/* Visual Map Placeholder */}
        {response.intent === 'navigation' && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-3">Map & Directions:</h4>
            <div className="bg-gray-100 h-32 rounded flex items-center justify-center">
              <div className="text-center text-gray-600">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm">Interactive map would appear here</p>
                <p className="text-xs mt-1">Follow the blue line to your destination</p>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        {response.nextStep && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Next Step:</h4>
            <p className="text-gray-700">{response.nextStep}</p>
          </div>
        )}

        {/* Emergency Warning */}
        {response.urgent && (
          <div className="bg-red-100 border-2 border-red-300 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-semibold">Important Notice</span>
            </div>
            <p className="text-red-700 mt-1">
              If this is a medical emergency, please seek immediate assistance or call emergency services.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResponseDisplay;
