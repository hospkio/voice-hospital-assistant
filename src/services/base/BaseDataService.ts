
import { supabase } from '@/integrations/supabase/client';

export abstract class BaseDataService {
  // Enhanced input validation
  protected validateInput(input: string): string {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input provided');
    }
    // Basic sanitization - remove potential SQL injection attempts
    return input.replace(/['"\\;]/g, '').trim();
  }

  // Enhanced error handling for Supabase operations
  protected handleSupabaseError(error: any, operation: string): never {
    console.error(`Error in ${operation}:`, error);
    throw new Error(`Failed to ${operation}`);
  }

  // Generic method for safe Supabase queries
  protected async executeQuery<T>(
    queryBuilder: any,
    operation: string
  ): Promise<T[]> {
    try {
      const { data, error } = await queryBuilder;

      if (error) {
        console.error(`Error in ${operation}:`, error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Service error in ${operation}:`, error);
      throw new Error(`Failed to ${operation}`);
    }
  }
}
