
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Database, 
  Settings as SettingsIcon, 
  RefreshCw, 
  Download,
  CheckCircle,
  AlertCircle,
  Zap,
  Globe,
  Clock
} from 'lucide-react';
import { useDialogflowAutomation } from '@/hooks/useDialogflowAutomation';
import { toast } from 'sonner';

interface DialogflowSettingsProps {
  automationEnabled: boolean;
  onAutomationToggle: (enabled: boolean) => void;
  autoTrainingEnabled: boolean;
  onAutoTrainingToggle: (enabled: boolean) => void;
  trainingInterval: number;
  onTrainingIntervalChange: (minutes: number) => void;
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
}

const DialogflowSettingsPanel: React.FC<DialogflowSettingsProps> = ({
  automationEnabled,
  onAutomationToggle,
  autoTrainingEnabled,
  onAutoTrainingToggle,
  trainingInterval,
  onTrainingIntervalChange,
  selectedLanguages,
  onLanguagesChange
}) => {
  const {
    generateTrainingData,
    exportDialogflowConfig,
    isGenerating,
    lastGenerated,
    trainingData
  } = useDialogflowAutomation();

  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [maxIntentsGenerated, setMaxIntentsGenerated] = useState(50);
  const [enableEntitySynonyms, setEnableEntitySynonyms] = useState(true);
  const [enableMultiLanguage, setEnableMultiLanguage] = useState(true);

  const availableLanguages = [
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'hi-IN', name: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'ta-IN', name: 'தமிழ் (Tamil)', flag: '🇮🇳' },
    { code: 'ml-IN', name: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
    { code: 'te-IN', name: 'తెలుగు (Telugu)', flag: '🇮🇳' }
  ];

  const handleGenerateTrainingData = async () => {
    try {
      await generateTrainingData();
      toast.success('Training data generated successfully!');
    } catch (error) {
      toast.error('Failed to generate training data');
      console.error(error);
    }
  };

  const handleExportConfig = async () => {
    try {
      await exportDialogflowConfig();
      toast.success('Dialogflow configuration exported!');
    } catch (error) {
      toast.error('Failed to export configuration');
      console.error(error);
    }
  };

  const handleLanguageToggle = (languageCode: string) => {
    const updated = selectedLanguages.includes(languageCode)
      ? selectedLanguages.filter(lang => lang !== languageCode)
      : [...selectedLanguages, languageCode];
    onLanguagesChange(updated);
  };

  const getStatusBadge = () => {
    if (!automationEnabled) {
      return <Badge variant="secondary">Disabled</Badge>;
    }
    if (isGenerating) {
      return <Badge variant="outline">Generating...</Badge>;
    }
    if (trainingData) {
      return <Badge variant="default">Ready</Badge>;
    }
    return <Badge variant="destructive">Not Configured</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-blue-600" />
              <span>Dialogflow Automation Settings</span>
            </div>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {trainingData?.intents.length || 0}
              </div>
              <div className="text-sm text-gray-600">Intents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {trainingData?.entities.length || 0}
              </div>
              <div className="text-sm text-gray-600">Entities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {trainingData?.trainingPhrases.length || 0}
              </div>
              <div className="text-sm text-gray-600">Phrases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {selectedLanguages.length}
              </div>
              <div className="text-sm text-gray-600">Languages</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleGenerateTrainingData}
              disabled={isGenerating || !automationEnabled}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              <span>Generate Training Data</span>
            </Button>

            <Button 
              onClick={handleExportConfig}
              variant="outline"
              disabled={!trainingData || !automationEnabled}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Config</span>
            </Button>

            {lastGenerated && (
              <Badge variant="secondary" className="flex items-center space-x-1">
                <CheckCircle className="h-3 w-3" />
                <span>Last: {lastGenerated.toLocaleTimeString()}</span>
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <SettingsIcon className="h-5 w-5" />
                <span>General Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="automation-enabled" className="text-base font-medium">
                    Enable Dialogflow Automation
                  </Label>
                  <p className="text-sm text-gray-600">
                    Automatically process queries using generated intents and entities
                  </p>
                </div>
                <Switch
                  id="automation-enabled"
                  checked={automationEnabled}
                  onCheckedChange={onAutomationToggle}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="multi-language" className="text-base font-medium">
                    Multi-Language Support
                  </Label>
                  <p className="text-sm text-gray-600">
                    Generate responses in multiple languages based on user preferences
                  </p>
                </div>
                <Switch
                  id="multi-language"
                  checked={enableMultiLanguage}
                  onCheckedChange={setEnableMultiLanguage}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Confidence Threshold</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600">
                    Minimum confidence score for intent recognition
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Training Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-training" className="text-base font-medium">
                    Auto-Generate Training Data
                  </Label>
                  <p className="text-sm text-gray-600">
                    Automatically regenerate training data at specified intervals
                  </p>
                </div>
                <Switch
                  id="auto-training"
                  checked={autoTrainingEnabled}
                  onCheckedChange={onAutoTrainingToggle}
                />
              </div>

              {autoTrainingEnabled && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Training Interval (minutes)</Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      type="number"
                      min="5"
                      max="1440"
                      value={trainingInterval}
                      onChange={(e) => onTrainingIntervalChange(parseInt(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600">
                      How often to regenerate training data (5-1440 minutes)
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-base font-medium">Maximum Intents</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    type="number"
                    min="10"
                    max="100"
                    value={maxIntentsGenerated}
                    onChange={(e) => setMaxIntentsGenerated(parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600">
                    Maximum number of intents to generate
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="entity-synonyms" className="text-base font-medium">
                    Generate Entity Synonyms
                  </Label>
                  <p className="text-sm text-gray-600">
                    Automatically create synonyms for better entity recognition
                  </p>
                </div>
                <Switch
                  id="entity-synonyms"
                  checked={enableEntitySynonyms}
                  onCheckedChange={setEnableEntitySynonyms}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Language Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">Supported Languages</Label>
                <p className="text-sm text-gray-600">
                  Select languages for training data generation and response templates
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableLanguages.map((lang) => (
                    <div
                      key={lang.code}
                      className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedLanguages.includes(lang.code)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => handleLanguageToggle(lang.code)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <div>
                            <div className="font-medium">{lang.name}</div>
                            <div className="text-xs text-gray-500">{lang.code}</div>
                          </div>
                        </div>
                        {selectedLanguages.includes(lang.code) && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Advanced Configuration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Advanced Settings</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      These settings affect how the automation system processes queries and generates responses. 
                      Modify with caution.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  <strong>Current Configuration:</strong>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">Intent Processing</div>
                    <div className="text-gray-600">Pattern-based classification</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">Entity Extraction</div>
                    <div className="text-gray-600">Keyword matching + synonyms</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">Response Generation</div>
                    <div className="text-gray-600">Template-based with variables</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="font-medium">Database Integration</div>
                    <div className="text-gray-600">Real-time query execution</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DialogflowSettingsPanel;
