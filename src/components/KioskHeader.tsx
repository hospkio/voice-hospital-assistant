
import React from 'react';
import { Camera, Settings, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '@/components/LanguageSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';

interface KioskHeaderProps {
  facesDetected: boolean;
  faceCount: number;
  selectedLanguage: string;
  autoInteractionEnabled: boolean;
  faceDetectionEnabled: boolean;
  onLanguageChange: (language: string) => void;
  onToggleAutoInteraction: (enabled: boolean) => void;
}

const KioskHeader: React.FC<KioskHeaderProps> = ({
  facesDetected,
  faceCount,
  selectedLanguage,
  autoInteractionEnabled,
  faceDetectionEnabled,
  onLanguageChange,
  onToggleAutoInteraction
}) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-blue-100 p-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-4 rounded-2xl shadow-lg">
            <Stethoscope className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              MediCare Smart Kiosk
            </h1>
            <p className="text-gray-600 text-lg">
              AI Healthcare Assistant • Multi-Language • 
              {faceDetectionEnabled ? ' Face Detection •' : ''} Voice AI
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {facesDetected && faceDetectionEnabled && (
            <div className="flex items-center space-x-2 bg-green-100 px-4 py-2 rounded-full border border-green-300 shadow-sm">
              <Camera className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-semibold">
                {faceCount} Person{faceCount !== 1 ? 's' : ''} Ready
              </span>
            </div>
          )}
          
          <LanguageSelector 
            selected={selectedLanguage}
            onChange={onLanguageChange}
          />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline"
                className="h-12 px-4"
              >
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <span>All Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={autoInteractionEnabled}
                onCheckedChange={onToggleAutoInteraction}
              >
                Auto Interaction
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default KioskHeader;
