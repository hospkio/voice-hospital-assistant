
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
      console.log('Sending to Dialogflow CX:', { query, sessionId, languageCode });
      
      const response = await fetch('/functions/v1/dialogflow-cx-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          sessionId,
          languageCode
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Dialogflow CX response:', result);
      
      return result;
    } catch (error) {
      console.error('Error processing with Dialogflow CX:', error);
      
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
  let responseText = "I'm sorry, I'm having trouble connecting to our services. Please try again.";
  let confidence = 0.3;
  
  if (normalizedQuery.includes('cardiology')) {
    intent = 'navigation.department';
    responseText = "The Cardiology department is located on the 3rd floor, Room 301-315. Let me show you the way on the floor map.";
    confidence = 0.7;
  } else if (normalizedQuery.includes('emergency')) {
    intent = 'navigation.department';
    responseText = "The Emergency department is on the 1st floor, Room 101-120. Emergency care is available 24/7.";
    confidence = 0.8;
  } else if (normalizedQuery.includes('appointment')) {
    intent = 'appointment.book';
    responseText = "I can help you book an appointment. Which department would you like to visit?";
    confidence = 0.6;
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
