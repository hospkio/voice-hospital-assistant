
import React, { useState, useEffect } from 'react';
import { Volume2, Settings, MapPin, Calendar, Info, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EnhancedVoiceRecorder from '@/components/EnhancedVoiceRecorder';
import EnhancedResponseDisplay from '@/components/EnhancedResponseDisplay';
import LanguageSelector from '@/components/LanguageSelector';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';
import { useToast } from '@/hooks/use-toast';

interface KioskState {
  isListening: boolean;
  selectedLanguage: string;
  currentResponse: any;
  sessionId: string;
  conversationHistory: any[];
}

const EnhancedKiosk = () => {
  const { toast } = useToast();
  const { processWithDialogflow } = useGoogleCloudServices();
  
  const [state, setState] = useState<KioskState>({
    isListening: false,
    selectedLanguage: 'en-US',
    currentResponse: null,
    sessionId: `session_${Date.now()}`,
    conversationHistory: []
  });

  // Welcome message on load
  useEffect(() => {
    const welcomeMessage = {
      responseText: "Welcome to the Hospital Voice Assistant! I can help you with directions, appointments, and general information. Try asking 'Where is cardiology?' or click a quick action below.",
      intent: 'welcome',
      entities: {},
      confidence: 1.0,
      responseTime: 0,
      responseData: { type: 'welcome' },
      success: true
    };
    setState(prev => ({ ...prev, currentResponse: welcomeMessage }));
  }, []);

  const handleVoiceInput = async (transcript: string, confidence: number, detectedLanguage: string) => {
    console.log('Voice input received:', { transcript, confidence, detectedLanguage });
    
    // Add to conversation history
    const newHistory = [...state.conversationHistory, {
      type: 'user',
      content: transcript,
      timestamp: new Date(),
      language: detectedLanguage,
      confidence
    }];

    // Process with our rule-based NLP system
    const dialogflowResponse = await processWithDialogflow(transcript, state.sessionId, state.selectedLanguage);
    
    setState(prev => ({
      ...prev,
      currentResponse: dialogflowResponse,
      conversationHistory: [...newHistory, {
        type: 'assistant',
        content: dialogflowResponse.responseText,
        timestamp: new Date(),
        intent: dialogflowResponse.intent,
        confidence: dialogflowResponse.confidence
      }]
    }));

    toast({
      title: "Voice processed",
      description: `Understood: "${transcript}" (${Math.round(confidence * 100)}% confidence)`,
    });
  };

  const quickActions = [
    { 
      icon: MapPin, 
      label: 'Directions', 
      query: 'Where is cardiology?',
      color: 'bg-blue-500' 
    },
    { 
      icon: Calendar, 
      label: 'Appointments', 
      query: 'Book an appointment',
      color: 'bg-green-500' 
    },
    { 
      icon: Info, 
      label: 'Information', 
      query: 'What are visiting hours?',
      color: 'bg-purple-500' 
    },
    { 
      icon: HelpCircle, 
      label: 'Help', 
      query: 'How can you help me?',
      color: 'bg-orange-500' 
    }
  ];

  const handleQuickAction = async (query: string) => {
    await handleVoiceInput(query, 1.0, state.selectedLanguage);
  };

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
              <p className="text-gray-600">AI-powered voice support with Google Cloud</p>
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
                <Volume2 className="h-6 w-6 text-blue-600" />
                <span>Enhanced Voice Assistant</span>
                <div className="ml-auto">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 font-medium">Google AI Active</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EnhancedVoiceRecorder 
                isListening={state.isListening}
                onVoiceData={handleVoiceInput}
                language={state.selectedLanguage}
                onListeningChange={(listening) => 
                  setState(prev => ({ ...prev, isListening: listening }))
                }
              />
            </CardContent>
          </Card>

          <EnhancedResponseDisplay 
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
                  className="w-full justify-start h-12 text-lg hover:bg-blue-50"
                  onClick={() => handleQuickAction(action.query)}
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
              <p><span className="font-semibold">Session:</span> {state.sessionId.slice(-8)}</p>
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

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Google Speech-to-Text</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Google Text-to-Speech</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Multilingual Support</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Real-time Processing</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 p-4 text-center text-gray-600">
        <p className="text-lg mb-2">Powered by Google Cloud AI - Try saying:</p>
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

export default EnhancedKiosk;
