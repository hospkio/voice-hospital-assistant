
import { supabase } from '@/integrations/supabase/client';

export interface Department {
  id: string;
  name: string;
  floor: number;
  room_number: string;
  description: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  department_id: string;
  consultation_fee: number;
  experience_years: number;
  available_days: string[];
  available_times: string[];
  language_support: string[];
  created_at: string;
}

export interface HospitalInfo {
  id: string;
  category: string;
  question: string;
  answer_english: string;
  answer_tamil: string;
  answer_malayalam: string;
  keywords: string[];
  created_at: string;
}

export interface MultilingualResponse {
  id: string;
  intent_name: string;
  response_english: string;
  response_tamil: string;
  response_malayalam: string;
  parameters: Record<string, any>;
  created_at: string;
}

class HospitalDataService {
  // Enhanced input validation
  private validateInput(input: string): string {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input provided');
    }
    // Basic sanitization - remove potential SQL injection attempts
    return input.replace(/['"\\;]/g, '').trim();
  }

  async getDepartments(): Promise<Department[]> {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching departments:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Service error in getDepartments:', error);
      throw new Error('Failed to fetch departments');
    }
  }

  async getDepartmentByName(name: string): Promise<Department | null> {
    try {
      const sanitizedName = this.validateInput(name);
      
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .ilike('name', `%${sanitizedName}%`)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching department:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Service error in getDepartmentByName:', error);
      return null;
    }
  }

  async getDoctors(): Promise<Doctor[]> {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching doctors:', error);
        throw error;
      }

      // Enhanced type safety and validation
      return (data || []).map(doctor => ({
        ...doctor,
        available_days: Array.isArray(doctor.available_days) ? doctor.available_days : [],
        available_times: Array.isArray(doctor.available_times) ? doctor.available_times : [],
        language_support: Array.isArray(doctor.language_support) ? doctor.language_support : []
      })) as Doctor[];
    } catch (error) {
      console.error('Service error in getDoctors:', error);
      throw new Error('Failed to fetch doctors');
    }
  }

  async getDoctorsByDepartment(departmentName: string): Promise<Doctor[]> {
    try {
      const sanitizedName = this.validateInput(departmentName);
      
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          *,
          departments!inner(name)
        `)
        .ilike('departments.name', `%${sanitizedName}%`);

      if (error) {
        console.error('Error fetching doctors by department:', error);
        throw error;
      }

      // Enhanced type safety and validation
      return (data || []).map(doctor => ({
        ...doctor,
        available_days: Array.isArray(doctor.available_days) ? doctor.available_days : [],
        available_times: Array.isArray(doctor.available_times) ? doctor.available_times : [],
        language_support: Array.isArray(doctor.language_support) ? doctor.language_support : []
      })) as Doctor[];
    } catch (error) {
      console.error('Service error in getDoctorsByDepartment:', error);
      return [];
    }
  }

  async getHospitalInfo(): Promise<HospitalInfo[]> {
    try {
      const { data, error } = await supabase
        .from('hospital_info')
        .select('*')
        .order('category');

      if (error) {
        console.error('Error fetching hospital info:', error);
        throw error;
      }

      // Enhanced type safety and validation
      return (data || []).map(info => ({
        ...info,
        keywords: Array.isArray(info.keywords) ? info.keywords : []
      })) as HospitalInfo[];
    } catch (error) {
      console.error('Service error in getHospitalInfo:', error);
      throw new Error('Failed to fetch hospital information');
    }
  }

  async searchHospitalInfo(query: string): Promise<HospitalInfo[]> {
    try {
      const sanitizedQuery = this.validateInput(query);
      
      const { data, error } = await supabase
        .from('hospital_info')
        .select('*')
        .or(`question.ilike.%${sanitizedQuery}%,answer_english.ilike.%${sanitizedQuery}%,keywords.cs.["${sanitizedQuery}"]`);

      if (error) {
        console.error('Error searching hospital info:', error);
        throw error;
      }

      // Enhanced type safety and validation
      return (data || []).map(info => ({
        ...info,
        keywords: Array.isArray(info.keywords) ? info.keywords : []
      })) as HospitalInfo[];
    } catch (error) {
      console.error('Service error in searchHospitalInfo:', error);
      return [];
    }
  }

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

      // Enhanced type safety and validation
      return {
        ...data,
        parameters: typeof data.parameters === 'object' && data.parameters !== null ? data.parameters : {}
      } as MultilingualResponse;
    } catch (error) {
      console.error('Service error in getMultilingualResponse:', error);
      return null;
    }
  }

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

  // Enhanced utility methods with better security
  getLocalizedHospitalInfo(info: HospitalInfo, languageCode: string): string {
    const sanitizedLanguageCode = languageCode?.toLowerCase() || 'en-us';
    
    switch (sanitizedLanguageCode) {
      case 'ta-in':
      case 'ta':
        return info.answer_tamil || info.answer_english;
      case 'ml-in':
      case 'ml':
        return info.answer_malayalam || info.answer_english;
      default:
        return info.answer_english;
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

export const hospitalDataService = new HospitalDataService();
