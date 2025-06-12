
import React, { useState, useEffect } from 'react';
import { Settings, Key, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const GoogleCloudCredentials = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [credentials, setCredentials] = useState({
    apiKey: '',
    projectId: '',
    location: 'global',
    agentId: ''
  });
  const [isConfigured, setIsConfigured] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing credentials from localStorage
    const savedApiKey = localStorage.getItem('google_cloud_api_key');
    const savedProjectId = localStorage.getItem('dialogflow_cx_project_id');
    const savedLocation = localStorage.getItem('dialogflow_cx_location') || 'global';
    const savedAgentId = localStorage.getItem('dialogflow_cx_agent_id');

    if (savedApiKey || savedProjectId || savedAgentId) {
      setCredentials({
        apiKey: savedApiKey || '',
        projectId: savedProjectId || '',
        location: savedLocation,
        agentId: savedAgentId || ''
      });
      setIsConfigured(!!(savedApiKey && savedProjectId && savedAgentId));
    }
  }, []);

  const handleSaveCredentials = () => {
    if (!credentials.apiKey.trim()) {
      toast({
        title: "❌ API Key Required",
        description: "Please enter your Google Cloud API key",
        variant: "destructive",
      });
      return;
    }

    if (!credentials.projectId.trim()) {
      toast({
        title: "❌ Project ID Required",
        description: "Please enter your Google Cloud Project ID",
        variant: "destructive",
      });
      return;
    }

    if (!credentials.agentId.trim()) {
      toast({
        title: "❌ Agent ID Required",
        description: "Please enter your Dialogflow CX Agent ID",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage with encryption-like obfuscation
    localStorage.setItem('google_cloud_api_key', btoa(credentials.apiKey));
    localStorage.setItem('dialogflow_cx_project_id', credentials.projectId);
    localStorage.setItem('dialogflow_cx_location', credentials.location);
    localStorage.setItem('dialogflow_cx_agent_id', credentials.agentId);

    setIsConfigured(true);
    
    toast({
      title: "✅ Credentials Saved",
      description: "Google Cloud credentials have been securely stored locally",
      duration: 4000,
    });
  };

  const handleClearCredentials = () => {
    localStorage.removeItem('google_cloud_api_key');
    localStorage.removeItem('dialogflow_cx_project_id');
    localStorage.removeItem('dialogflow_cx_location');
    localStorage.removeItem('dialogflow_cx_agent_id');

    setCredentials({
      apiKey: '',
      projectId: '',
      location: 'global',
      agentId: ''
    });
    setIsConfigured(false);

    toast({
      title: "🗑️ Credentials Cleared",
      description: "All Google Cloud credentials have been removed",
      duration: 3000,
    });
  };

  const testConnection = async () => {
    if (!isConfigured) {
      toast({
        title: "⚠️ Configure First",
        description: "Please save your credentials before testing",
        variant: "destructive",
      });
      return;
    }

    try {
      // Test Speech-to-Text API
      const response = await fetch(
        `https://speech.googleapis.com/v1/operations?key=${atob(localStorage.getItem('google_cloud_api_key') || '')}`,
        { method: 'GET' }
      );

      if (response.ok) {
        toast({
          title: "✅ Connection Success",
          description: "Google Cloud APIs are accessible with your credentials",
          duration: 4000,
        });
      } else {
        throw new Error(`API test failed: ${response.status}`);
      }
    } catch (error) {
      toast({
        title: "❌ Connection Failed",
        description: "Please check your API key and permissions",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center space-x-3">
          <Settings className="h-6 w-6" />
          <span>Google Cloud Configuration</span>
          {isConfigured && <CheckCircle className="h-5 w-5 text-green-200" />}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Status Indicator */}
        <div className={`flex items-center space-x-2 p-3 rounded-lg ${
          isConfigured 
            ? 'bg-green-100 border border-green-300' 
            : 'bg-orange-100 border border-orange-300'
        }`}>
          {isConfigured ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 font-medium">Credentials Configured</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span className="text-orange-800 font-medium">Configuration Required</span>
            </>
          )}
        </div>

        {/* API Key Input */}
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="text-sm font-medium">
            Google Cloud API Key *
          </Label>
          <div className="relative">
            <Input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              value={credentials.apiKey}
              onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
              placeholder="Enter your Google Cloud API key"
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-gray-600">
            This key enables Speech-to-Text, Text-to-Speech, and Dialogflow services
          </p>
        </div>

        {/* Project ID Input */}
        <div className="space-y-2">
          <Label htmlFor="projectId" className="text-sm font-medium">
            Google Cloud Project ID *
          </Label>
          <Input
            id="projectId"
            value={credentials.projectId}
            onChange={(e) => setCredentials(prev => ({ ...prev, projectId: e.target.value }))}
            placeholder="your-project-id"
          />
        </div>

        {/* Location Input */}
        <div className="space-y-2">
          <Label htmlFor="location" className="text-sm font-medium">
            Dialogflow CX Location
          </Label>
          <Input
            id="location"
            value={credentials.location}
            onChange={(e) => setCredentials(prev => ({ ...prev, location: e.target.value }))}
            placeholder="global"
          />
        </div>

        {/* Agent ID Input */}
        <div className="space-y-2">
          <Label htmlFor="agentId" className="text-sm font-medium">
            Dialogflow CX Agent ID *
          </Label>
          <Input
            id="agentId"
            value={credentials.agentId}
            onChange={(e) => setCredentials(prev => ({ ...prev, agentId: e.target.value }))}
            placeholder="your-agent-id"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button 
            onClick={handleSaveCredentials}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Key className="h-4 w-4 mr-2" />
            Save Credentials
          </Button>
          
          {isConfigured && (
            <>
              <Button 
                onClick={testConnection}
                variant="outline"
                className="border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Test Connection
              </Button>
              
              <Button 
                onClick={handleClearCredentials}
                variant="destructive"
              >
                Clear
              </Button>
            </>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            🔒 <strong>Security Notice:</strong> Credentials are stored locally in your browser and are base64 encoded for basic obfuscation. 
            For production use, consider implementing server-side credential management.
          </p>
        </div>

        {/* Setup Instructions */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">Setup Instructions:</h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Create a Google Cloud project and enable Speech-to-Text, Text-to-Speech, and Dialogflow CX APIs</li>
            <li>Create an API key with access to these services</li>
            <li>Create a Dialogflow CX agent and note the Agent ID</li>
            <li>Enter your credentials above and save them</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleCloudCredentials;
