
import React from 'react';
import { Volume2, Camera, MessageCircle, Calendar, Sparkles } from 'lucide-react';
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
    <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
      {/* Welcome Banner for First-Time Users */}
      {!state.facesDetected && !state.currentResponse && (
        <div className="mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 p-1 rounded-2xl shadow-2xl">
          <div className="bg-white rounded-xl p-6 md:p-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-purple-500" />
              <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                Welcome to MediCare Smart Kiosk
              </h2>
              <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-purple-500" />
            </div>
            <p className="text-lg md:text-xl text-gray-700 mb-4">
              🤖 Your Intelligent Healthcare Assistant with AI-Powered Voice Recognition
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm md:text-base">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <span className="text-2xl mb-2 block">🎯</span>
                <p className="font-semibold text-blue-800">Smart Detection</p>
                <p className="text-blue-600 text-sm">Automatically detects when you approach</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <span className="text-2xl mb-2 block">🗣️</span>
                <p className="font-semibold text-green-800">Multi-Language</p>
                <p className="text-green-600 text-sm">Speaks your language automatically</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                <span className="text-2xl mb-2 block">🏥</span>
                <p className="font-semibold text-purple-800">Complete Help</p>
                <p className="text-purple-600 text-sm">Directions, appointments & more</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="assistant" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-16 md:h-14 text-base md:text-lg bg-gradient-to-r from-blue-100 to-green-100">
          <TabsTrigger value="assistant" className="h-14 md:h-12 font-semibold">
            🤖 AI Assistant
          </TabsTrigger>
          <TabsTrigger value="map" className="h-14 md:h-12 font-semibold">
            🗺️ Floor Map
          </TabsTrigger>
          <TabsTrigger value="departments" className="h-14 md:h-12 font-semibold">
            🏥 Departments
          </TabsTrigger>
          <TabsTrigger value="appointments" className="h-14 md:h-12 font-semibold">
            📅 Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistant" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Interaction Panel */}
          <div className="xl:col-span-2 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Voice Assistant Card */}
              <Card className="border-2 border-blue-200 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center space-x-3">
                    <Volume2 className="h-6 w-6 md:h-7 md:w-7" />
                    <span className="text-lg md:text-xl">🎤 Voice Assistant</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
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

          {/* Enhanced Control Panel */}
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

        <TabsContent value="map">
          <HospitalFloorMap 
            targetDepartment={state.selectedDepartment}
            onDepartmentSelect={(dept) => onDepartmentSelect(dept.name)}
          />
        </TabsContent>

        <TabsContent value="departments">
          <HospitalDataDisplay 
            selectedDepartment={state.selectedDepartment}
            onDepartmentSelect={onDepartmentSelect}
          />
        </TabsContent>

        <TabsContent value="appointments">
          <Card className="shadow-2xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
            <CardHeader className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <MessageCircle className="h-6 w-6 md:h-7 md:w-7" />
                <span className="text-lg md:text-xl">📱 WhatsApp Appointment Booking</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 p-6 md:p-8">
              <div className="bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-2xl p-6 md:p-8">
                <div className="text-4xl md:text-6xl mb-4">📱</div>
                <h3 className="text-2xl md:text-3xl font-bold text-green-800 mb-4">
                  Book via WhatsApp
                </h3>
                <p className="text-green-700 mb-6 text-lg md:text-xl">
                  Get instant appointment confirmations sent directly to your WhatsApp!
                </p>
                <Button 
                  onClick={onShowAppointmentModal}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 h-16 md:h-18 px-8 text-lg md:text-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Calendar className="h-6 w-6 md:h-7 md:w-7 mr-3" />
                  📅 Book Appointment Now
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm md:text-base">
                <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-3xl md:text-4xl mb-3">1️⃣</div>
                  <h4 className="font-bold text-blue-600 mb-3 text-lg md:text-xl">Book Online</h4>
                  <p className="text-gray-700">Fill in your details and preferred time slot</p>
                </div>
                <div className="bg-white border-2 border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-3xl md:text-4xl mb-3">2️⃣</div>
                  <h4 className="font-bold text-green-600 mb-3 text-lg md:text-xl">Get Token</h4>
                  <p className="text-gray-700">Receive token number via WhatsApp instantly</p>
                </div>
                <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-3xl md:text-4xl mb-3">3️⃣</div>
                  <h4 className="font-bold text-purple-600 mb-3 text-lg md:text-xl">Visit Hospital</h4>
                  <p className="text-gray-700">Show your token for quick check-in</p>
                </div>
              </div>

              {/* Additional Help for Elderly */}
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6 mt-6">
                <h4 className="font-bold text-yellow-800 text-lg md:text-xl mb-3">👴👵 Need Help?</h4>
                <p className="text-yellow-700 text-base md:text-lg">
                  Hospital staff are available to assist with appointments. Just ask at the front desk!
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
