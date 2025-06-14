
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Hospital Kiosk System</h1>

      <div className="flex justify-center">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer group w-full max-w-md" onClick={() => navigate('/enhanced-kiosk')}>
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
      </div>
    </div>
  );
};

export default Index;
