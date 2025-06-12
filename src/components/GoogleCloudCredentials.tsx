
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Key, TestTube, CheckCircle, XCircle, Upload, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { credentialsManager } from '@/utils/credentialsManager';

const GoogleCloudCredentials = () => {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState(credentialsManager.getCredentials());
  const [testResults, setTestResults] = useState<{[key: string]: boolean}>({});
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setCredentials(credentialsManager.getCredentials());
  }, []);

  const handleSave = () => {
    const success = credentialsManager.saveCredentials(credentials);
    if (success) {
      toast({
        title: "✅ Credentials Saved",
        description: "Google Cloud credentials have been saved securely.",
      });
    } else {
      toast({
        title: "❌ Save Failed",
        description: "Failed to save credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(credentials, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'google-cloud-credentials.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "📄 Credentials Exported",
        description: "Credentials file downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "❌ Export Failed",
        description: "Failed to export credentials.",
        variant: "destructive",
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedCredentials = JSON.parse(e.target?.result as string);
        setCredentials(importedCredentials);
        credentialsManager.saveCredentials(importedCredentials);
        
        toast({
          title: "📂 Credentials Imported",
          description: "Credentials loaded from file successfully.",
        });
      } catch (error) {
        toast({
          title: "❌ Import Failed",
          description: "Invalid credentials file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    credentialsManager.clearCredentials();
    setCredentials(credentialsManager.getCredentials());
    setTestResults({});
    
    toast({
      title: "🗑️ Credentials Cleared",
      description: "All credentials have been removed.",
    });
  };

  const testSTT = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${credentials.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio: { content: '' },
            config: { encoding: 'WEBM_OPUS', sampleRateHertz: 48000, languageCode: 'en-US' }
          })
        }
      );
      
      setTestResults(prev => ({ ...prev, stt: response.status !== 403 }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, stt: false }));
    }
    setIsTesting(false);
  };

  const testTTS = async () => {
    setIsTesting(true);
    try {
      const response = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${credentials.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: 'test' },
            voice: { languageCode: 'en-US', name: 'en-US-Studio-M', ssmlGender: 'MALE' },
            audioConfig: { audioEncoding: 'MP3' }
          })
        }
      );
      
      setTestResults(prev => ({ ...prev, tts: response.ok }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, tts: false }));
    }
    setIsTesting(false);
  };

  const testVision = async () => {
    setIsTesting(true);
    try {
      const apiKey = credentials.vision.apiKey || credentials.apiKey;
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [{
              image: { content: 'test' },
              features: [{ type: 'FACE_DETECTION', maxResults: 1 }]
            }]
          })
        }
      );
      
      setTestResults(prev => ({ ...prev, vision: response.status !== 403 }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, vision: false }));
    }
    setIsTesting(false);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Key className="h-6 w-6" />
          <span>Google Cloud API Credentials</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* File Operations */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSave} className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Save Credentials</span>
          </Button>
          
          <Button variant="outline" onClick={handleExport} className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export JSON</span>
          </Button>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </Button>
          
          <Button variant="destructive" onClick={handleClear} className="flex items-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </Button>
        </div>

        <Separator />

        {/* Basic API Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic API Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="apiKey">Google Cloud API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={credentials.apiKey}
                onChange={(e) => setCredentials({...credentials, apiKey: e.target.value})}
                placeholder="Your Google Cloud API Key"
              />
            </div>
            
            <div>
              <Label htmlFor="projectId">Project ID</Label>
              <Input
                id="projectId"
                value={credentials.projectId}
                onChange={(e) => setCredentials({...credentials, projectId: e.target.value})}
                placeholder="your-project-id"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Dialogflow CX Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Dialogflow CX Configuration</h3>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              ⚠️ <strong>Note:</strong> Dialogflow CX requires OAuth2 authentication, not API keys. 
              The system will fall back to local processing when Dialogflow CX is unavailable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cxProjectId">CX Project ID</Label>
              <Input
                id="cxProjectId"
                value={credentials.dialogflowCX.projectId}
                onChange={(e) => setCredentials({
                  ...credentials, 
                  dialogflowCX: {...credentials.dialogflowCX, projectId: e.target.value}
                })}
                placeholder="cx-project-id"
              />
            </div>
            
            <div>
              <Label htmlFor="cxLocation">Location</Label>
              <Input
                id="cxLocation"
                value={credentials.dialogflowCX.location}
                onChange={(e) => setCredentials({
                  ...credentials, 
                  dialogflowCX: {...credentials.dialogflowCX, location: e.target.value}
                })}
                placeholder="us-central1"
              />
            </div>
            
            <div>
              <Label htmlFor="cxAgentId">Agent ID</Label>
              <Input
                id="cxAgentId"
                value={credentials.dialogflowCX.agentId}
                onChange={(e) => setCredentials({
                  ...credentials, 
                  dialogflowCX: {...credentials.dialogflowCX, agentId: e.target.value}
                })}
                placeholder="agent-id"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Vision API Configuration */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Vision API Configuration</h3>
          
          <div>
            <Label htmlFor="visionApiKey">Vision API Key (Optional - falls back to main API key)</Label>
            <Input
              id="visionApiKey"
              type="password"
              value={credentials.vision.apiKey}
              onChange={(e) => setCredentials({
                ...credentials, 
                vision: {...credentials.vision, apiKey: e.target.value}
              })}
              placeholder="Specific Vision API Key (optional)"
            />
          </div>
        </div>

        <Separator />

        {/* API Testing */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>API Testing</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Speech-to-Text</p>
                {testResults.stt !== undefined && (
                  <Badge variant={testResults.stt ? "default" : "destructive"}>
                    {testResults.stt ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                    {testResults.stt ? 'Working' : 'Failed'}
                  </Badge>
                )}
              </div>
              <Button size="sm" onClick={testSTT} disabled={isTesting || !credentials.apiKey}>
                Test
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Text-to-Speech</p>
                {testResults.tts !== undefined && (
                  <Badge variant={testResults.tts ? "default" : "destructive"}>
                    {testResults.tts ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                    {testResults.tts ? 'Working' : 'Failed'}
                  </Badge>
                )}
              </div>
              <Button size="sm" onClick={testTTS} disabled={isTesting || !credentials.apiKey}>
                Test
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Vision API</p>
                {testResults.vision !== undefined && (
                  <Badge variant={testResults.vision ? "default" : "destructive"}>
                    {testResults.vision ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
                    {testResults.vision ? 'Working' : 'Failed'}
                  </Badge>
                )}
              </div>
              <Button size="sm" onClick={testVision} disabled={isTesting || (!credentials.vision.apiKey && !credentials.apiKey)}>
                Test
              </Button>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <strong>Status:</strong> {credentialsManager.areCredentialsConfigured() 
              ? '✅ Basic credentials configured' 
              : '❌ API key and Project ID required'
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleCloudCredentials;
