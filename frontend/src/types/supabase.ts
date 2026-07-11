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
      FoodItems: {
        Row: {
          added_by: string | null
          calories: number
          carbs: number
          created_at: string
          fat: number
          fibre: number
          id: number
          name: string
          protein: number
          region: string
        }
        Insert: {
          added_by?: string | null
          calories: number
          carbs: number
          created_at?: string
          fat: number
          fibre: number
          id?: number
          name: string
          protein: number
          region?: string
        }
        Update: {
          added_by?: string | null
          calories?: number
          carbs?: number
          created_at?: string
          fat?: number
          fibre?: number
          id?: number
          name?: string
          protein?: number
          region?: string
        }
        Relationships: []
      }
      MealItems: {
        Row: {
          amount: number
          foodID: number
          mealID: number
          userID: string
        }
        Insert: {
          amount: number
          foodID: number
          mealID: number
          userID: string
        }
        Update: {
          amount?: number
          foodID?: number
          mealID?: number
          userID?: string
        }
        Relationships: [
          {
            foreignKeyName: "mealItems_foodID_fkey"
            columns: ["foodID"]
            isOneToOne: false
            referencedRelation: "FoodItems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mealItems_mealID_fkey"
            columns: ["mealID"]
            isOneToOne: false
            referencedRelation: "Meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MealItems_userID_fkey"
            columns: ["userID"]
            isOneToOne: false
            referencedRelation: "UserProfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      MealPlanItems: {
        Row: {
          meal_completed: boolean
          mealID: number
          planID: number
        }
        Insert: {
          meal_completed?: boolean
          mealID: number
          planID: number
        }
        Update: {
          meal_completed?: boolean
          mealID?: number
          planID?: number
        }
        Relationships: [
          {
            foreignKeyName: "DailyMealItems_dmID_fkey"
            columns: ["planID"]
            isOneToOne: false
            referencedRelation: "MealPlans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "DailyMealItems_mealID_fkey"
            columns: ["mealID"]
            isOneToOne: false
            referencedRelation: "Meals"
            referencedColumns: ["id"]
          },
        ]
      }
      MealPlans: {
        Row: {
          id: number
          name: string
          total_calories: number
          total_carbs: number
          total_fats: number
          total_fibre: number
          total_protein: number
          userID: string
        }
        Insert: {
          id?: number
          name: string
          total_calories: number
          total_carbs: number
          total_fats: number
          total_fibre: number
          total_protein: number
          userID: string
        }
        Update: {
          id?: number
          name?: string
          total_calories?: number
          total_carbs?: number
          total_fats?: number
          total_fibre?: number
          total_protein?: number
          userID?: string
        }
        Relationships: [
          {
            foreignKeyName: "MealPlans_userID_fkey"
            columns: ["userID"]
            isOneToOne: false
            referencedRelation: "UserProfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      Meals: {
        Row: {
          id: number
          name: string
          total_calories: number
          total_carbs: number
          total_fats: number
          total_fibre: number
          total_protein: number
          userID: string
        }
        Insert: {
          id?: number
          name: string
          total_calories: number
          total_carbs: number
          total_fats: number
          total_fibre: number
          total_protein: number
          userID: string
        }
        Update: {
          id?: number
          name?: string
          total_calories?: number
          total_carbs?: number
          total_fats?: number
          total_fibre?: number
          total_protein?: number
          userID?: string
        }
        Relationships: [
          {
            foreignKeyName: "Meals_userID_fkey"
            columns: ["userID"]
            isOneToOne: false
            referencedRelation: "UserProfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      RecommendedPlans: {
        Row: {
          constraint_snapshot: Json | null
          created_at: string
          id: number
          name: string
          plan_data: Json
          userID: string
        }
        Insert: {
          constraint_snapshot?: Json | null
          created_at?: string
          id?: number
          name: string
          plan_data: Json
          userID: string
        }
        Update: {
          constraint_snapshot?: Json | null
          created_at?: string
          id?: number
          name?: string
          plan_data?: Json
          userID?: string
        }
        Relationships: [
          {
            foreignKeyName: "RecommendedPlan_userID_fkey"
            columns: ["userID"]
            isOneToOne: false
            referencedRelation: "UserProfiles"
            referencedColumns: ["id"]
          },
        ]
      }
      UserProfiles: {
        Row: {
          active_meal_plan_id: number | null
          activity_level: string
          age: number
          dietary_restrictions: string[] | null
          fitness_goals: string
          health_conditions: string[] | null
          height: number
          id: string
          name: string
          region: string
          required_food_items: string[] | null
          sex: string
          weight: number
        }
        Insert: {
          active_meal_plan_id?: number | null
          activity_level: string
          age: number
          dietary_restrictions?: string[] | null
          fitness_goals: string
          health_conditions?: string[] | null
          height: number
          id: string
          name: string
          region: string
          required_food_items?: string[] | null
          sex: string
          weight: number
        }
        Update: {
          active_meal_plan_id?: number | null
          activity_level?: string
          age?: number
          dietary_restrictions?: string[] | null
          fitness_goals?: string
          health_conditions?: string[] | null
          height?: number
          id?: string
          name?: string
          region?: string
          required_food_items?: string[] | null
          sex?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "UserProfiles_active_meal_plan_id_fkey"
            columns: ["active_meal_plan_id"]
            isOneToOne: false
            referencedRelation: "MealPlans"
            referencedColumns: ["id"]
          },
        ]
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
  public: {
    Enums: {},
  },
} as const
