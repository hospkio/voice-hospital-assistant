
import { supabase } from '@/integrations/supabase/client';
import { BaseDataService } from './base/BaseDataService';

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

export class HospitalInfoService extends BaseDataService {
  private validateHospitalInfo(info: any): HospitalInfo {
    return {
      ...info,
      keywords: Array.isArray(info.keywords) ? info.keywords : []
    };
  }

  async getHospitalInfo(): Promise<HospitalInfo[]> {
    const info = await this.executeQuery(
      supabase
        .from('hospital_info')
        .select('*')
        .order('category'),
      'fetch hospital information'
    );

    return info.map(item => this.validateHospitalInfo(item));
  }

  async searchHospitalInfo(query: string): Promise<HospitalInfo[]> {
    try {
      const sanitizedQuery = this.validateInput(query);
      
      const info = await this.executeQuery(
        supabase
          .from('hospital_info')
          .select('*')
          .or(`question.ilike.%${sanitizedQuery}%,answer_english.ilike.%${sanitizedQuery}%,keywords.cs.["${sanitizedQuery}"]`),
        'search hospital information'
      );

      return info.map(item => this.validateHospitalInfo(item));
    } catch (error) {
      console.error('Service error in searchHospitalInfo:', error);
      return [];
    }
  }

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
}
