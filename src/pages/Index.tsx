import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Monitor, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Hospital Kiosk Options</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/enhanced-kiosk')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 group-hover:text-blue-600 transition-colors">
                <Stethoscope className="h-6 w-6" />
                <span>Enhanced Smart Kiosk</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced AI-powered hospital kiosk with voice recognition, face detection, and multilingual support
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/kiosk')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 group-hover:text-blue-600 transition-colors">
                <Monitor className="h-6 w-6" />
                <span>Basic Kiosk Interface</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Simple hospital information kiosk for basic navigation and department information
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate('/voice-test')}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 group-hover:text-orange-600 transition-colors">
                <Mic className="h-6 w-6" />
                <span>Voice System Test</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Test voice recording and speech-to-text functionality step by step
              </p>
            </CardContent>
          </Card>
        </div>
    </div>
  );
};

export default Index;
