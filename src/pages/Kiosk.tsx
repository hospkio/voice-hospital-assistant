
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Settings, MapPin, Calendar, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VoiceRecorder from '@/components/VoiceRecorder';
import ResponseDisplay from '@/components/ResponseDisplay';
import LanguageSelector from '@/components/LanguageSelector';
import { useToast } from '@/hooks/use-toast';

interface KioskState {
  isListening: boolean;
  selectedLanguage: string;
  currentResponse: any;
  sessionId: string;
  conversationHistory: any[];
}

const Kiosk = () => {
  const { toast } = useToast();
  const [state, setState] = useState<KioskState>({
    isListening: false,
    selectedLanguage: 'en-US',
    currentResponse: null,
    sessionId: Date.now().toString(),
    conversationHistory: []
  });

  const handleVoiceInput = async (transcript: string) => {
    console.log('Voice input received:', transcript);
    
    // Add to conversation history
    const newHistory = [...state.conversationHistory, {
      type: 'user',
      content: transcript,
      timestamp: new Date(),
      language: state.selectedLanguage
    }];

    // Mock response for MVP - in production this would call your AI service
    const mockResponse = await generateMockResponse(transcript);
    
    setState(prev => ({
      ...prev,
      currentResponse: mockResponse,
      conversationHistory: [...newHistory, {
        type: 'assistant',
        content: mockResponse.text,
        timestamp: new Date(),
        intent: mockResponse.intent
      }]
    }));

    toast({
      title: "Voice processed",
      description: `Understood: "${transcript}"`,
    });
  };

  const generateMockResponse = async (input: string): Promise<any> => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('cardiology') || lowerInput.includes('heart')) {
      return {
        text: "Cardiology department is on the 3rd floor, Room 301. Take the elevator to your left and turn right after exiting.",
        intent: 'navigation',
        type: 'direction',
        department: 'Cardiology',
        floor: 3,
        room: '301'
      };
    } else if (lowerInput.includes('appointment') || lowerInput.includes('book')) {
      return {
        text: "I can help you book an appointment. Which department would you like to visit?",
        intent: 'appointment',
        type: 'booking',
        nextStep: 'department_selection'
      };
    } else if (lowerInput.includes('emergency') || lowerInput.includes('er')) {
      return {
        text: "Emergency Room is on the ground floor. Follow the red line on the floor. If this is a medical emergency, please seek immediate assistance.",
        intent: 'navigation',
        type: 'emergency',
        urgent: true
      };
    } else if (lowerInput.includes('pharmacy')) {
      return {
        text: "Pharmacy is on the 1st floor, near the main entrance. It's open from 8 AM to 8 PM.",
        intent: 'navigation',
        type: 'information',
        hours: '8 AM - 8 PM'
      };
    } else {
      return {
        text: "I can help you with directions, appointments, or general information. Try asking 'Where is cardiology?' or 'Book an appointment'.",
        intent: 'help',
        type: 'suggestion'
      };
    }
  };

  const quickActions = [
    { icon: MapPin, label: 'Directions', color: 'bg-blue-500' },
    { icon: Calendar, label: 'Appointments', color: 'bg-green-500' },
    { icon: Info, label: 'Information', color: 'bg-purple-500' },
    { icon: HelpCircle, label: 'Help', color: 'bg-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-blue-100 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <Volume2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Hospital Assistant</h1>
              <p className="text-gray-600">Voice-enabled patient support</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageSelector 
              selected={state.selectedLanguage}
              onChange={(lang) => setState(prev => ({ ...prev, selectedLanguage: lang }))}
            />
            <Button variant="outline" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Voice Interaction Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mic className="h-6 w-6 text-blue-600" />
                <span>Voice Assistant</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VoiceRecorder 
                isListening={state.isListening}
                onVoiceData={handleVoiceInput}
                language={state.selectedLanguage}
                onListeningChange={(listening) => 
                  setState(prev => ({ ...prev, isListening: listening }))
                }
              />
            </CardContent>
          </Card>

          <ResponseDisplay 
            response={state.currentResponse}
            language={state.selectedLanguage}
          />
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-12 text-lg"
                  onClick={() => {
                    const queries = {
                      'Directions': 'Where is cardiology?',
                      'Appointments': 'Book an appointment',
                      'Information': 'What are visiting hours?',
                      'Help': 'How can you help me?'
                    };
                    handleVoiceInput(queries[action.label as keyof typeof queries]);
                  }}
                >
                  <action.icon className="h-5 w-5 mr-3" />
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Info</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p><span className="font-semibold">Language:</span> {state.selectedLanguage}</p>
              <p><span className="font-semibold">Session:</span> {state.sessionId.slice(-6)}</p>
              <p><span className="font-semibold">Interactions:</span> {state.conversationHistory.length}</p>
              <p><span className="font-semibold">Status:</span> 
                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                  state.isListening ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {state.isListening ? 'Listening' : 'Ready'}
                </span>
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 p-4 text-center text-gray-600">
        <p className="text-lg mb-2">Try saying:</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <span className="bg-white px-3 py-1 rounded-full">"Where is cardiology?"</span>
          <span className="bg-white px-3 py-1 rounded-full">"Book appointment"</span>
          <span className="bg-white px-3 py-1 rounded-full">"Emergency room directions"</span>
          <span className="bg-white px-3 py-1 rounded-full">"Visiting hours"</span>
        </div>
      </footer>
    </div>
  );
};

export default Kiosk;
