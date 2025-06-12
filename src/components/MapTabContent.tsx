
import React from 'react';
import { Map } from 'lucide-react';
import HospitalFloorMap from '@/components/HospitalFloorMap';

interface MapTabContentProps {
  selectedDepartment: string;
  onDepartmentSelect: (department: string) => void;
}

const MapTabContent: React.FC<MapTabContentProps> = ({
  selectedDepartment,
  onDepartmentSelect
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-100 to-green-100 p-6 rounded-2xl border-2 border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Map className="h-8 w-8 text-blue-600" />
          <h3 className="text-2xl font-bold text-blue-800">Interactive Hospital Map</h3>
        </div>
        <p className="text-blue-600 text-lg">Navigate easily through our hospital with real-time directions</p>
      </div>
      <HospitalFloorMap 
        targetDepartment={selectedDepartment}
        onDepartmentSelect={(dept) => onDepartmentSelect(dept.name)}
      />
    </div>
  );
};

export default MapTabContent;
