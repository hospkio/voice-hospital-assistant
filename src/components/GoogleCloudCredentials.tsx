
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Key, CheckCircle } from 'lucide-react';
import { credentialsManager } from '@/utils/credentialsManager';

const GoogleCloudCredentials = () => {
  const [credentials, setCredentials] = useState(() => {
    // Initialize with safe defaults immediately
    return credentialsManager.getCredentials();
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load credentials on component mount with error handling
    try {
      const loadedCredentials = credentialsManager.getCredentials();
      setCredentials(loadedCredentials);
    } catch (error) {
      console.error('Error loading credentials:', error);
      // Fallback to default structure if loading fails
      setCredentials({
        apiKey: '',
        projectId: '',
        dialogflowCX: {
          projectId: '',
          location: 'us-central1',
          agentId: ''
        },
        vision: {
          apiKey: ''
        }
      });
    }
  }, []);

  const handleInputChange = (field: string, value: string, section?: string) => {
    setCredentials(prev => {
      if (section) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const success = credentialsManager.saveCredentials(credentials);
      if (success) {
        setSaveMessage('✅ Credentials saved successfully!');
      } else {
        setSaveMessage('❌ Failed to save credentials');
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      setSaveMessage('❌ Error saving credentials');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handleClear = () => {
    credentialsManager.clearCredentials();
    setCredentials({
      apiKey: '',
      projectId: '',
      dialogflowCX: {
        projectId: '',
        location: 'us-central1',
        agentId: ''
      },
      vision: {
        apiKey: ''
      }
    });
    setSaveMessage('🗑️ Credentials cleared');
    setTimeout(() => setSaveMessage(''), 2000);
  };

  // Safety check - ensure credentials structure exists
  if (!credentials || !credentials.dialogflowCX || !credentials.vision) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-gray-500">Loading credentials...</p>
          <Button 
            onClick={() => setCredentials(credentialsManager.getCredentials())}
            variant="outline"
            className="mt-4"
          >
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-2xl border-2 border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <Settings className="h-8 w-8 text-purple-600" />
          <h3 className="text-2xl font-bold text-purple-800">Google Cloud Credentials</h3>
        </div>
        <p className="text-purple-600 text-lg">Configure your Google Cloud API keys for enhanced functionality</p>
      </div>

      {saveMessage && (
        <Alert className={saveMessage.includes('✅') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={saveMessage.includes('✅') ? 'text-green-800' : 'text-red-800'}>
            {saveMessage}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Google Cloud Settings */}
        <Card className="shadow-lg border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Key className="h-5 w-5" />
              <span>General Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div>
              <Label htmlFor="apiKey" className="text-sm font-semibold">Google Cloud API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={credentials.apiKey || ''}
                onChange={(e) => handleInputChange('apiKey', e.target.value)}
                placeholder="Enter your Google Cloud API key"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Used for Speech-to-Text, Text-to-Speech, and Vision APIs</p>
            </div>
            
            <div>
              <Label htmlFor="projectId" className="text-sm font-semibold">Project ID</Label>
              <Input
                id="projectId"
                value={credentials.projectId || ''}
                onChange={(e) => handleInputChange('projectId', e.target.value)}
                placeholder="your-project-id"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Dialogflow CX Settings */}
        <Card className="shadow-lg border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              <span>Dialogflow CX</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div>
              <Label htmlFor="cxProjectId" className="text-sm font-semibold">CX Project ID</Label>
              <Input
                id="cxProjectId"
                value={credentials.dialogflowCX?.projectId || ''}
                onChange={(e) => handleInputChange('projectId', e.target.value, 'dialogflowCX')}
                placeholder="dialogflow-project-id"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="cxLocation" className="text-sm font-semibold">Location</Label>
              <Input
                id="cxLocation"
                value={credentials.dialogflowCX?.location || 'us-central1'}
                onChange={(e) => handleInputChange('location', e.target.value, 'dialogflowCX')}
                placeholder="us-central1"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="cxAgentId" className="text-sm font-semibold">Agent ID</Label>
              <Input
                id="cxAgentId"
                value={credentials.dialogflowCX?.agentId || ''}
                onChange={(e) => handleInputChange('agentId', e.target.value, 'dialogflowCX')}
                placeholder="agent-id"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Vision API Settings */}
        <Card className="shadow-lg border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
            <CardTitle className="flex items-center space-x-2 text-purple-800">
              <Key className="h-5 w-5" />
              <span>Vision API</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div>
              <Label htmlFor="visionApiKey" className="text-sm font-semibold">Vision API Key</Label>
              <Input
                id="visionApiKey"
                type="password"
                value={credentials.vision?.apiKey || ''}
                onChange={(e) => handleInputChange('apiKey', e.target.value, 'vision')}
                placeholder="Vision API key (optional)"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">For face detection and image analysis</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="shadow-lg border-2 border-gray-200">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <CardTitle className="text-gray-800">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? 'Saving...' : 'Save Credentials'}
            </Button>
            
            <Button 
              onClick={handleClear} 
              variant="outline"
              className="w-full border-red-300 text-red-600 hover:bg-red-50"
            >
              Clear All Credentials
            </Button>
          </CardContent>
        </Card>
      </div>

      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertDescription className="text-yellow-800">
          <strong>Security Note:</strong> Credentials are stored locally in your browser's localStorage. 
          For production use, consider using environment variables or secure credential management.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default GoogleCloudCredentials;
