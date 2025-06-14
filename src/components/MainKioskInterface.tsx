import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AssistantTabContent from '@/components/kiosk/AssistantTabContent';
import VoiceRecorderPhase5 from '@/components/VoiceRecorderPhase5';
import DepartmentsTabContent from '@/components/kiosk/DepartmentsTabContent';
import AppointmentsTabContent from '@/components/kiosk/AppointmentsTabContent';
import MapTabContent from '@/components/kiosk/MapTabContent';
import Settings from '@/components/kiosk/Settings';

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
  onFaceDetectionToggle: (enabled: boolean) => void;
  onAutoInteractionToggle: () => void;
  onLanguageChange: (language: string) => void;
  selectedLanguage: string;
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
  faceDetectionEnabled,
  onFaceDetectionToggle,
  onAutoInteractionToggle,
  onLanguageChange,
  selectedLanguage
}) => {
  const [activeTab, setActiveTab] = useState('assistant');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'assistant':
        return (
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
        );

      case 'voice-test':
        return <VoiceRecorderPhase5 selectedLanguage={selectedLanguage} />;

      case 'departments':
        return <DepartmentsTabContent onDepartmentSelect={onDepartmentSelect} />;

      case 'appointments':
        return <AppointmentsTabContent onShowAppointmentModal={onShowAppointmentModal} />;

      case 'map':
        return <MapTabContent />;

      case 'settings':
        return (
          <Settings 
            faceDetectionEnabled={faceDetectionEnabled}
            onFaceDetectionToggle={onFaceDetectionToggle}
            autoInteractionEnabled={state.autoInteractionEnabled}
            onAutoInteractionToggle={onAutoInteractionToggle}
            selectedLanguage={selectedLanguage}
            onLanguageChange={onLanguageChange}
          />
        );

      default:
        return <div>Select a tab to get started</div>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-2 rounded-md">
          <TabsTrigger value="assistant" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">Assistant</TabsTrigger>
          <TabsTrigger value="voice-test" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">Voice Test</TabsTrigger>
          <TabsTrigger value="departments" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">Departments</TabsTrigger>
          <TabsTrigger value="appointments" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">Appointments</TabsTrigger>
          <TabsTrigger value="map" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">Map</TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">Settings</TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          {renderTabContent()}
        </div>
      </Tabs>
    </div>
  );
};

export default MainKioskInterface;
