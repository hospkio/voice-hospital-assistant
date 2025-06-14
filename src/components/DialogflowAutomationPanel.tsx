
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Database, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Zap,
  FileText,
  Settings
} from 'lucide-react';
import { useDialogflowAutomation } from '@/hooks/useDialogflowAutomation';
import { toast } from 'sonner';

const DialogflowAutomationPanel: React.FC = () => {
  const {
    generateTrainingData,
    exportDialogflowConfig,
    isGenerating,
    lastGenerated,
    trainingData
  } = useDialogflowAutomation();

  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

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

  const handleTestQuery = async () => {
    if (!testQuery.trim()) return;
    
    setIsTesting(true);
    try {
      const { processUserQuery } = useDialogflowAutomation();
      const result = await processUserQuery(testQuery, 'test-session', 'en-US');
      setTestResult(result);
      toast.success('Query processed successfully!');
    } catch (error) {
      toast.error('Failed to process test query');
      console.error(error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-blue-600" />
            <span>Dialogflow Automation Dashboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {trainingData?.intents.length || 0}
              </div>
              <div className="text-sm text-gray-600">Generated Intents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {trainingData?.entities.length || 0}
              </div>
              <div className="text-sm text-gray-600">Generated Entities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {trainingData?.trainingPhrases.length || 0}
              </div>
              <div className="text-sm text-gray-600">Training Phrases</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleGenerateTrainingData}
              disabled={isGenerating}
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
              disabled={!trainingData}
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

      <Tabs defaultValue="test" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="test">Test Queries</TabsTrigger>
          <TabsTrigger value="intents">Generated Intents</TabsTrigger>
          <TabsTrigger value="entities">Generated Entities</TabsTrigger>
        </TabsList>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Test Query Processing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="Enter a test query (e.g., 'Where is the cardiology department?')"
                  className="flex-1 px-3 py-2 border rounded-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleTestQuery()}
                />
                <Button 
                  onClick={handleTestQuery}
                  disabled={isTesting || !testQuery.trim()}
                >
                  {isTesting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    'Test'
                  )}
                </Button>
              </div>

              {testResult && (
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Response:</h4>
                    <p className="text-blue-700">{testResult.responseText}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium mb-1">Intent:</h5>
                      <Badge variant="outline">{testResult.intent}</Badge>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium mb-1">Confidence:</h5>
                      <Badge variant={testResult.confidence > 0.7 ? "default" : "secondary"}>
                        {Math.round(testResult.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                  
                  {Object.keys(testResult.entities).length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium mb-2">Entities:</h5>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(testResult.entities).map(([key, value]) => (
                          <Badge key={key} variant="secondary">
                            {key}: {String(value)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intents">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Generated Intents</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trainingData?.intents ? (
                <div className="space-y-4">
                  {trainingData.intents.map((intent, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">{intent.displayName}</h4>
                      <p className="text-sm text-gray-600 mb-3">Intent: {intent.name}</p>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium">Training Phrases:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {intent.trainingPhrases.slice(0, 3).map((phrase, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {phrase}
                              </Badge>
                            ))}
                            {intent.trainingPhrases.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{intent.trainingPhrases.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        {intent.entities.length > 0 && (
                          <div>
                            <span className="text-sm font-medium">Entities:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {intent.entities.map((entity, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  @{entity}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>No intents generated yet. Click "Generate Training Data" to start.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entities">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Generated Entities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trainingData?.entities ? (
                <div className="space-y-4">
                  {trainingData.entities.map((entity, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h4 className="font-semibold mb-2">@{entity.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{entity.displayName}</p>
                      <div>
                        <span className="text-sm font-medium">Sample Values:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entity.entries.slice(0, 5).map((entry, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {entry.value}
                            </Badge>
                          ))}
                          {entity.entries.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{entity.entries.length - 5} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>No entities generated yet. Click "Generate Training Data" to start.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DialogflowAutomationPanel;
