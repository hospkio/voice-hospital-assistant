
import { useState } from 'react';

interface DialogflowCXResponse {
  responseText: string;
  intent: string;
  entities: any;
  confidence: number;
  responseTime: number;
  responseData: any;
  success: boolean;
  sessionInfo?: any;
  parameters?: any;
}

export const useDialogflowCXService = () => {
  const [isLoading, setIsLoading] = useState(false);

  const processWithDialogflowCX = async (
    query: string, 
    sessionId: string, 
    languageCode: string = 'en-US'
  ): Promise<DialogflowCXResponse> => {
    setIsLoading(true);
    
    try {
      console.log('🤖 Sending to Dialogflow CX:', { query, sessionId, languageCode });
      
      // Get credentials from secure storage
      const encodedApiKey = localStorage.getItem('google_cloud_api_key');
      const projectId = localStorage.getItem('dialogflow_cx_project_id');
      const location = localStorage.getItem('dialogflow_cx_location') || 'global';
      const agentId = localStorage.getItem('dialogflow_cx_agent_id');

      if (!encodedApiKey || !projectId || !agentId) {
        throw new Error('Dialogflow CX credentials not configured. Please set up credentials in Settings tab.');
      }

      const apiKey = atob(encodedApiKey);
      const sessionPath = `projects/${projectId}/locations/${location}/agents/${agentId}/sessions/${sessionId}`;
      
      const requestBody = {
        queryInput: {
          text: {
            text: query,
          },
          languageCode: languageCode,
        },
        queryParams: {
          timeZone: 'Asia/Kolkata',
        },
      };

      console.log('Sending to Dialogflow CX API:', { sessionPath, query, languageCode });

      const response = await fetch(
        `https://dialogflow.googleapis.com/v3/${sessionPath}:detectIntent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dialogflow CX API error:', errorText);
        throw new Error(`Dialogflow CX API error: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Dialogflow CX response:', result);

      const queryResult = result.queryResult || {};
      const responseMessages = queryResult.responseMessages || [];
      
      let responseText = 'I apologize, but I could not process your request.';
      if (responseMessages.length > 0 && responseMessages[0].text) {
        responseText = responseMessages[0].text.text[0] || responseText;
      }

      const intentName = queryResult.intent?.displayName || 'unknown';
      const confidence = queryResult.intentDetectionConfidence || 0;
      const parameters = queryResult.parameters || {};

      return {
        responseText,
        intent: intentName,
        entities: parameters,
        confidence,
        responseTime: Date.now(),
        responseData: {
          type: 'dialogflow-cx',
          sessionInfo: queryResult.sessionInfo,
          parameters: parameters
        },
        success: true
      };
    } catch (error) {
      console.error('❌ Error processing with Dialogflow CX:', error);
      
      // Fallback to local processing
      return fallbackLocalProcessing(query, sessionId, languageCode);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processWithDialogflowCX,
    isLoading
  };
};

function fallbackLocalProcessing(query: string, sessionId: string, languageCode: string): DialogflowCXResponse {
  const normalizedQuery = query.toLowerCase();
  
  let intent = 'unknown';
  let responseText = "I'm having trouble connecting to our AI services. Let me help you with basic navigation.";
  let confidence = 0.3;
  
  if (normalizedQuery.includes('cardiology') || normalizedQuery.includes('heart')) {
    intent = 'navigation.department';
    responseText = "The Cardiology department is located on the 3rd floor, Room 301-315. They specialize in heart and cardiovascular diseases treatment.";
    confidence = 0.7;
  } else if (normalizedQuery.includes('emergency') || normalizedQuery.includes('urgent')) {
    intent = 'navigation.department';
    responseText = "The Emergency department is on the 1st floor, Room 101-120. Emergency care is available 24/7.";
    confidence = 0.8;
  } else if (normalizedQuery.includes('appointment') || normalizedQuery.includes('book')) {
    intent = 'appointment.book';
    responseText = "I can help you book an appointment. Which department would you like to visit?";
    confidence = 0.6;
  } else if (normalizedQuery.includes('direction') || normalizedQuery.includes('find') || normalizedQuery.includes('where')) {
    intent = 'navigation.general';
    responseText = "I can help you navigate the hospital. Which department or service are you looking for?";
    confidence = 0.5;
  }
  
  return {
    responseText,
    intent,
    entities: {},
    confidence,
    responseTime: 50,
    responseData: { type: 'fallback' },
    success: true
  };
}
