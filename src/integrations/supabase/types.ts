export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_time: string | null
          created_at: string | null
          doctor_id: string | null
          id: string
          patient_name: string | null
          patient_phone: string | null
          status: string | null
        }
        Insert: {
          appointment_time?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          patient_name?: string | null
          patient_phone?: string | null
          status?: string | null
        }
        Update: {
          appointment_time?: string | null
          created_at?: string | null
          doctor_id?: string | null
          id?: string
          patient_name?: string | null
          patient_phone?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          floor: number
          id: string
          name: string
          room_number: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          floor: number
          id?: string
          name: string
          room_number?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          floor?: number
          id?: string
          name?: string
          room_number?: string | null
        }
        Relationships: []
      }
      doctors: {
        Row: {
          available_days: Json | null
          available_slots: Json | null
          available_times: Json | null
          consultation_fee: number | null
          created_at: string | null
          department_id: string | null
          experience_years: number | null
          id: string
          language_support: Json | null
          name: string
          specialization: string | null
        }
        Insert: {
          available_days?: Json | null
          available_slots?: Json | null
          available_times?: Json | null
          consultation_fee?: number | null
          created_at?: string | null
          department_id?: string | null
          experience_years?: number | null
          id?: string
          language_support?: Json | null
          name: string
          specialization?: string | null
        }
        Update: {
          available_days?: Json | null
          available_slots?: Json | null
          available_times?: Json | null
          consultation_fee?: number | null
          created_at?: string | null
          department_id?: string | null
          experience_years?: number | null
          id?: string
          language_support?: Json | null
          name?: string
          specialization?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      hospital_info: {
        Row: {
          answer_english: string
          answer_malayalam: string | null
          answer_tamil: string | null
          category: string
          created_at: string | null
          id: string
          keywords: Json | null
          question: string
        }
        Insert: {
          answer_english: string
          answer_malayalam?: string | null
          answer_tamil?: string | null
          category: string
          created_at?: string | null
          id?: string
          keywords?: Json | null
          question: string
        }
        Update: {
          answer_english?: string
          answer_malayalam?: string | null
          answer_tamil?: string | null
          category?: string
          created_at?: string | null
          id?: string
          keywords?: Json | null
          question?: string
        }
        Relationships: []
      }
      kiosk_interactions: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          entities: Json | null
          id: string
          intent_recognized: string | null
          language_detected: string | null
          response_time_ms: number | null
          session_id: string | null
          system_response: string | null
          user_query: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          entities?: Json | null
          id?: string
          intent_recognized?: string | null
          language_detected?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          system_response?: string | null
          user_query?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          entities?: Json | null
          id?: string
          intent_recognized?: string | null
          language_detected?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          system_response?: string | null
          user_query?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kiosk_interactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "kiosk_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      kiosk_sessions: {
        Row: {
          created_at: string | null
          id: string
          language_code: string | null
          session_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          language_code?: string | null
          session_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          language_code?: string | null
          session_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      multilingual_responses: {
        Row: {
          created_at: string | null
          id: string
          intent_name: string
          parameters: Json | null
          response_english: string
          response_malayalam: string | null
          response_tamil: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          intent_name: string
          parameters?: Json | null
          response_english: string
          response_malayalam?: string | null
          response_tamil?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          intent_name?: string
          parameters?: Json | null
          response_english?: string
          response_malayalam?: string | null
          response_tamil?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
