
import React from 'react';
import { Stethoscope } from 'lucide-react';
import HospitalDataDisplay from '@/components/HospitalDataDisplay';

interface DepartmentsTabContentProps {
  selectedDepartment: string;
  onDepartmentSelect: (department: string) => void;
}

const DepartmentsTabContent: React.FC<DepartmentsTabContentProps> = ({
  selectedDepartment,
  onDepartmentSelect
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-2xl border-2 border-green-200">
        <div className="flex items-center space-x-3 mb-4">
          <Stethoscope className="h-8 w-8 text-green-600" />
          <h3 className="text-2xl font-bold text-green-800">Medical Departments</h3>
        </div>
        <p className="text-green-600 text-lg">Explore our specialized medical departments and services</p>
      </div>
      <HospitalDataDisplay 
        selectedDepartment={selectedDepartment}
        onDepartmentSelect={onDepartmentSelect}
      />
    </div>
  );
};

export default DepartmentsTabContent;
