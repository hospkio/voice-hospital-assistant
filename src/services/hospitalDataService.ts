
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
  async getDepartments(): Promise<Department[]> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching departments:', error);
      throw error;
    }

    return data || [];
  }

  async getDepartmentByName(name: string): Promise<Department | null> {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .ilike('name', `%${name}%`)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching department:', error);
      throw error;
    }

    return data;
  }

  async getDoctors(): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching doctors:', error);
      throw error;
    }

    // Type assertion and transformation to ensure proper types
    return (data || []).map(doctor => ({
      ...doctor,
      available_days: Array.isArray(doctor.available_days) ? doctor.available_days : [],
      available_times: Array.isArray(doctor.available_times) ? doctor.available_times : [],
      language_support: Array.isArray(doctor.language_support) ? doctor.language_support : []
    })) as Doctor[];
  }

  async getDoctorsByDepartment(departmentName: string): Promise<Doctor[]> {
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        departments!inner(name)
      `)
      .ilike('departments.name', `%${departmentName}%`);

    if (error) {
      console.error('Error fetching doctors by department:', error);
      throw error;
    }

    // Type assertion and transformation to ensure proper types
    return (data || []).map(doctor => ({
      ...doctor,
      available_days: Array.isArray(doctor.available_days) ? doctor.available_days : [],
      available_times: Array.isArray(doctor.available_times) ? doctor.available_times : [],
      language_support: Array.isArray(doctor.language_support) ? doctor.language_support : []
    })) as Doctor[];
  }

  async getHospitalInfo(): Promise<HospitalInfo[]> {
    const { data, error } = await supabase
      .from('hospital_info')
      .select('*')
      .order('category');

    if (error) {
      console.error('Error fetching hospital info:', error);
      throw error;
    }

    // Type assertion and transformation to ensure proper types
    return (data || []).map(info => ({
      ...info,
      keywords: Array.isArray(info.keywords) ? info.keywords : []
    })) as HospitalInfo[];
  }

  async searchHospitalInfo(query: string): Promise<HospitalInfo[]> {
    const { data, error } = await supabase
      .from('hospital_info')
      .select('*')
      .or(`question.ilike.%${query}%,answer_english.ilike.%${query}%,keywords.cs.["${query}"]`);

    if (error) {
      console.error('Error searching hospital info:', error);
      throw error;
    }

    // Type assertion and transformation to ensure proper types
    return (data || []).map(info => ({
      ...info,
      keywords: Array.isArray(info.keywords) ? info.keywords : []
    })) as HospitalInfo[];
  }

  async getMultilingualResponse(intentName: string): Promise<MultilingualResponse | null> {
    const { data, error } = await supabase
      .from('multilingual_responses')
      .select('*')
      .eq('intent_name', intentName)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching multilingual response:', error);
      throw error;
    }

    if (!data) return null;

    // Type assertion and transformation to ensure proper types
    return {
      ...data,
      parameters: typeof data.parameters === 'object' && data.parameters !== null ? data.parameters : {}
    } as MultilingualResponse;
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
    const { error } = await supabase
      .from('kiosk_interactions')
      .insert({
        session_id: interaction.sessionId,
        user_query: interaction.userQuery,
        language_detected: interaction.languageDetected,
        intent_recognized: interaction.intentRecognized,
        entities: interaction.entities,
        system_response: interaction.systemResponse,
        confidence_score: interaction.confidenceScore,
        response_time_ms: interaction.responseTimeMs
      });

    if (error) {
      console.error('Error logging kiosk interaction:', error);
      throw error;
    }
  }

  async createOrUpdateKioskSession(sessionId: string, languageCode: string) {
    const { error } = await supabase
      .from('kiosk_sessions')
      .upsert({
        session_id: sessionId,
        language_code: languageCode,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating kiosk session:', error);
      throw error;
    }
  }

  // Utility methods for response localization
  getLocalizedHospitalInfo(info: HospitalInfo, languageCode: string): string {
    switch (languageCode) {
      case 'ta-IN':
        return info.answer_tamil || info.answer_english;
      case 'ml-IN':
        return info.answer_malayalam || info.answer_english;
      default:
        return info.answer_english;
    }
  }

  formatTemplateResponse(template: MultilingualResponse, languageCode: string, params: Record<string, any>): string {
    let response: string;
    
    switch (languageCode) {
      case 'ta-IN':
        response = template.response_tamil || template.response_english;
        break;
      case 'ml-IN':
        response = template.response_malayalam || template.response_english;
        break;
      default:
        response = template.response_english;
    }

    // Replace template parameters
    Object.keys(params).forEach(key => {
      const placeholder = `{${key}}`;
      response = response.replace(new RegExp(placeholder, 'g'), params[key]);
    });

    return response;
  }
}

export const hospitalDataService = new HospitalDataService();
