
import React from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import WelcomeBanner from '@/components/WelcomeBanner';
import TabNavigation from '@/components/TabNavigation';
import AssistantTabContent from '@/components/AssistantTabContent';
import MapTabContent from '@/components/MapTabContent';
import DepartmentsTabContent from '@/components/DepartmentsTabContent';
import AppointmentsTabContent from '@/components/AppointmentsTabContent';
import GoogleCloudCredentials from '@/components/GoogleCloudCredentials';

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
  faceDetectionEnabled: boolean;
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
  onAutoGreetingTriggered,
  faceDetectionEnabled
}) => {
  return (
    <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6">
      {/* Hero Welcome Banner */}
      <WelcomeBanner 
        facesDetected={state.facesDetected}
        currentResponse={state.currentResponse}
      />

      {/* Modern Tab Interface */}
      <Tabs defaultValue="assistant" className="space-y-6">
        <TabNavigation />

        {/* AI Assistant Tab */}
        <TabsContent value="assistant">
          <AssistantTabContent
            state={state}
            isListening={isListening}
            onVoiceData={onVoiceData}
            onListeningChange={onListeningChange}
            onFaceDetected={onFaceDetected}
            onQuickAction={onQuickAction}
            onAutoGreetingTriggered={onAutoGreetingTriggered}
            faceDetectionEnabled={faceDetectionEnabled}
          />
        </TabsContent>

        {/* Floor Map Tab */}
        <TabsContent value="map">
          <MapTabContent
            selectedDepartment={state.selectedDepartment}
            onDepartmentSelect={onDepartmentSelect}
          />
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <DepartmentsTabContent
            selectedDepartment={state.selectedDepartment}
            onDepartmentSelect={onDepartmentSelect}
          />
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <AppointmentsTabContent
            onShowAppointmentModal={onShowAppointmentModal}
          />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <GoogleCloudCredentials />
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default MainKioskInterface;
