
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MapPin, Calendar, Globe, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Mic,
      title: 'Voice Interaction',
      description: 'Natural speech recognition in multiple languages'
    },
    {
      icon: MapPin,
      title: 'Navigation',
      description: 'Get directions to any department or facility'
    },
    {
      icon: Calendar,
      title: 'Appointments',
      description: 'Book and manage medical appointments'
    },
    {
      icon: Globe,
      title: 'Multilingual',
      description: 'Support for English, Hindi, Malayalam, and Tamil'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 text-white p-4 rounded-full">
              <Mic className="h-12 w-12" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Hospital Voice Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Intelligent voice-enabled kiosk system providing multilingual patient assistance 
            through natural conversation interface for seamless hospital navigation and support.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
              onClick={() => navigate('/kiosk')}
            >
              <Zap className="mr-2 h-5 w-5" />
              Launch Kiosk
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-lg px-8 py-3"
            >
              View Documentation
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <CardHeader className="text-center">
                <div className="mx-auto bg-blue-100 text-blue-600 p-3 rounded-full w-fit mb-3">
                  <feature.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center text-sm">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Value Proposition */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Core Value Proposition</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Reduce Wait Times</h3>
                <p className="text-blue-100">
                  Instant voice assistance eliminates confusion and speeds up patient flow
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-blue-100">
                  Always-available multilingual assistance for all patients
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Enhanced Experience</h3>
                <p className="text-blue-100">
                  Intuitive voice interaction makes hospital navigation effortless
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">
            Experience the power of voice-enabled hospital assistance
          </p>
          <Button 
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-lg px-12 py-3"
            onClick={() => navigate('/kiosk')}
          >
            Try Kiosk Demo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
