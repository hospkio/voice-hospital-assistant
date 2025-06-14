
import { useState, useEffect } from 'react';
import { dialogflowAutomationService } from '@/services/DialogflowAutomationService';
import { dialogflowIntentMapper } from '@/services/DialogflowIntentMapper';

export const useDialogflowAutomation = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [trainingData, setTrainingData] = useState<{
    intents: any[];
    entities: any[];
    trainingPhrases: string[];
  } | null>(null);

  const processUserQuery = async (
    query: string,
    sessionId: string,
    languageCode: string = 'en-US'
  ) => {
    console.log('🎯 Processing user query with automation:', { query, sessionId, languageCode });
    
    try {
      // Simple intent classification (you can enhance this with ML later)
      const intent = classifyIntent(query);
      const entities = extractEntities(query);
      
      console.log('🔍 Classified:', { intent, entities });
      
      // Process with automation service
      const result = await dialogflowAutomationService.processDialogflowRequest(
        intent,
        entities,
        languageCode
      );
      
      return {
        ...result,
        intent,
        entities,
        success: true
      };
    } catch (error) {
      console.error('❌ Automation processing error:', error);
      return {
        responseText: 'I apologize, but I am having trouble processing your request right now.',
        responseData: { error: error.message },
        confidence: 0.1,
        intent: 'unknown',
        entities: {},
        success: false
      };
    }
  };

  const generateTrainingData = async () => {
    setIsGenerating(true);
    try {
      const data = await dialogflowAutomationService.generateTrainingData();
      setTrainingData(data);
      setLastGenerated(new Date());
      console.log('✅ Training data generated:', data);
      return data;
    } catch (error) {
      console.error('❌ Error generating training data:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const exportDialogflowConfig = async () => {
    const data = await generateTrainingData();
    
    const config = {
      projectInfo: {
        name: 'Hospital Kiosk Assistant',
        description: 'AI assistant for hospital navigation and appointments',
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'ta', 'ml']
      },
      intents: data.intents,
      entities: data.entities,
      generatedAt: new Date().toISOString(),
      totalIntents: data.intents.length,
      totalEntities: data.entities.length,
      totalTrainingPhrases: data.trainingPhrases.length
    };
    
    // Create downloadable JSON
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dialogflow-hospital-config-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return config;
  };

  return {
    processUserQuery,
    generateTrainingData,
    exportDialogflowConfig,
    isGenerating,
    lastGenerated,
    trainingData
  };
};

// Simple intent classification (can be enhanced with ML)
function classifyIntent(query: string): string {
  const normalizedQuery = query.toLowerCase();
  
  // Department navigation patterns
  if (/where\s+is|location\s+of|find\s+the|directions?\s+to|how\s+to\s+get\s+to/.test(normalizedQuery)) {
    return 'navigation.department';
  }
  
  // Appointment patterns
  if (/book\s+appointment|schedule|appointment|doctor\s+available/.test(normalizedQuery)) {
    return 'appointment.book';
  }
  
  // Emergency patterns
  if (/emergency|urgent|help\s+me|critical|serious/.test(normalizedQuery)) {
    return 'emergency';
  }
  
  // Hospital info patterns
  if (/visiting\s+hours|wifi|canteen|food|wheelchair|payment|insurance|documents|bus|transport/.test(normalizedQuery)) {
    return 'hospital.info';
  }
  
  // Greeting patterns
  if (/hello|hi|hey|good\s+(morning|afternoon|evening)|help/.test(normalizedQuery)) {
    return 'greeting';
  }
  
  return 'unknown';
}

// Simple entity extraction (can be enhanced with NER)
function extractEntities(query: string): Record<string, any> {
  const entities: Record<string, any> = {};
  const normalizedQuery = query.toLowerCase();
  
  // Extract department names
  const departments = [
    'cardiology', 'emergency', 'radiology', 'pharmacy', 'laboratory', 'pediatrics',
    'orthopedics', 'neurology', 'gynecology', 'ophthalmology', 'ent', 'dermatology',
    'psychiatry', 'dialysis', 'icu', 'surgery', 'physiotherapy', 'blood bank'
  ];
  
  for (const dept of departments) {
    if (normalizedQuery.includes(dept)) {
      entities.department = dept;
      break;
    }
  }
  
  // Extract time expressions
  const timeMatch = normalizedQuery.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i);
  if (timeMatch) {
    entities.time = timeMatch[0];
  }
  
  // Extract date expressions
  const dateMatch = normalizedQuery.match(/(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
  if (dateMatch) {
    entities.day = dateMatch[0].toLowerCase();
  }
  
  // Extract doctor names (simple pattern)
  const doctorMatch = normalizedQuery.match(/dr\.?\s+([a-zA-Z]+)|doctor\s+([a-zA-Z]+)/i);
  if (doctorMatch) {
    entities.doctor = doctorMatch[1] || doctorMatch[2];
  }
  
  return entities;
}
