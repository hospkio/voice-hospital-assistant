
import React, { useState, useEffect } from 'react';
import { Volume2, Settings, MapPin, Calendar, Info, HelpCircle, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedVoiceRecorder from '@/components/EnhancedVoiceRecorder';
import EnhancedResponseDisplay from '@/components/EnhancedResponseDisplay';
import LanguageSelector from '@/components/LanguageSelector';
import HospitalDataDisplay from '@/components/HospitalDataDisplay';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';
import { useToast } from '@/hooks/use-toast';
import { hospitalDataService } from '@/services/hospitalDataService';

interface KioskState {
  isListening: boolean;
  selectedLanguage: string;
  currentResponse: any;
  sessionId: string;
  conversationHistory: any[];
  selectedDepartment?: string;
}

const EnhancedKiosk = () => {
  const { toast } = useToast();
  const { processWithDialogflow } = useGoogleCloudServices();
  
  const [state, setState] = useState<KioskState>({
    isListening: false,
    selectedLanguage: 'en-US',
    currentResponse: null,
    sessionId: `session_${Date.now()}`,
    conversationHistory: [],
    selectedDepartment: undefined
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
    
    // Update session in database
    await hospitalDataService.createOrUpdateKioskSession(state.sessionId, state.selectedLanguage);
    
    // Add to conversation history
    const newHistory = [...state.conversationHistory, {
      type: 'user',
      content: transcript,
      timestamp: new Date(),
      language: detectedLanguage,
      confidence
    }];

    // Process with our enhanced rule-based NLP system
    const dialogflowResponse = await processWithDialogflow(transcript, state.sessionId, state.selectedLanguage);
    
    // Extract department if mentioned for UI context
    let selectedDepartment = state.selectedDepartment;
    if (dialogflowResponse.responseData?.department) {
      selectedDepartment = dialogflowResponse.responseData.department;
    }
    
    setState(prev => ({
      ...prev,
      currentResponse: dialogflowResponse,
      selectedDepartment,
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

  const handleDepartmentSelect = (department: string) => {
    setState(prev => ({ ...prev, selectedDepartment: department }));
    handleQuickAction(`Tell me about ${department} department`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-blue-100 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <Volume2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Hospital Assistant</h1>
              <p className="text-gray-600">AI-powered voice support with real hospital data</p>
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
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        <Tabs defaultValue="voice" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="voice">Voice Assistant</TabsTrigger>
            <TabsTrigger value="browse">Browse Departments</TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        <span className="text-sm text-green-600 font-medium">Real Data Active</span>
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
                  {state.selectedDepartment && (
                    <p><span className="font-semibold">Focus:</span> {state.selectedDepartment}</p>
                  )}
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
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>Real Hospital Data</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>20+ Departments</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Live Doctor Data</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Multilingual Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Enhanced Dialogflow</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="browse">
            <HospitalDataDisplay 
              selectedDepartment={state.selectedDepartment}
              onDepartmentSelect={handleDepartmentSelect}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 p-4 text-center text-gray-600">
        <p className="text-lg mb-2">Powered by Real Hospital Data & Enhanced Dialogflow - Try saying:</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <span className="bg-white px-3 py-1 rounded-full">"Where is cardiology?"</span>
          <span className="bg-white px-3 py-1 rounded-full">"Book appointment with Dr. Kumar"</span>
          <span className="bg-white px-3 py-1 rounded-full">"Emergency room directions"</span>
          <span className="bg-white px-3 py-1 rounded-full">"Visiting hours"</span>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedKiosk;
