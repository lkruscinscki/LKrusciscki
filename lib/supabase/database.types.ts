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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      books: {
        Row: {
          author: string | null
          created_at: string
          id: string
          status: Database["public"]["Enums"]["book_status"]
          title: string
          total_pages: number
          user_id: string
        }
        Insert: {
          author?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["book_status"]
          title: string
          total_pages: number
          user_id?: string
        }
        Update: {
          author?: string | null
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["book_status"]
          title?: string
          total_pages?: number
          user_id?: string
        }
        Relationships: []
      }
      chess_sessions: {
        Row: {
          created_at: string
          game_date: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_date: string
          id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          game_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          related_reward_id: string | null
          related_week_start: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          related_reward_id?: string | null
          related_week_start?: string | null
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          related_reward_id?: string | null
          related_week_start?: string | null
          user_id?: string
        }
        Relationships: []
      }
      competition_matches: {
        Row: {
          competition_id: string
          created_at: string
          id: string
          match_order: number
          method: Database["public"]["Enums"]["match_method"]
          notes: string | null
          result: Database["public"]["Enums"]["match_result"]
          score: string | null
          user_id: string
        }
        Insert: {
          competition_id: string
          created_at?: string
          id?: string
          match_order?: number
          method: Database["public"]["Enums"]["match_method"]
          notes?: string | null
          result: Database["public"]["Enums"]["match_result"]
          score?: string | null
          user_id?: string
        }
        Update: {
          competition_id?: string
          created_at?: string
          id?: string
          match_order?: number
          method?: Database["public"]["Enums"]["match_method"]
          notes?: string | null
          result?: Database["public"]["Enums"]["match_result"]
          score?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competition_matches_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "competitions"
            referencedColumns: ["id"]
          },
        ]
      }
      competitions: {
        Row: {
          category: string | null
          created_at: string
          date: string
          event_name: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          date: string
          event_name: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          date?: string
          event_name?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      creative_blocks: {
        Row: {
          activity: string
          created_at: string
          date: string
          duration_minutes: number
          id: string
          user_id: string
        }
        Insert: {
          activity: string
          created_at?: string
          date: string
          duration_minutes: number
          id?: string
          user_id?: string
        }
        Update: {
          activity?: string
          created_at?: string
          date?: string
          duration_minutes?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      cross_training_sessions: {
        Row: {
          created_at: string
          date: string
          discipline: string
          duration_minutes: number
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          discipline: string
          duration_minutes: number
          id?: string
          notes?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          date?: string
          discipline?: string
          duration_minutes?: number
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          created_at: string
          date: string
          id: string
          name: string
          subject_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          name: string
          subject_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          name?: string
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_progress_logs: {
        Row: {
          created_at: string
          exercises_added: number
          game_date: string
          guide_id: string
          id: string
          subject_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercises_added: number
          game_date: string
          guide_id: string
          id?: string
          subject_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          exercises_added?: number
          game_date?: string
          guide_id?: string
          id?: string
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_progress_logs_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_progress_logs_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      guides: {
        Row: {
          completed_at: string | null
          completed_exercises: number
          created_at: string
          id: string
          name: string
          subject_id: string
          target_date: string | null
          total_exercises: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_exercises?: number
          created_at?: string
          id?: string
          name: string
          subject_id: string
          target_date?: string | null
          total_exercises: number
          user_id?: string
        }
        Update: {
          completed_at?: string | null
          completed_exercises?: number
          created_at?: string
          id?: string
          name?: string
          subject_id?: string
          target_date?: string | null
          total_exercises?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guides_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      jiujitsu_sessions: {
        Row: {
          created_at: string
          date: string
          duration_minutes: number
          id: string
          new_techniques: string | null
          notes: string | null
          sparring_rounds: number
          submissions_achieved: number
          submissions_received: number
          type: Database["public"]["Enums"]["jiujitsu_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          duration_minutes: number
          id?: string
          new_techniques?: string | null
          notes?: string | null
          sparring_rounds?: number
          submissions_achieved?: number
          submissions_received?: number
          type: Database["public"]["Enums"]["jiujitsu_type"]
          user_id?: string
        }
        Update: {
          created_at?: string
          date?: string
          duration_minutes?: number
          id?: string
          new_techniques?: string | null
          notes?: string | null
          sparring_rounds?: number
          submissions_achieved?: number
          submissions_received?: number
          type?: Database["public"]["Enums"]["jiujitsu_type"]
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string | null
          created_at: string
          game_date: string
          id: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          game_date: string
          id?: string
          user_id?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          game_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      meditation_logs: {
        Row: {
          created_at: string
          duration_minutes: number | null
          game_date: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          game_date: string
          id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          game_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      project_logs: {
        Row: {
          created_at: string
          date: string
          hours: number | null
          id: string
          notes: string
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          hours?: number | null
          id?: string
          notes: string
          project_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          date?: string
          hours?: number | null
          id?: string
          notes?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["project_status"]
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["project_status"]
          user_id?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["project_status"]
          user_id?: string
        }
        Relationships: []
      }
      quarters: {
        Row: {
          created_at: string
          end_date: string
          id: string
          name: string
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          name: string
          start_date: string
          user_id?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          name?: string
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      reading_logs: {
        Row: {
          book_id: string
          created_at: string
          game_date: string
          id: string
          pages_read: number
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          game_date: string
          id?: string
          pages_read: number
          user_id?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          game_date?: string
          id?: string
          pages_read?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_logs_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      reward_redemptions: {
        Row: {
          cost_coins: number
          id: string
          redeemed_at: string
          reward_id: string
          user_id: string
        }
        Insert: {
          cost_coins: number
          id?: string
          redeemed_at?: string
          reward_id: string
          user_id?: string
        }
        Update: {
          cost_coins?: number
          id?: string
          redeemed_at?: string
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          archived: boolean
          cost_coins: number
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          archived?: boolean
          cost_coins: number
          created_at?: string
          id?: string
          name: string
          user_id?: string
        }
        Update: {
          archived?: boolean
          cost_coins?: number
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      sleep_logs: {
        Row: {
          created_at: string
          game_date: string
          hours: number
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_date: string
          hours: number
          id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          game_date?: string
          hours?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          created_at: string
          date: string
          duration_minutes: number
          guide_id: string | null
          id: string
          notes: string | null
          subject_id: string
          topic: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          duration_minutes: number
          guide_id?: string | null
          id?: string
          notes?: string | null
          subject_id: string
          topic?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          date?: string
          duration_minutes?: number
          guide_id?: string | null
          id?: string
          notes?: string | null
          subject_id?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          quarter_id: string
          user_id: string
          weekly_exercise_goal: number
        }
        Insert: {
          color: string
          created_at?: string
          id?: string
          name: string
          quarter_id: string
          user_id?: string
          weekly_exercise_goal?: number
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          quarter_id?: string
          user_id?: string
          weekly_exercise_goal?: number
        }
        Relationships: [
          {
            foreignKeyName: "subjects_quarter_id_fkey"
            columns: ["quarter_id"]
            isOneToOne: false
            referencedRelation: "quarters"
            referencedColumns: ["id"]
          },
        ]
      }
      todos: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          for_date: string
          id: string
          text: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          for_date: string
          id?: string
          text: string
          user_id?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          for_date?: string
          id?: string
          text?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          day_cutoff_hour: number
          user_id: string
        }
        Insert: {
          created_at?: string
          day_cutoff_hour?: number
          user_id: string
        }
        Update: {
          created_at?: string
          day_cutoff_hour?: number
          user_id?: string
        }
        Relationships: []
      }
      water_intake_logs: {
        Row: {
          bottles_count: number
          created_at: string
          game_date: string
          id: string
          user_id: string
        }
        Insert: {
          bottles_count?: number
          created_at?: string
          game_date: string
          id?: string
          user_id?: string
        }
        Update: {
          bottles_count?: number
          created_at?: string
          game_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_mission_evaluations: {
        Row: {
          coins_awarded: number
          completed: boolean
          evaluated_at: string
          id: string
          mission_key: string
          user_id: string
          week_start: string
        }
        Insert: {
          coins_awarded?: number
          completed: boolean
          evaluated_at?: string
          id?: string
          mission_key: string
          user_id?: string
          week_start: string
        }
        Update: {
          coins_awarded?: number
          completed?: boolean
          evaluated_at?: string
          id?: string
          mission_key?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          base_xp: number
          created_at: string
          final_xp: number
          game_date: string
          id: string
          pillar: Database["public"]["Enums"]["pillar"]
          source_id: string | null
          source_type: string
          streak_multiplier: number
          user_id: string
        }
        Insert: {
          base_xp: number
          created_at?: string
          final_xp: number
          game_date: string
          id?: string
          pillar: Database["public"]["Enums"]["pillar"]
          source_id?: string | null
          source_type: string
          streak_multiplier?: number
          user_id?: string
        }
        Update: {
          base_xp?: number
          created_at?: string
          final_xp?: number
          game_date?: string
          id?: string
          pillar?: Database["public"]["Enums"]["pillar"]
          source_id?: string | null
          source_type?: string
          streak_multiplier?: number
          user_id?: string
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
      book_status: "reading" | "finished" | "abandoned"
      jiujitsu_type: "gi" | "no_gi" | "open_mat"
      match_method: "submission" | "points" | "decision" | "dq" | "other"
      match_result: "win" | "loss" | "draw"
      pillar: "academico" | "deportivo" | "profesional" | "personal"
      project_status: "active" | "paused" | "finished"
      streak_type: "meditation" | "journaling" | "reading" | "global"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      book_status: ["reading", "finished", "abandoned"],
      jiujitsu_type: ["gi", "no_gi", "open_mat"],
      match_method: ["submission", "points", "decision", "dq", "other"],
      match_result: ["win", "loss", "draw"],
      pillar: ["academico", "deportivo", "profesional", "personal"],
      project_status: ["active", "paused", "finished"],
      streak_type: ["meditation", "journaling", "reading", "global"],
    },
  },
} as const
