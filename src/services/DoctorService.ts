
import { supabase } from '@/integrations/supabase/client';
import { BaseDataService } from './base/BaseDataService';

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

export class DoctorService extends BaseDataService {
  private validateDoctorData(doctor: any): Doctor {
    return {
      ...doctor,
      available_days: Array.isArray(doctor.available_days) ? doctor.available_days : [],
      available_times: Array.isArray(doctor.available_times) ? doctor.available_times : [],
      language_support: Array.isArray(doctor.language_support) ? doctor.language_support : []
    };
  }

  async getDoctors(): Promise<Doctor[]> {
    const doctors = await this.executeQuery(
      supabase
        .from('doctors')
        .select('*')
        .order('name'),
      'fetch doctors'
    );

    return doctors.map(doctor => this.validateDoctorData(doctor));
  }

  async getDoctorsByDepartment(departmentName: string): Promise<Doctor[]> {
    try {
      const sanitizedName = this.validateInput(departmentName);
      
      const doctors = await this.executeQuery(
        supabase
          .from('doctors')
          .select(`
            *,
            departments!inner(name)
          `)
          .ilike('departments.name', `%${sanitizedName}%`),
        'fetch doctors by department'
      );

      return doctors.map(doctor => this.validateDoctorData(doctor));
    } catch (error) {
      console.error('Service error in getDoctorsByDepartment:', error);
      return [];
    }
  }
}
