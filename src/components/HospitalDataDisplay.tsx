
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, Users, Phone, Info } from 'lucide-react';
import { hospitalDataService, type Department, type Doctor } from '@/services/hospitalDataService';

interface HospitalDataDisplayProps {
  selectedDepartment?: string;
  onDepartmentSelect?: (department: string) => void;
}

const HospitalDataDisplay: React.FC<HospitalDataDisplayProps> = ({ 
  selectedDepartment, 
  onDepartmentSelect 
}) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      loadDoctorsByDepartment(selectedDepartment);
    }
  }, [selectedDepartment]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      const data = await hospitalDataService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDoctorsByDepartment = async (departmentName: string) => {
    try {
      const data = await hospitalDataService.getDoctorsByDepartment(departmentName);
      setDoctors(data);
    } catch (error) {
      console.error('Failed to load doctors:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading hospital information...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Departments Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Hospital Departments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {departments.slice(0, 12).map((dept) => (
              <Button
                key={dept.id}
                variant={selectedDepartment === dept.name ? "default" : "outline"}
                size="sm"
                className="justify-start text-left h-auto p-3"
                onClick={() => onDepartmentSelect?.(dept.name)}
              >
                <div>
                  <div className="font-medium">{dept.name}</div>
                  <div className="text-xs opacity-70">Floor {dept.floor}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Department Details */}
      {selectedDepartment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5" />
              <span>{selectedDepartment} Department</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {departments
              .filter(dept => dept.name.toLowerCase() === selectedDepartment.toLowerCase())
              .map((dept) => (
                <div key={dept.id} className="space-y-2">
                  <div className="flex items-center space-x-4 text-sm">
                    <Badge variant="secondary">
                      Floor {dept.floor}
                    </Badge>
                    <Badge variant="outline">
                      Room {dept.room_number}
                    </Badge>
                  </div>
                  <p className="text-gray-700">{dept.description}</p>
                </div>
              ))}

            {/* Doctors in this department */}
            {doctors.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Available Doctors</span>
                </h4>
                <div className="space-y-3">
                  {doctors.slice(0, 3).map((doctor) => (
                    <div key={doctor.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-medium">{doctor.name}</h5>
                          <p className="text-sm text-gray-600">{doctor.specialization}</p>
                          <p className="text-sm text-green-600">
                            Experience: {doctor.experience_years} years
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            ₹{doctor.consultation_fee}
                          </Badge>
                        </div>
                      </div>
                      
                      {doctor.available_days && (
                        <div className="mt-2 flex items-center space-x-2 text-xs">
                          <Clock className="h-3 w-3" />
                          <span>Available: {doctor.available_days.slice(0, 3).join(', ')}</span>
                        </div>
                      )}
                      
                      {doctor.language_support && (
                        <div className="mt-1 flex items-center space-x-2 text-xs">
                          <span>Languages: {doctor.language_support.slice(0, 2).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HospitalDataDisplay;
