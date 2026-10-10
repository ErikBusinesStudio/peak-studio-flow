export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          collected: number
          contact: string | null
          created_at: string
          hours: Json | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          status: string
          value: number | null
          zona: string | null
        }
        Insert: {
          collected?: number
          contact?: string | null
          created_at?: string
          hours?: Json | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          status: string
          value?: number | null
          zona?: string | null
        }
        Update: {
          collected?: number
          contact?: string | null
          created_at?: string
          hours?: Json | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string
          value?: number | null
          zona?: string | null
        }
        Relationships: []
      }
      costs: {
        Row: {
          amount: number
          category: string | null
          created_at: string
          date: string | null
          date_label: string | null
          description: string
          id: string
          recurring: boolean
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string
          date?: string | null
          date_label?: string | null
          description: string
          id?: string
          recurring?: boolean
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string
          date?: string | null
          date_label?: string | null
          description?: string
          id?: string
          recurring?: boolean
        }
        Relationships: []
      }
      diary_entries: {
        Row: {
          ai_analysis: string | null
          content: string
          created_at: string
          date: string
          id: string
          mood: number | null
        }
        Insert: {
          ai_analysis?: string | null
          content: string
          created_at?: string
          date?: string
          id?: string
          mood?: number | null
        }
        Update: {
          ai_analysis?: string | null
          content?: string
          created_at?: string
          date?: string
          id?: string
          mood?: number | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          date: string
          id: string
          notes: string | null
          time: string | null
          title: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          notes?: string | null
          time?: string | null
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          notes?: string | null
          time?: string | null
          title?: string
        }
        Relationships: []
      }
      incomes: {
        Row: {
          amount: number
          category: string | null
          client_id: string | null
          created_at: string
          date: string | null
          date_label: string | null
          description: string
          id: string
          status: string
        }
        Insert: {
          amount: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          date?: string | null
          date_label?: string | null
          description: string
          id?: string
          status?: string
        }
        Update: {
          amount?: number
          category?: string | null
          client_id?: string | null
          created_at?: string
          date?: string | null
          date_label?: string | null
          description?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "incomes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      managements: {
        Row: {
          active: boolean
          category: string
          client_id: string | null
          created_at: string
          id: string
          monthly_amount: number | null
          name: string
          notes: string | null
          start_date: string | null
        }
        Insert: {
          active?: boolean
          category?: string
          client_id?: string | null
          created_at?: string
          id?: string
          monthly_amount?: number | null
          name: string
          notes?: string | null
          start_date?: string | null
        }
        Update: {
          active?: boolean
          category?: string
          client_id?: string | null
          created_at?: string
          id?: string
          monthly_amount?: number | null
          name?: string
          notes?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "managements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          amount: number
          client_id: string | null
          color: string | null
          created_at: string
          due_date: string | null
          id: string
          name: string
          notes: string | null
          services_monthly: Json
          services_one_off: Json
          stage: string | null
        }
        Insert: {
          amount?: number
          client_id?: string | null
          color?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          name: string
          notes?: string | null
          services_monthly?: Json
          services_one_off?: Json
          stage?: string | null
        }
        Update: {
          amount?: number
          client_id?: string | null
          color?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          name?: string
          notes?: string | null
          services_monthly?: Json
          services_one_off?: Json
          stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      savings: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          note: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          date?: string
          id?: string
          note?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          note?: string | null
        }
        Relationships: []
      }
      savings_targets: {
        Row: {
          close_target: number | null
          label: string | null
          month: string
          save_target: number | null
        }
        Insert: {
          close_target?: number | null
          label?: string | null
          month: string
          save_target?: number | null
        }
        Update: {
          close_target?: number | null
          label?: string | null
          month?: string
          save_target?: number | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          dashboard_name: string
          id: number
          moto_split: number
          primary_color: string
          savings_deadline: string | null
          savings_goal: number
        }
        Insert: {
          dashboard_name?: string
          id?: number
          moto_split?: number
          primary_color?: string
          savings_deadline?: string | null
          savings_goal?: number
        }
        Update: {
          dashboard_name?: string
          id?: number
          moto_split?: number
          primary_color?: string
          savings_deadline?: string | null
          savings_goal?: number
        }
        Relationships: []
      }
      todos: {
        Row: {
          created_at: string
          date_note: string | null
          done: boolean
          id: string
          priority: string
          title: string
        }
        Insert: {
          created_at?: string
          date_note?: string | null
          done?: boolean
          id?: string
          priority?: string
          title: string
        }
        Update: {
          created_at?: string
          date_note?: string | null
          done?: boolean
          id?: string
          priority?: string
          title?: string
        }
        Relationships: []
      }
      updates: {
        Row: {
          category: string
          created_at: string
          date: string
          event: string
          id: string
        }
        Insert: {
          category?: string
          created_at?: string
          date: string
          event: string
          id?: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          event?: string
          id?: string
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
