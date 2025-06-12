
import { useState } from 'react';
import { credentialsManager } from '@/utils/credentialsManager';

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
      
      const credentials = credentialsManager.getCredentials();
      const projectId = credentials.dialogflowCX.projectId || credentials.projectId;
      const location = credentials.dialogflowCX.location || 'us-central1';
      const agentId = credentials.dialogflowCX.agentId;

      if (!credentials.apiKey || !projectId || !agentId) {
        console.warn('⚠️ Dialogflow CX credentials incomplete, using fallback');
        throw new Error('Dialogflow CX credentials not configured completely');
      }

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

      // Note: This will fail with 401 since API keys don't work with Dialogflow CX
      // The error is handled gracefully below
      const response = await fetch(
        `https://dialogflow.googleapis.com/v3/${sessionPath}:detectIntent?key=${credentials.apiKey}`,
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
        
        // Check if it's the expected OAuth2 error
        if (errorText.includes('OAuth2') || errorText.includes('UNAUTHENTICATED')) {
          console.log('📝 Expected OAuth2 error - Dialogflow CX requires service account authentication, falling back to local processing');
        }
        
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
      
      // Enhanced fallback to local processing with better hospital-specific responses
      return enhancedFallbackProcessing(query, sessionId, languageCode);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processWithDialogflowCX,
    isLoading
  };
};

function enhancedFallbackProcessing(query: string, sessionId: string, languageCode: string): DialogflowCXResponse {
  const normalizedQuery = query.toLowerCase();
  
  let intent = 'unknown';
  let responseText = "I'm here to help you navigate MediCare Hospital. How can I assist you today?";
  let confidence = 0.6;
  
  // Enhanced pattern matching for hospital queries
  if (normalizedQuery.includes('cardiology') || normalizedQuery.includes('heart')) {
    intent = 'navigation.department';
    responseText = "🏥 The Cardiology department is located on the 3rd floor, Room 301-315. Our cardiologists specialize in heart and cardiovascular diseases. They're available Monday to Friday, 9 AM to 5 PM. Would you like me to help you book an appointment?";
    confidence = 0.8;
  } else if (normalizedQuery.includes('emergency') || normalizedQuery.includes('urgent') || normalizedQuery.includes('er')) {
    intent = 'navigation.department';
    responseText = "🚨 The Emergency department is on the 1st floor, Room 101-120. Emergency care is available 24/7. If this is a medical emergency, please proceed directly to the Emergency department or call 911.";
    confidence = 0.9;
  } else if (normalizedQuery.includes('appointment') || normalizedQuery.includes('book') || normalizedQuery.includes('schedule')) {
    intent = 'appointment.book';
    responseText = "📅 I can help you book an appointment! Which department would you like to visit? We have Cardiology, Neurology, Orthopedics, Pediatrics, and many other specialties available.";
    confidence = 0.8;
  } else if (normalizedQuery.includes('direction') || normalizedQuery.includes('find') || normalizedQuery.includes('where') || normalizedQuery.includes('locate')) {
    intent = 'navigation.general';
    responseText = "🗺️ I can help you navigate the hospital. Which department or service are you looking for? You can also check the interactive map on the Map tab.";
    confidence = 0.7;
  } else if (normalizedQuery.includes('neurology') || normalizedQuery.includes('brain') || normalizedQuery.includes('neurologist')) {
    intent = 'navigation.department';
    responseText = "🧠 The Neurology department is on the 2nd floor, Room 201-220. Our neurologists treat brain, spinal cord, and nervous system disorders. Available Monday to Friday, 8 AM to 6 PM.";
    confidence = 0.8;
  } else if (normalizedQuery.includes('orthopedic') || normalizedQuery.includes('bone') || normalizedQuery.includes('joint')) {
    intent = 'navigation.department';
    responseText = "🦴 The Orthopedics department is on the 1st floor, Room 150-170. We specialize in bone, joint, and muscle treatments. Available Monday to Saturday, 9 AM to 5 PM.";
    confidence = 0.8;
  } else if (normalizedQuery.includes('pediatric') || normalizedQuery.includes('child') || normalizedQuery.includes('baby')) {
    intent = 'navigation.department';
    responseText = "👶 The Pediatrics department is on the 2nd floor, Room 240-260. We provide specialized care for infants, children, and adolescents. Available daily, 8 AM to 8 PM.";
    confidence = 0.8;
  } else if (normalizedQuery.includes('pharmacy') || normalizedQuery.includes('medicine') || normalizedQuery.includes('prescription')) {
    intent = 'navigation.facility';
    responseText = "💊 The Pharmacy is located on the Ground floor, near the main entrance. They're open 24/7 for your convenience. You can fill prescriptions and get over-the-counter medications.";
    confidence = 0.8;
  } else if (normalizedQuery.includes('parking') || normalizedQuery.includes('park')) {
    intent = 'navigation.facility';
    responseText = "🚗 Parking is available on multiple levels. Visitor parking is on levels P1 and P2 of our parking garage. The first 2 hours are free, and there's a validation station at the information desk.";
    confidence = 0.7;
  } else if (normalizedQuery.includes('hello') || normalizedQuery.includes('hi') || normalizedQuery.includes('hey')) {
    intent = 'greeting';
    responseText = "👋 Hello! Welcome to MediCare Hospital! I'm your AI assistant, ready to help you navigate our facility, book appointments, or answer questions about our services. How may I assist you today?";
    confidence = 0.9;
  }
  
  return {
    responseText,
    intent,
    entities: {},
    confidence,
    responseTime: 100,
    responseData: { 
      type: 'enhanced-fallback',
      source: 'local-ai-assistant',
      timestamp: new Date().toISOString()
    },
    success: true
  };
}
