
import { supabase } from '@/integrations/supabase/client';
import { BaseDataService } from './base/BaseDataService';

export interface Department {
  id: string;
  name: string;
  floor: number;
  room_number: string;
  description: string;
  created_at: string;
}

export class DepartmentService extends BaseDataService {
  async getDepartments(): Promise<Department[]> {
    return this.executeQuery(
      supabase
        .from('departments')
        .select('*')
        .order('name'),
      'fetch departments'
    );
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
}
