
import React from 'react';
import { Volume2, Camera, MessageCircle, Calendar } from 'lucide-react';
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
}

const MainKioskInterface: React.FC<MainKioskInterfaceProps> = ({
  state,
  isListening,
  onVoiceData,
  onListeningChange,
  onFaceDetected,
  onQuickAction,
  onDepartmentSelect,
  onShowAppointmentModal
}) => {
  return (
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
                    isListening={isListening}
                    onVoiceData={onVoiceData}
                    language={state.selectedLanguage}
                    onListeningChange={onListeningChange}
                  />
                </CardContent>
              </Card>

              {/* Enhanced Face Detection Camera */}
              <EnhancedFaceDetectionCamera 
                onFaceDetected={onFaceDetected}
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
                  onClick={onShowAppointmentModal}
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
  );
};

export default MainKioskInterface;
