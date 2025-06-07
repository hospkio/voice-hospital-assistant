
import React, { useState, useEffect } from 'react';
import { Volume2, Settings, MapPin, Calendar, Info, HelpCircle, Database, Camera, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedVoiceRecorder from '@/components/EnhancedVoiceRecorder';
import EnhancedResponseDisplay from '@/components/EnhancedResponseDisplay';
import LanguageSelector from '@/components/LanguageSelector';
import HospitalDataDisplay from '@/components/HospitalDataDisplay';
import CameraFeed from '@/components/CameraFeed';
import HospitalFloorMap from '@/components/HospitalFloorMap';
import AppointmentBookingModal from '@/components/AppointmentBookingModal';
import { useDialogflowCXService } from '@/hooks/useDialogflowCXService';
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
  peopleDetected: boolean;
  autoInteractionEnabled: boolean;
  showAppointmentModal: boolean;
  lastGreetingTime: number;
}

const EnhancedKiosk = () => {
  const { toast } = useToast();
  const { processWithDialogflowCX } = useDialogflowCXService();
  const { textToSpeech, playAudio } = useGoogleCloudServices();
  
  const [state, setState] = useState<KioskState>({
    isListening: false,
    selectedLanguage: 'en-US',
    currentResponse: null,
    sessionId: `session_${Date.now()}`,
    conversationHistory: [],
    selectedDepartment: undefined,
    peopleDetected: false,
    autoInteractionEnabled: true,
    showAppointmentModal: false,
    lastGreetingTime: 0
  });

  // Auto-greeting when people are detected
  useEffect(() => {
    if (state.peopleDetected && state.autoInteractionEnabled) {
      const now = Date.now();
      // Prevent greeting spam - only greet once every 30 seconds
      if (now - state.lastGreetingTime > 30000) {
        handleAutoGreeting();
        setState(prev => ({ ...prev, lastGreetingTime: now }));
      }
    }
  }, [state.peopleDetected, state.autoInteractionEnabled]);

  // Welcome message on load
  useEffect(() => {
    const welcomeMessage = {
      responseText: "Welcome to City Hospital! I'm your AI assistant with advanced voice recognition and camera detection. Walk in front of the camera or say 'Hello' to start.",
      intent: 'welcome',
      entities: {},
      confidence: 1.0,
      responseTime: 0,
      responseData: { type: 'welcome' },
      success: true
    };
    setState(prev => ({ ...prev, currentResponse: welcomeMessage }));
  }, []);

  const handleAutoGreeting = async () => {
    const greetings = {
      'en-US': "Hello! Welcome to City Hospital. I'm here to help you with directions, appointments, and information. How may I assist you today?",
      'ta-IN': "வணக்கம்! சிட்டி மருத்துவமனைக்கு வரவேற்கிறோம். திசைகள், அப்பாயிண்ட்மென்ட்கள் மற்றும் தகவல்களுக்கு நான் இங்கே உள்ளேன். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      'ml-IN': "നമസ്കാരം! സിറ്റി ഹോസ്പിറ്റലിലേക്ക് സ്വാഗതം. ദിശകൾ, അപ്പോയിന്റ്മെന്റുകൾ, വിവരങ്ങൾ എന്നിവയിൽ സഹായിക്കാൻ ഞാൻ ഇവിടെയുണ്ട്. ഇന്ന് എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?"
    };

    const greeting = greetings[state.selectedLanguage] || greetings['en-US'];
    
    const greetingResponse = {
      responseText: greeting,
      intent: 'auto-greeting',
      entities: {},
      confidence: 1.0,
      responseTime: 0,
      responseData: { type: 'auto-greeting', triggered: 'camera' },
      success: true
    };

    setState(prev => ({ 
      ...prev, 
      currentResponse: greetingResponse,
      conversationHistory: [...prev.conversationHistory, {
        type: 'assistant',
        content: greeting,
        timestamp: new Date(),
        intent: 'auto-greeting',
        confidence: 1.0,
        trigger: 'camera'
      }]
    }));

    // Auto-play greeting
    try {
      const ttsResult = await textToSpeech(greeting, state.selectedLanguage);
      if (ttsResult.success) {
        await playAudio(ttsResult.audioContent);
      }
    } catch (error) {
      console.error('Auto-greeting TTS error:', error);
    }

    toast({
      title: "Person detected! 👋",
      description: "AI assistant is ready to help you.",
    });
  };

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

    // Process with Dialogflow CX
    const dialogflowResponse = await processWithDialogflowCX(transcript, state.sessionId, state.selectedLanguage);
    
    // Handle appointment booking intent
    if (dialogflowResponse.intent?.toLowerCase().includes('appointment')) {
      setState(prev => ({ ...prev, showAppointmentModal: true }));
    }
    
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
      title: "Voice processed ✅",
      description: `Understood: "${transcript}" (${Math.round(confidence * 100)}% confidence)`,
    });
  };

  const handlePeopleDetection = (detected: boolean) => {
    setState(prev => ({ ...prev, peopleDetected: detected }));
  };

  const quickActions = [
    { 
      icon: MapPin, 
      label: 'Find Department', 
      query: 'Where is the cardiology department?',
      color: 'bg-blue-500' 
    },
    { 
      icon: Calendar, 
      label: 'Book Appointment', 
      query: 'I want to book an appointment',
      color: 'bg-green-500' 
    },
    { 
      icon: Info, 
      label: 'Hospital Info', 
      query: 'What are the visiting hours?',
      color: 'bg-purple-500' 
    },
    { 
      icon: HelpCircle, 
      label: 'Emergency Help', 
      query: 'Where is the emergency department?',
      color: 'bg-red-500' 
    }
  ];

  const handleQuickAction = async (query: string) => {
    await handleVoiceInput(query, 1.0, state.selectedLanguage);
  };

  const handleDepartmentSelect = (department: string) => {
    setState(prev => ({ ...prev, selectedDepartment: department }));
    handleQuickAction(`Tell me about ${department} department and show me directions`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col">
      {/* Modern Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-blue-100 p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-2xl shadow-lg">
              <Volume2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                City Hospital AI
              </h1>
              <p className="text-gray-600 text-lg">Smart Assistant with Camera Detection & WhatsApp Integration</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {state.peopleDetected && (
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full">
                <Camera className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">Person Detected</span>
              </div>
            )}
            
            <LanguageSelector 
              selected={state.selectedLanguage}
              onChange={(lang) => setState(prev => ({ ...prev, selectedLanguage: lang }))}
            />
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setState(prev => ({ 
                ...prev, 
                autoInteractionEnabled: !prev.autoInteractionEnabled 
              }))}
              className={state.autoInteractionEnabled ? 'bg-green-50 border-green-200' : ''}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        <Tabs defaultValue="assistant" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
            <TabsTrigger value="map">Floor Map</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="assistant" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Voice & Camera Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Voice Recorder */}
                <Card className="border-2 border-blue-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Volume2 className="h-6 w-6 text-blue-600" />
                      <span>Voice Assistant</span>
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

                {/* Camera Feed */}
                <CameraFeed 
                  onPeopleDetected={handlePeopleDetection}
                  autoStart={state.autoInteractionEnabled}
                />
              </div>

              <EnhancedResponseDisplay 
                response={state.currentResponse}
                language={state.selectedLanguage}
              />
            </div>

            {/* Control Panel */}
            <div className="space-y-6">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-14 text-lg hover:shadow-md transition-all duration-200"
                      onClick={() => handleQuickAction(action.query)}
                    >
                      <action.icon className="h-6 w-6 mr-3" />
                      {action.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Session Status</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex justify-between">
                    <span className="font-semibold">Language:</span>
                    <span>{state.selectedLanguage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Session:</span>
                    <span className="font-mono">{state.sessionId.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Interactions:</span>
                    <span>{state.conversationHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Auto-Assist:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      state.autoInteractionEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {state.autoInteractionEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="map">
            <HospitalFloorMap 
              targetDepartment={state.selectedDepartment}
              onDepartmentSelect={(dept) => handleDepartmentSelect(dept.name)}
            />
          </TabsContent>

          <TabsContent value="departments">
            <HospitalDataDisplay 
              selectedDepartment={state.selectedDepartment}
              onDepartmentSelect={handleDepartmentSelect}
            />
          </TabsContent>

          <TabsContent value="appointments">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                  <span>WhatsApp Appointment Booking</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-green-800 mb-3">
                    📱 Book via WhatsApp
                  </h3>
                  <p className="text-green-700 mb-4">
                    Get instant appointment confirmations sent directly to your WhatsApp!
                  </p>
                  <Button 
                    onClick={() => setState(prev => ({ ...prev, showAppointmentModal: true }))}
                    className="bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Appointment Now
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-semibold text-blue-600 mb-2">1. Book Online</h4>
                    <p>Fill in your details and preferred time slot</p>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-semibold text-green-600 mb-2">2. Get Token</h4>
                    <p>Receive token number via WhatsApp instantly</p>
                  </div>
                  <div className="bg-white border rounded-lg p-4">
                    <h4 className="font-semibold text-purple-600 mb-2">3. Visit Hospital</h4>
                    <p>Show your token for quick check-in</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Modern Footer */}
      <footer className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-6">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xl mb-4 font-semibold">
            🤖 Powered by Google AI • 📱 WhatsApp Integration • 🎥 Camera Detection
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <span className="bg-white/20 px-4 py-2 rounded-full">"Find cardiology department"</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">"Book appointment with Dr. Kumar"</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">"Emergency directions"</span>
            <span className="bg-white/20 px-4 py-2 rounded-full">"Visiting hours"</span>
          </div>
        </div>
      </footer>

      {/* Appointment Booking Modal */}
      <AppointmentBookingModal
        isOpen={state.showAppointmentModal}
        onClose={() => setState(prev => ({ ...prev, showAppointmentModal: false }))}
        department={state.selectedDepartment}
      />
    </div>
  );
};

export default EnhancedKiosk;
