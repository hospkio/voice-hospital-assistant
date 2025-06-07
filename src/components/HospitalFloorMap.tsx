
import React, { useState } from 'react';
import { MapPin, Navigation, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Department {
  id: string;
  name: string;
  floor: number;
  room: string;
  x: number;
  y: number;
  color: string;
}

interface HospitalFloorMapProps {
  targetDepartment?: string;
  onDepartmentSelect?: (department: Department) => void;
}

const HospitalFloorMap: React.FC<HospitalFloorMapProps> = ({ 
  targetDepartment, 
  onDepartmentSelect 
}) => {
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [highlightedPath, setHighlightedPath] = useState<string | null>(null);

  const departments: Department[] = [
    // Floor 1
    { id: 'emergency', name: 'Emergency', floor: 1, room: '101-120', x: 50, y: 200, color: '#ef4444' },
    { id: 'reception', name: 'Reception', floor: 1, room: '100', x: 200, y: 150, color: '#3b82f6' },
    { id: 'pharmacy', name: 'Pharmacy', floor: 1, room: '130', x: 350, y: 200, color: '#10b981' },
    { id: 'lab', name: 'Laboratory', floor: 1, room: '140-150', x: 500, y: 180, color: '#f59e0b' },
    
    // Floor 2
    { id: 'radiology', name: 'Radiology', floor: 2, room: '201-210', x: 100, y: 150, color: '#8b5cf6' },
    { id: 'surgery', name: 'Surgery', floor: 2, room: '220-240', x: 300, y: 120, color: '#ef4444' },
    { id: 'icu', name: 'ICU', floor: 2, room: '250-260', x: 500, y: 150, color: '#dc2626' },
    
    // Floor 3
    { id: 'cardiology', name: 'Cardiology', floor: 3, room: '301-315', x: 150, y: 180, color: '#e11d48' },
    { id: 'neurology', name: 'Neurology', floor: 3, room: '320-330', x: 350, y: 160, color: '#7c3aed' },
    { id: 'orthopedics', name: 'Orthopedics', floor: 3, room: '340-350', x: 500, y: 200, color: '#059669' },
  ];

  const currentFloorDepartments = departments.filter(dept => dept.floor === selectedFloor);
  const targetDept = departments.find(dept => 
    dept.name.toLowerCase().includes(targetDepartment?.toLowerCase() || '')
  );

  const generatePath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
  };

  const handleDepartmentClick = (department: Department) => {
    onDepartmentSelect?.(department);
    setHighlightedPath(department.id);
    
    // Auto-switch to department floor
    if (department.floor !== selectedFloor) {
      setSelectedFloor(department.floor);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-blue-600" />
            <span>Hospital Floor Map</span>
          </div>
          
          {targetDept && (
            <div className="flex items-center space-x-2 text-sm">
              <Navigation className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">
                Navigating to {targetDept.name}
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Floor Selection */}
        <div className="flex space-x-2">
          {[1, 2, 3].map(floor => (
            <Button
              key={floor}
              variant={selectedFloor === floor ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFloor(floor)}
              className="flex-1"
            >
              Floor {floor}
            </Button>
          ))}
        </div>

        {/* Interactive Map */}
        <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
          <svg 
            width="600" 
            height="300" 
            viewBox="0 0 600 300"
            className="w-full h-auto border border-gray-200 rounded bg-white"
          >
            {/* Floor Layout */}
            <rect x="20" y="20" width="560" height="260" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />
            
            {/* Corridors */}
            <rect x="40" y="140" width="520" height="20" fill="#e2e8f0" />
            <rect x="290" y="40" width="20" height="220" fill="#e2e8f0" />
            
            {/* Entrance */}
            <rect x="280" y="260" width="40" height="20" fill="#3b82f6" />
            <text x="300" y="275" textAnchor="middle" fontSize="12" fill="white">Entrance</text>
            
            {/* Elevator */}
            <rect x="290" y="100" width="20" height="40" fill="#6b7280" />
            <text x="300" y="122" textAnchor="middle" fontSize="10" fill="white">🛗</text>
            
            {/* Departments for Current Floor */}
            {currentFloorDepartments.map(dept => (
              <g key={dept.id}>
                <circle
                  cx={dept.x}
                  cy={dept.y}
                  r="20"
                  fill={dept.color}
                  stroke={dept.id === highlightedPath ? "#000" : "white"}
                  strokeWidth={dept.id === highlightedPath ? 3 : 2}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => handleDepartmentClick(dept)}
                />
                <text
                  x={dept.x}
                  y={dept.y + 5}
                  textAnchor="middle"
                  fontSize="10"
                  fill="white"
                  className="cursor-pointer font-medium"
                  onClick={() => handleDepartmentClick(dept)}
                >
                  {dept.room}
                </text>
                <text
                  x={dept.x}
                  y={dept.y + 35}
                  textAnchor="middle"
                  fontSize="12"
                  className="cursor-pointer font-medium"
                  onClick={() => handleDepartmentClick(dept)}
                >
                  {dept.name}
                </text>
              </g>
            ))}
            
            {/* Navigation Path */}
            {targetDept && targetDept.floor === selectedFloor && (
              <g>
                <path
                  d={generatePath({ x: 300, y: 260 }, { x: targetDept.x, y: targetDept.y })}
                  stroke="#10b981"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="10,5"
                  className="animate-pulse"
                />
                <circle cx={targetDept.x} cy={targetDept.y} r="25" fill="none" stroke="#10b981" strokeWidth="3" className="animate-ping" />
              </g>
            )}
            
            {/* You are here marker */}
            <g>
              <circle cx="300" cy="250" r="8" fill="#ef4444" />
              <text x="300" y="240" textAnchor="middle" fontSize="10" className="font-medium">You are here</text>
            </g>
          </svg>
        </div>

        {/* Department Legend */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {currentFloorDepartments.map(dept => (
            <div 
              key={dept.id}
              className="flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => handleDepartmentClick(dept)}
            >
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: dept.color }}
              />
              <span className="font-medium">{dept.name}</span>
              <span className="text-gray-500 text-xs">{dept.room}</span>
            </div>
          ))}
        </div>

        {/* Navigation Instructions */}
        {targetDept && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-800 mb-2">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Navigation Instructions</span>
            </div>
            <div className="space-y-1 text-sm text-green-700">
              <p>🚶‍♂️ Walk straight from the entrance</p>
              {targetDept.floor !== 1 && (
                <p>🛗 Take the elevator to Floor {targetDept.floor}</p>
              )}
              <p>📍 Head to Room {targetDept.room} - {targetDept.name} Department</p>
              <p>⏱️ Estimated time: {Math.ceil(Math.random() * 3 + 2)} minutes</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HospitalFloorMap;
