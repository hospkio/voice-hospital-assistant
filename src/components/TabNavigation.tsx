
import React from 'react';
import { Volume2, Calendar, Map, Building2, Stethoscope, Settings } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

const TabNavigation: React.FC = () => {
  return (
    <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-20 bg-gradient-to-r from-blue-100 via-purple-100 to-green-100 rounded-2xl p-2 shadow-lg">
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

      <TabsTrigger 
        value="settings" 
        className="h-16 rounded-xl font-bold text-lg bg-white/50 hover:bg-white data-[state=active]:bg-white data-[state=active]:shadow-lg transition-all"
      >
        <div className="flex flex-col items-center space-y-1">
          <Settings className="h-6 w-6" />
          <span>Settings</span>
        </div>
      </TabsTrigger>
    </TabsList>
  );
};

export default TabNavigation;
