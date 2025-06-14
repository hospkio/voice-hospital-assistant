
import { supabase } from '@/integrations/supabase/client';
import { BaseDataService } from './base/BaseDataService';

export class LoggingService extends BaseDataService {
  async logKioskInteraction(interaction: {
    sessionId: string;
    userQuery: string;
    languageDetected: string;
    intentRecognized: string;
    entities: any;
    systemResponse: string;
    confidenceScore: number;
    responseTimeMs: number;
  }) {
    try {
      // Enhanced input validation
      const sanitizedInteraction = {
        session_id: this.validateInput(interaction.sessionId),
        user_query: this.validateInput(interaction.userQuery),
        language_detected: this.validateInput(interaction.languageDetected),
        intent_recognized: this.validateInput(interaction.intentRecognized),
        entities: interaction.entities,
        system_response: this.validateInput(interaction.systemResponse),
        confidence_score: Math.max(0, Math.min(1, interaction.confidenceScore)), // Clamp between 0-1
        response_time_ms: Math.max(0, interaction.responseTimeMs) // Ensure positive
      };

      const { error } = await supabase
        .from('kiosk_interactions')
        .insert(sanitizedInteraction);

      if (error) {
        console.error('Error logging kiosk interaction:', error);
        throw error;
      }
    } catch (error) {
      console.error('Service error in logKioskInteraction:', error);
      // Don't throw here to prevent breaking user experience
    }
  }

  async createOrUpdateKioskSession(sessionId: string, languageCode: string) {
    try {
      const sanitizedSessionId = this.validateInput(sessionId);
      const sanitizedLanguageCode = this.validateInput(languageCode);
      
      const { error } = await supabase
        .from('kiosk_sessions')
        .upsert({
          session_id: sanitizedSessionId,
          language_code: sanitizedLanguageCode,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error updating kiosk session:', error);
        throw error;
      }
    } catch (error) {
      console.error('Service error in createOrUpdateKioskSession:', error);
      // Don't throw here to prevent breaking user experience
    }
  }
}
