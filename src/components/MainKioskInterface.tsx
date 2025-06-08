
import React from 'react';
import { Volume2, Camera, MessageCircle, Calendar, Sparkles, Map, Building2, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EnhancedVoiceRecorder from '@/components/EnhancedVoiceRecorder';
import EnhancedResponseDisplay from '@/components/EnhancedResponseDisplay';
import EnhancedFaceDetectionCamera from '@/components/EnhancedFaceDetectionCamera';
import HospitalFloorMap from '@/components/HospitalFloorMap';
import HospitalDataDisplay from '@/components/HospitalDataDisplay';
import QuickActionsPanel from '@/components/QuickActionsPanel';
import SessionStatusPanel from '@/components/SessionStatusPanel';

interface MainKioskInterfaceProps {
  state: any;
  isListening: boolean;
  onVoiceData: (transcript: string, confidence: number, detectedLanguage: string) => void;
  onListeningChange: (listening: boolean) => void;
  onFaceDetected: (detected: boolean, count: number) => void;
  onQuickAction: (query: string) => void;
  onDepartmentSelect: (department: string) => void;
  onShowAppointmentModal: () => void;
  onAutoGreetingTriggered: () => void;
}

const MainKioskInterface: React.FC<MainKioskInterfaceProps> = ({
  state,
  isListening,
  onVoiceData,
  onListeningChange,
  onFaceDetected,
  onQuickAction,
  onDepartmentSelect,
  onShowAppointmentModal,
  onAutoGreetingTriggered
}) => {
  return (
    <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6">
      {/* Hero Welcome Banner */}
      {!state.facesDetected && !state.currentResponse && (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 p-1 rounded-3xl shadow-2xl">
          <div className="bg-white rounded-2xl p-8 md:p-12 text-center relative">
            <div className="absolute top-4 right-4 text-6xl opacity-20">🏥</div>
            <div className="flex items-center justify-center space-x-4 mb-6">
              <Sparkles className="h-12 w-12 text-purple-500 animate-pulse" />
              <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
                Welcome to MediCare Smart Kiosk
              </h2>
              <Sparkles className="h-12 w-12 text-purple-500 animate-pulse" />
            </div>
            
            <p className="text-xl md:text-2xl text-gray-700 mb-8 font-medium">
              🤖 Your Intelligent Healthcare Assistant with AI-Powered Voice Recognition
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-blue-800 mb-2">Smart Detection</h3>
                <p className="text-blue-600">Automatically detects when you approach and starts conversation</p>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">🗣️</div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Multi-Language</h3>
                <p className="text-green-600">Speaks your language automatically - English, Hindi, Tamil & more</p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">🏥</div>
                <h3 className="text-xl font-bold text-purple-800 mb-2">Complete Help</h3>
                <p className="text-purple-600">Directions, appointments, department info & emergency assistance</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Tab Interface */}
      <Tabs defaultValue="assistant" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-20 bg-gradient-to-r from-blue-100 via-purple-100 to-green-100 rounded-2xl p-2 shadow-lg">
          <TabsTrigger 
            value="assistant" 
            className="h-16 rounded-xl font-bold text-lg bg-white/50 hover:bg-white data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
          >
            <div className="flex flex-col items-center space-y-1">
              <Volume2 className="h-6 w-6" />
              <span>AI Assistant</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="map" 
            className="h-16 rounded-xl font-bold text-lg bg-white/50 hover:bg-white data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
          >
            <div className="flex flex-col items-center space-y-1">
              <Map className="h-6 w-6" />
              <span>Floor Map</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="departments" 
            className="h-16 rounded-xl font-bold text-lg bg-white/50 hover:bg-white data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
          >
            <div className="flex flex-col items-center space-y-1">
              <Building2 className="h-6 w-6" />
              <span>Departments</span>
            </div>
          </TabsTrigger>
          
          <TabsTrigger 
            value="appointments" 
            className="h-16 rounded-xl font-bold text-lg bg-white/50 hover:bg-white data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
          >
            <div className="flex flex-col items-center space-y-1">
              <Calendar className="h-6 w-6" />
              <span>Appointments</span>
            </div>
          </TabsTrigger>
        </TabsList>

        {/* AI Assistant Tab */}
        <TabsContent value="assistant" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voice Assistant Card */}
              <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 text-white">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Volume2 className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Voice Assistant</h3>
                      <p className="text-blue-100 text-sm">AI-Powered Speech Recognition</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <EnhancedVoiceRecorder 
                    isListening={isListening}
                    onVoiceData={onVoiceData}
                    language={state.selectedLanguage}
                    onListeningChange={onListeningChange}
                  />
                </CardContent>
              </Card>

              {/* Face Detection Card */}
              <EnhancedFaceDetectionCamera 
                onFaceDetected={onFaceDetected}
                autoStart={state.autoInteractionEnabled}
                onAutoGreetingTriggered={onAutoGreetingTriggered}
              />
            </div>

            {/* Response Display */}
            <EnhancedResponseDisplay 
              response={state.currentResponse}
              language={state.selectedLanguage}
            />
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <QuickActionsPanel onQuickAction={onQuickAction} />
            <SessionStatusPanel 
              selectedLanguage={state.selectedLanguage}
              sessionId={state.sessionId}
              conversationHistory={state.conversationHistory}
              autoInteractionEnabled={state.autoInteractionEnabled}
              facesDetected={state.facesDetected}
              faceCount={state.faceCount}
            />
          </div>
        </TabsContent>

        {/* Floor Map Tab */}
        <TabsContent value="map" className="space-y-6">
          <div className="bg-gradient-to-r from-blue-100 to-green-100 p-6 rounded-2xl border-2 border-blue-200">
            <div className="flex items-center space-x-3 mb-4">
              <Map className="h-8 w-8 text-blue-600" />
              <h3 className="text-2xl font-bold text-blue-800">Interactive Hospital Map</h3>
            </div>
            <p className="text-blue-600 text-lg">Navigate easily through our hospital with real-time directions</p>
          </div>
          <HospitalFloorMap 
            targetDepartment={state.selectedDepartment}
            onDepartmentSelect={(dept) => onDepartmentSelect(dept.name)}
          />
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments" className="space-y-6">
          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-2xl border-2 border-green-200">
            <div className="flex items-center space-x-3 mb-4">
              <Stethoscope className="h-8 w-8 text-green-600" />
              <h3 className="text-2xl font-bold text-green-800">Medical Departments</h3>
            </div>
            <p className="text-green-600 text-lg">Explore our specialized medical departments and services</p>
          </div>
          <HospitalDataDisplay 
            selectedDepartment={state.selectedDepartment}
            onDepartmentSelect={onDepartmentSelect}
          />
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <MessageCircle className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">WhatsApp Appointment Booking</h3>
                  <p className="text-green-100">Quick, Easy & Instant Confirmations</p>
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="text-center space-y-8 p-8">
              <div className="bg-gradient-to-r from-green-100 via-blue-100 to-purple-100 border-2 border-green-300 rounded-3xl p-8">
                <div className="text-6xl mb-6 animate-bounce">📱</div>
                <h3 className="text-3xl font-bold text-green-800 mb-4">
                  Book via WhatsApp
                </h3>
                <p className="text-green-700 mb-8 text-xl">
                  Get instant appointment confirmations sent directly to your WhatsApp!
                </p>
                
                <Button 
                  onClick={onShowAppointmentModal}
                  className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 hover:from-green-700 hover:via-blue-700 hover:to-purple-700 h-20 px-12 text-2xl font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl"
                  size="lg"
                >
                  <Calendar className="h-8 w-8 mr-4" />
                  📅 Book Appointment Now
                </Button>
              </div>
              
              {/* Process Steps */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border-2 border-blue-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
                  <div className="text-5xl mb-4">1️⃣</div>
                  <h4 className="font-bold text-blue-600 mb-4 text-2xl">Book Online</h4>
                  <p className="text-gray-700 text-lg">Fill in your details and preferred time slot easily</p>
                </div>
                
                <div className="bg-white border-2 border-green-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
                  <div className="text-5xl mb-4">2️⃣</div>
                  <h4 className="font-bold text-green-600 mb-4 text-2xl">Get Token</h4>
                  <p className="text-gray-700 text-lg">Receive token number via WhatsApp instantly</p>
                </div>
                
                <div className="bg-white border-2 border-purple-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
                  <div className="text-5xl mb-4">3️⃣</div>
                  <h4 className="font-bold text-purple-600 mb-4 text-2xl">Visit Hospital</h4>
                  <p className="text-gray-700 text-lg">Show your token for quick check-in</p>
                </div>
              </div>

              {/* Elderly Help Section */}
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-3xl p-8">
                <h4 className="font-bold text-yellow-800 text-2xl mb-4">👴👵 Need Help?</h4>
                <p className="text-yellow-700 text-xl leading-relaxed">
                  Our friendly hospital staff are always available to assist with appointments and any questions. 
                  Just ask at the front desk or speak to our AI assistant!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default MainKioskInterface;
