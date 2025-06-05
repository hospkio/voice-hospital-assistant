
import React, { useEffect, useState } from 'react';
import { MapPin, Calendar, Info, AlertCircle, Volume2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';

interface EnhancedResponseDisplayProps {
  response: any;
  language: string;
}

const EnhancedResponseDisplay: React.FC<EnhancedResponseDisplayProps> = ({ response, language }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { textToSpeech, playAudio } = useGoogleCloudServices();

  useEffect(() => {
    if (response?.responseText) {
      // Auto-play text-to-speech
      handleSpeakText(response.responseText);
    }
  }, [response]);

  const handleSpeakText = async (text: string) => {
    setIsPlaying(true);
    try {
      const ttsResult = await textToSpeech(text, language);
      if (ttsResult.success) {
        await playAudio(ttsResult.audioContent);
      }
    } catch (error) {
      console.error('Speech playback error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const getResponseIcon = () => {
    if (!response) return Info;
    
    switch (response.intent) {
      case 'navigation.department':
        return MapPin;
      case 'appointment.book':
      case 'appointment.check':
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
      case 'navigation.department':
        return 'blue';
      case 'appointment.book':
      case 'appointment.check':
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
              {response.intent?.replace('.', ' ') || 'Response'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {response.confidence && (
              <Badge variant="secondary">
                {Math.round(response.confidence * 100)}% confident
              </Badge>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSpeakText(response.responseText)}
              disabled={isPlaying}
            >
              {isPlaying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main Response Text */}
        <div className={`text-lg text-${color}-800 leading-relaxed`}>
          {response.responseText}
        </div>

        {/* Department Details */}
        {response.responseData?.type === 'navigation' && response.responseData.department && (
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-semibold text-gray-800 mb-2">Department Details:</h4>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Department:</span> {response.responseData.department}</p>
              <p><span className="font-medium">Floor:</span> {response.responseData.floor}</p>
              <p><span className="font-medium">Room:</span> {response.responseData.room}</p>
              {response.responseData.description && (
                <p><span className="font-medium">Description:</span> {response.responseData.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Visual Map Placeholder */}
        {response.responseData?.type === 'navigation' && (
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

        {/* Response Performance */}
        {response.responseTime && (
          <div className="text-xs text-gray-500 border-t pt-2">
            Response time: {response.responseTime}ms
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedResponseDisplay;
