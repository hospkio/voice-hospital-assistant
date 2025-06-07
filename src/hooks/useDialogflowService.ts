
import { useState } from 'react';

interface DialogflowResponse {
  responseText: string;
  intent: string;
  entities: any;
  confidence: number;
  responseTime: number;
  responseData: any;
  success: boolean;
}

export const useDialogflowService = () => {
  const [isLoading, setIsLoading] = useState(false);

  const processWithDialogflow = async (
    query: string, 
    sessionId: string, 
    languageCode: string = 'en-US'
  ): Promise<DialogflowResponse> => {
    setIsLoading(true);
    
    try {
      console.log('Sending to enhanced Dialogflow:', { query, sessionId, languageCode });
      
      const response = await fetch('/functions/v1/enhanced-dialogflow-process', {
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
      console.log('Enhanced Dialogflow response:', result);
      
      return result;
    } catch (error) {
      console.error('Error processing with enhanced Dialogflow:', error);
      
      // Fallback to local processing if the edge function fails
      return fallbackLocalProcessing(query, sessionId, languageCode);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processWithDialogflow,
    isLoading
  };
};

// Fallback local processing for when the edge function is unavailable
function fallbackLocalProcessing(query: string, sessionId: string, languageCode: string): DialogflowResponse {
  const normalizedQuery = query.toLowerCase();
  
  // Simple local intent classification
  let intent = 'unknown';
  let responseText = "I'm sorry, I'm having trouble connecting to our servers. Please try again.";
  let confidence = 0.3;
  
  if (normalizedQuery.includes('cardiology')) {
    intent = 'navigation.department';
    responseText = "The Cardiology department is located on the 3rd floor, Room 301-315. They specialize in heart and cardiovascular diseases treatment.";
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
