
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Mic, Globe, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SettingsProps {
  faceDetectionEnabled: boolean;
  onFaceDetectionToggle: (enabled: boolean) => void;
  autoInteractionEnabled: boolean;
  onAutoInteractionToggle: (enabled: boolean) => void;
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const Settings: React.FC<SettingsProps> = ({
  faceDetectionEnabled,
  onFaceDetectionToggle,
  autoInteractionEnabled,
  onAutoInteractionToggle,
  selectedLanguage,
  onLanguageChange
}) => {
  const navigate = useNavigate();

  const languages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'hi-IN', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'ml-IN', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
    { code: 'te-IN', name: 'తెలుగు (Telugu)', flag: '🇮🇳' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/enhanced-kiosk')}
            className="h-12 w-12"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Kiosk Settings
            </h1>
            <p className="text-gray-600 text-lg">Configure your AI assistant preferences</p>
          </div>
        </div>

        {/* Settings Cards */}
        <div className="grid gap-6">
          {/* Face Detection Settings */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Camera className="h-5 w-5 text-blue-600" />
                </div>
                Smart Face Detection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="face-detection" className="text-base font-medium">
                    Enable Face Detection
                  </Label>
                  <p className="text-sm text-gray-600">
                    Automatically detect when someone approaches the kiosk and trigger greeting
                  </p>
                </div>
                <Switch
                  id="face-detection"
                  checked={faceDetectionEnabled}
                  onCheckedChange={onFaceDetectionToggle}
                />
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> When enabled, the system will automatically greet users when faces are detected. 
                  This requires camera permissions and works best in well-lit environments.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Auto Interaction Settings */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mic className="h-5 w-5 text-green-600" />
                </div>
                Voice Interaction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-interaction" className="text-base font-medium">
                    Enable Auto Voice Interaction
                  </Label>
                  <p className="text-sm text-gray-600">
                    Automatically enable voice commands and responses
                  </p>
                </div>
                <Switch
                  id="auto-interaction"
                  checked={autoInteractionEnabled}
                  onCheckedChange={onAutoInteractionToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe className="h-5 w-5 text-purple-600" />
                </div>
                Language Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">Default Language</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => onLanguageChange(lang.code)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${
                        selectedLanguage === lang.code
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <div>
                          <div className="font-medium">{lang.name}</div>
                          <div className="text-xs text-gray-500">{lang.code}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Information */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Bell className="h-5 w-5 text-yellow-600" />
                </div>
                Current Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">Face Detection</div>
                  <div className={`text-lg font-bold ${faceDetectionEnabled ? 'text-green-600' : 'text-red-600'}`}>
                    {faceDetectionEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">Voice Interaction</div>
                  <div className={`text-lg font-bold ${autoInteractionEnabled ? 'text-green-600' : 'text-red-600'}`}>
                    {autoInteractionEnabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">Language</div>
                  <div className="text-lg font-bold text-blue-600">
                    {languages.find(l => l.code === selectedLanguage)?.name.split(' ')[0] || 'English'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
