import React, { useState, useEffect } from 'react';
import { Volume2, Settings, MapPin, Calendar, Info, HelpCircle, Camera, MessageCircle, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedVoiceRecorder from '@/components/EnhancedVoiceRecorder';
import EnhancedResponseDisplay from '@/components/EnhancedResponseDisplay';
import LanguageSelector from '@/components/LanguageSelector';
import HospitalDataDisplay from '@/components/HospitalDataDisplay';
import EnhancedFaceDetectionCamera from '@/components/EnhancedFaceDetectionCamera';
import HospitalFloorMap from '@/components/HospitalFloorMap';
import AppointmentBookingModal from '@/components/AppointmentBookingModal';
import { useDialogflowCXService } from '@/hooks/useDialogflowCXService';
import { useGoogleCloudServices } from '@/hooks/useGoogleCloudServices';
import { useAutoLanguageDetection } from '@/hooks/useAutoLanguageDetection';
import { useToast } from '@/hooks/use-toast';
import { hospitalDataService } from '@/services/hospitalDataService';

interface KioskState {
  isListening: boolean;
  selectedLanguage: string;
  currentResponse: any;
  sessionId: string;
  conversationHistory: any[];
  selectedDepartment?: string;
  facesDetected: boolean;
  faceCount: number;
  autoInteractionEnabled: boolean;
  showAppointmentModal: boolean;
  lastGreetingTime: number;
  isAutoDetecting: boolean;
}

const EnhancedKiosk = () => {
  const { toast } = useToast();
  const { processWithDialogflowCX } = useDialogflowCXService();
  const { textToSpeech, playAudio } = useGoogleCloudServices();
  const { startListening: detectLanguage } = useAutoLanguageDetection();
  
  const [state, setState] = useState<KioskState>({
    isListening: false,
    selectedLanguage: 'en-US',
    currentResponse: null,
    sessionId: `session_${Date.now()}`,
    conversationHistory: [],
    selectedDepartment: undefined,
    facesDetected: false,
    faceCount: 0,
    autoInteractionEnabled: true,
    showAppointmentModal: false,
    lastGreetingTime: 0,
    isAutoDetecting: false
  });

  // Auto-greeting when faces are detected
  useEffect(() => {
    if (state.facesDetected && state.autoInteractionEnabled && !state.isAutoDetecting) {
      const now = Date.now();
      // Prevent greeting spam - only greet once every 15 seconds
      if (now - state.lastGreetingTime > 15000) {
        handleAutoGreeting();
        setState(prev => ({ ...prev, lastGreetingTime: now }));
      }
    }
  }, [state.facesDetected, state.autoInteractionEnabled]);

  // Welcome message on load
  useEffect(() => {
    const welcomeMessage = {
      responseText: "Welcome to MediCare Smart Kiosk! Your intelligent healthcare assistant with advanced AI and voice recognition. I can help you with directions, appointments, and hospital information in multiple languages.",
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
    setState(prev => ({ ...prev, isAutoDetecting: true }));
    
    const greetings = {
      'en-US': "Hello! Welcome to MediCare Hospital. I'm your AI assistant here to help you with directions, appointments, and information. How may I assist you today?",
      'ta-IN': "வணக்கம்! மெடிகேர் மருத்துவமனைக்கு வரவேற்கிறோம். திசைகள், அப்பாயிண்ட்மென்ட்கள் மற்றும் தகவல்களுக்கு நான் உங்கள் AI உதவியாளர். இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
      'ml-IN': "നമസ്കാരം! മെഡികെയർ ഹോസ്പിറ്റലിലേക്ക് സ്വാഗതം. ദിശകൾ, അപ്പോയിന്റ്മെന്റുകൾ, വിവരങ്ങൾ എന്നിവയിൽ സഹായിക്കാൻ ഞാൻ നിങ്ങളുടെ AI അസിസ്റ്റന്റാണ്. ഇന്ന് എനിക്ക് നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?",
      'hi-IN': "नमस्ते! मेडिकेयर अस्पताल में आपका स्वागत है। दिशा-निर्देश, अपॉइंटमेंट और जानकारी के लिए मैं आपका AI सहायक हूं। आज मैं आपकी कैसे सहायता कर सकता हूं?"
    };

    try {
      // Auto-detect language from user's first speech
      toast({
        title: "👋 Face detected!",
        description: "Please speak to start. I'll detect your language automatically.",
      });

      const greeting = greetings[state.selectedLanguage] || greetings['en-US'];
      
      const greetingResponse = {
        responseText: greeting,
        intent: 'auto-greeting',
        entities: {},
        confidence: 1.0,
        responseTime: 0,
        responseData: { type: 'auto-greeting', triggered: 'face-detection' },
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
          trigger: 'face-detection'
        }]
      }));

      // Auto-play greeting
      const ttsResult = await textToSpeech(greeting, state.selectedLanguage);
      if (ttsResult.success) {
        await playAudio(ttsResult.audioContent);
      }

      // Start automatic language detection
      setTimeout(async () => {
        try {
          const languageResult = await detectLanguage();
          if (languageResult) {
            setState(prev => ({ ...prev, selectedLanguage: languageResult.detectedLanguage }));
            await handleVoiceInput(languageResult.transcript, languageResult.confidence, languageResult.detectedLanguage);
          }
        } catch (error) {
          console.log('No speech detected during auto-detection phase');
        } finally {
          setState(prev => ({ ...prev, isAutoDetecting: false }));
        }
      }, 2000);

    } catch (error) {
      console.error('Auto-greeting error:', error);
      setState(prev => ({ ...prev, isAutoDetecting: false }));
    }
  };

  const handleVoiceInput = async (transcript: string, confidence: number, detectedLanguage: string) => {
    console.log('Voice input received:', { transcript, confidence, detectedLanguage });
    
    // Update language if detected differently
    if (detectedLanguage !== state.selectedLanguage) {
      setState(prev => ({ ...prev, selectedLanguage: detectedLanguage }));
    }
    
    // Update session in database
    await hospitalDataService.createOrUpdateKioskSession(state.sessionId, detectedLanguage);
    
    // Add to conversation history
    const newHistory = [...state.conversationHistory, {
      type: 'user',
      content: transcript,
      timestamp: new Date(),
      language: detectedLanguage,
      confidence
    }];

    // Process with Dialogflow CX
    const dialogflowResponse = await processWithDialogflowCX(transcript, state.sessionId, detectedLanguage);
    
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
      title: "🎤 Voice processed",
      description: `Language: ${detectedLanguage} (${Math.round(confidence * 100)}% confidence)`,
    });
  };

  const handleFaceDetection = (detected: boolean, count: number) => {
    setState(prev => ({ ...prev, facesDetected: detected, faceCount: count }));
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex flex-col touch-manipulation">
      {/* Enhanced Professional Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-100 p-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-2xl shadow-lg">
              <Stethoscope className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                MediCare Smart Kiosk
              </h1>
              <p className="text-gray-600 text-lg">AI Healthcare Assistant • Multi-Language • Face Detection • Voice AI</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {state.facesDetected && (
              <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full border border-green-300 shadow-sm">
                <Camera className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-semibold">
                  {state.faceCount} Person{state.faceCount !== 1 ? 's' : ''} Ready
                </span>
              </div>
            )}
            
            <div className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              <span className="text-blue-700 text-sm font-medium">
                Language: {state.selectedLanguage}
              </span>
            </div>
            
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
              className={`h-12 w-12 ${state.autoInteractionEnabled ? 'bg-green-50 border-green-200' : ''}`}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        <Tabs defaultValue="assistant" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-14 text-lg">
            <TabsTrigger value="assistant" className="h-12">🤖 AI Assistant</TabsTrigger>
            <TabsTrigger value="map" className="h-12">🗺️ Floor Map</TabsTrigger>
            <TabsTrigger value="departments" className="h-12">🏥 Departments</TabsTrigger>
            <TabsTrigger value="appointments" className="h-12">📅 Appointments</TabsTrigger>
          </TabsList>

          <TabsContent value="assistant" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Voice & Camera Panel */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Voice Recorder */}
                <Card className="border-2 border-blue-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                    <CardTitle className="flex items-center space-x-2">
                      <Volume2 className="h-6 w-6 text-blue-600" />
                      <span className="text-blue-800">Voice Assistant</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
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

                {/* Enhanced Face Detection Camera */}
                <EnhancedFaceDetectionCamera 
                  onFaceDetected={handleFaceDetection}
                  autoStart={state.autoInteractionEnabled}
                />
              </div>

              <EnhancedResponseDisplay 
                response={state.currentResponse}
                language={state.selectedLanguage}
              />
            </div>

            {/* Enhanced Control Panel */}
            <div className="space-y-6">
              <Card className="shadow-lg border-2 border-green-200">
                <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                  <CardTitle className="text-green-800">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-16 text-lg hover:shadow-md transition-all duration-200 border-2"
                      onClick={() => handleQuickAction(action.query)}
                    >
                      <action.icon className="h-6 w-6 mr-3" />
                      {action.label}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-2 border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                  <CardTitle className="text-purple-800">Session Status</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-3 p-6">
                  <div className="flex justify-between">
                    <span className="font-semibold">Language:</span>
                    <span className="font-mono">{state.selectedLanguage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Session:</span>
                    <span className="font-mono">{state.sessionId.slice(-8)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Interactions:</span>
                    <span className="font-bold">{state.conversationHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Auto-Assist:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      state.autoInteractionEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {state.autoInteractionEnabled ? 'ACTIVE' : 'OFF'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Face Detection:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      state.facesDetected ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {state.facesDetected ? `${state.faceCount} DETECTED` : 'NONE'}
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
            <Card className="shadow-lg border-2 border-green-200">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                  <span className="text-green-800">WhatsApp Appointment Booking</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6 p-8">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-green-800 mb-4">
                    📱 Book via WhatsApp
                  </h3>
                  <p className="text-green-700 mb-6 text-lg">
                    Get instant appointment confirmations sent directly to your WhatsApp!
                  </p>
                  <Button 
                    onClick={() => setState(prev => ({ ...prev, showAppointmentModal: true }))}
                    className="bg-green-600 hover:bg-green-700 h-14 px-8 text-lg"
                    size="lg"
                  >
                    <Calendar className="h-6 w-6 mr-3" />
                    Book Appointment Now
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-sm">
                    <h4 className="font-bold text-blue-600 mb-3 text-lg">1. Book Online</h4>
                    <p className="text-gray-700">Fill in your details and preferred time slot</p>
                  </div>
                  <div className="bg-white border-2 border-green-200 rounded-xl p-6 shadow-sm">
                    <h4 className="font-bold text-green-600 mb-3 text-lg">2. Get Token</h4>
                    <p className="text-gray-700">Receive token number via WhatsApp instantly</p>
                  </div>
                  <div className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-sm">
                    <h4 className="font-bold text-purple-600 mb-3 text-lg">3. Visit Hospital</h4>
                    <p className="text-gray-700">Show your token for quick check-in</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Enhanced Professional Footer */}
      <footer className="bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 text-white p-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-2xl mb-6 font-bold">
            🤖 Powered by Google AI • 📱 WhatsApp Integration • 🎥 Face Detection • 🗣️ Multi-Language Support
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <span className="bg-white/20 px-4 py-3 rounded-full">"Find cardiology department"</span>
            <span className="bg-white/20 px-4 py-3 rounded-full">"Book appointment with Dr. Kumar"</span>
            <span className="bg-white/20 px-4 py-3 rounded-full">"Emergency directions"</span>
            <span className="bg-white/20 px-4 py-3 rounded-full">"Visiting hours"</span>
          </div>
          <p className="mt-6 text-blue-100">
            © 2024 MediCare Smart Kiosk • Advanced Healthcare Technology
          </p>
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
