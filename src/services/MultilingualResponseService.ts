
import { supabase } from '@/integrations/supabase/client';
import { BaseDataService } from './base/BaseDataService';

export interface MultilingualResponse {
  id: string;
  intent_name: string;
  response_english: string;
  response_tamil: string;
  response_malayalam: string;
  parameters: Record<string, any>;
  created_at: string;
}

export class MultilingualResponseService extends BaseDataService {
  async getMultilingualResponse(intentName: string): Promise<MultilingualResponse | null> {
    try {
      const sanitizedIntentName = this.validateInput(intentName);
      
      const { data, error } = await supabase
        .from('multilingual_responses')
        .select('*')
        .eq('intent_name', sanitizedIntentName)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching multilingual response:', error);
        throw error;
      }

      if (!data) return null;

      return {
        ...data,
        parameters: typeof data.parameters === 'object' && data.parameters !== null ? data.parameters : {}
      };
    } catch (error) {
      console.error('Service error in getMultilingualResponse:', error);
      return null;
    }
  }

  formatTemplateResponse(template: MultilingualResponse, languageCode: string, params: Record<string, any>): string {
    const sanitizedLanguageCode = languageCode?.toLowerCase() || 'en-us';
    let response: string;
    
    switch (sanitizedLanguageCode) {
      case 'ta-in':
      case 'ta':
        response = template.response_tamil || template.response_english;
        break;
      case 'ml-in':
      case 'ml':
        response = template.response_malayalam || template.response_english;
        break;
      default:
        response = template.response_english;
    }

    // Enhanced parameter replacement with security considerations
    Object.keys(params).forEach(key => {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, ''); // Only allow alphanumeric and underscore
      const sanitizedValue = String(params[key]).replace(/[<>]/g, ''); // Basic XSS prevention
      const placeholder = `{${sanitizedKey}}`;
      response = response.replace(new RegExp(placeholder, 'g'), sanitizedValue);
    });

    return response;
  }
}
