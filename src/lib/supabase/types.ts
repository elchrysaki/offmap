export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.15';
  };
  public: {
    Tables: {
      academic_level: {
        Row: {
          id: string;
          label_el: string;
          label_en: string;
          sort_order: number;
        };
        Insert: {
          id: string;
          label_el: string;
          label_en: string;
          sort_order: number;
        };
        Update: {
          id?: string;
          label_el?: string;
          label_en?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      audience_group: {
        Row: {
          id: string;
          label_el: string;
          label_en: string;
          sort_order: number;
        };
        Insert: {
          id: string;
          label_el: string;
          label_en: string;
          sort_order: number;
        };
        Update: {
          id?: string;
          label_el?: string;
          label_en?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      field: {
        Row: {
          id: string;
          label_el: string;
          label_en: string;
          sort_order: number;
        };
        Insert: {
          id: string;
          label_el: string;
          label_en: string;
          sort_order: number;
        };
        Update: {
          id?: string;
          label_el?: string;
          label_en?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      funding_feature: {
        Row: {
          id: string;
          label_el: string;
          label_en: string;
          sort_order: number;
        };
        Insert: {
          id: string;
          label_el: string;
          label_en: string;
          sort_order: number;
        };
        Update: {
          id?: string;
          label_el?: string;
          label_en?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      geo_scope: {
        Row: {
          id: string;
          label_el: string;
          label_en: string;
          sort_order: number;
        };
        Insert: {
          id: string;
          label_el: string;
          label_en: string;
          sort_order: number;
        };
        Update: {
          id?: string;
          label_el?: string;
          label_en?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      opportunity: {
        Row: {
          additional_information: string | null;
          ai_research: Json | null;
          ai_research_at: string | null;
          application_link_last_checked_at: string | null;
          application_requirements: string | null;
          apply_url: string | null;
          apply_url_candidate: string | null;
          apply_url_candidate_note: string | null;
          audience_notes: string | null;
          country: string | null;
          created_at: string;
          deadline_at: string | null;
          deadline_precision: Database['public']['Enums']['deadline_precision'];
          deadline_raw: string | null;
          eligibility: string | null;
          eligible_countries: string | null;
          excluded_claims: string | null;
          expected_application_season: string | null;
          format: Database['public']['Enums']['format'] | null;
          funding: Database['public']['Enums']['funding'] | null;
          funding_details: string | null;
          host_city: string | null;
          id: string;
          last_verified_at: string | null;
          missing_information: string | null;
          official_url: string;
          opens_at: string | null;
          organiser: string | null;
          prep_time: Database['public']['Enums']['prep_time'] | null;
          reach: Database['public']['Enums']['reach'] | null;
          review_state: Database['public']['Enums']['review_state'];
          source_type: Database['public']['Enums']['source_type'];
          specific_majors: string | null;
          submitted_by: string | null;
          title: string | null;
          type_id: string;
          updated_at: string;
          verified_by: string | null;
        };
        Insert: {
          additional_information?: string | null;
          ai_research?: Json | null;
          ai_research_at?: string | null;
          application_link_last_checked_at?: string | null;
          application_requirements?: string | null;
          apply_url?: string | null;
          apply_url_candidate?: string | null;
          apply_url_candidate_note?: string | null;
          audience_notes?: string | null;
          country?: string | null;
          created_at?: string;
          deadline_at?: string | null;
          deadline_precision?: Database['public']['Enums']['deadline_precision'];
          deadline_raw?: string | null;
          eligibility?: string | null;
          eligible_countries?: string | null;
          excluded_claims?: string | null;
          expected_application_season?: string | null;
          format?: Database['public']['Enums']['format'] | null;
          funding?: Database['public']['Enums']['funding'] | null;
          funding_details?: string | null;
          host_city?: string | null;
          id?: string;
          last_verified_at?: string | null;
          missing_information?: string | null;
          official_url: string;
          opens_at?: string | null;
          organiser?: string | null;
          prep_time?: Database['public']['Enums']['prep_time'] | null;
          reach?: Database['public']['Enums']['reach'] | null;
          review_state?: Database['public']['Enums']['review_state'];
          source_type?: Database['public']['Enums']['source_type'];
          specific_majors?: string | null;
          submitted_by?: string | null;
          title?: string | null;
          type_id: string;
          updated_at?: string;
          verified_by?: string | null;
        };
        Update: {
          additional_information?: string | null;
          ai_research?: Json | null;
          ai_research_at?: string | null;
          application_link_last_checked_at?: string | null;
          application_requirements?: string | null;
          apply_url?: string | null;
          apply_url_candidate?: string | null;
          apply_url_candidate_note?: string | null;
          audience_notes?: string | null;
          country?: string | null;
          created_at?: string;
          deadline_at?: string | null;
          deadline_precision?: Database['public']['Enums']['deadline_precision'];
          deadline_raw?: string | null;
          eligibility?: string | null;
          eligible_countries?: string | null;
          excluded_claims?: string | null;
          expected_application_season?: string | null;
          format?: Database['public']['Enums']['format'] | null;
          funding?: Database['public']['Enums']['funding'] | null;
          funding_details?: string | null;
          host_city?: string | null;
          id?: string;
          last_verified_at?: string | null;
          missing_information?: string | null;
          official_url?: string;
          opens_at?: string | null;
          organiser?: string | null;
          prep_time?: Database['public']['Enums']['prep_time'] | null;
          reach?: Database['public']['Enums']['reach'] | null;
          review_state?: Database['public']['Enums']['review_state'];
          source_type?: Database['public']['Enums']['source_type'];
          specific_majors?: string | null;
          submitted_by?: string | null;
          title?: string | null;
          type_id?: string;
          updated_at?: string;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunity_type_id_fkey';
            columns: ['type_id'];
            isOneToOne: false;
            referencedRelation: 'type';
            referencedColumns: ['id'];
          },
        ];
      };
      opportunity_academic_level: {
        Row: {
          academic_level_id: string;
          opportunity_id: string;
        };
        Insert: {
          academic_level_id: string;
          opportunity_id: string;
        };
        Update: {
          academic_level_id?: string;
          opportunity_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunity_academic_level_academic_level_id_fkey';
            columns: ['academic_level_id'];
            isOneToOne: false;
            referencedRelation: 'academic_level';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'opportunity_academic_level_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunity';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'opportunity_academic_level_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunity_public';
            referencedColumns: ['id'];
          },
        ];
      };
      opportunity_audience_group: {
        Row: {
          audience_group_id: string;
          opportunity_id: string;
        };
        Insert: {
          audience_group_id: string;
          opportunity_id: string;
        };
        Update: {
          audience_group_id?: string;
          opportunity_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunity_audience_group_audience_group_id_fkey';
            columns: ['audience_group_id'];
            isOneToOne: false;
            referencedRelation: 'audience_group';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'opportunity_audience_group_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunity';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'opportunity_audience_group_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunity_public';
            referencedColumns: ['id'];
          },
        ];
      };
      opportunity_field: {
        Row: {
          field_id: string;
          opportunity_id: string;
        };
        Insert: {
          field_id: string;
          opportunity_id: string;
        };
        Update: {
          field_id?: string;
          opportunity_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunity_field_field_id_fkey';
            columns: ['field_id'];
            isOneToOne: false;
            referencedRelation: 'field';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'opportunity_field_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunity';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'opportunity_field_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunity_public';
            referencedColumns: ['id'];
          },
        ];
      };
      opportunity_funding_feature: {
        Row: {
          funding_feature_id: string;
          opportunity_id: string;
        };
        Insert: {
          funding_feature_id: string;
          opportunity_id: string;
        };
        Update: {
          funding_feature_id?: string;
          opportunity_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunity_funding_feature_funding_feature_id_fkey';
            columns: ['funding_feature_id'];
            isOneToOne: false;
            referencedRelation: 'funding_feature';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'opportunity_funding_feature_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunity';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'opportunity_funding_feature_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunity_public';
            referencedColumns: ['id'];
          },
        ];
      };
      opportunity_geo_scope: {
        Row: {
          geo_scope_id: string;
          opportunity_id: string;
        };
        Insert: {
          geo_scope_id: string;
          opportunity_id: string;
        };
        Update: {
          geo_scope_id?: string;
          opportunity_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunity_geo_scope_geo_scope_id_fkey';
            columns: ['geo_scope_id'];
            isOneToOne: false;
            referencedRelation: 'geo_scope';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'opportunity_geo_scope_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunity';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'opportunity_geo_scope_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunity_public';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          age_confirmed_16_plus: boolean;
          age_confirmed_at: string;
          created_at: string;
          id: string;
          role: Database['public']['Enums']['profile_role'] | null;
          updated_at: string;
        };
        Insert: {
          age_confirmed_16_plus: boolean;
          age_confirmed_at?: string;
          created_at?: string;
          id: string;
          role?: Database['public']['Enums']['profile_role'] | null;
          updated_at?: string;
        };
        Update: {
          age_confirmed_16_plus?: boolean;
          age_confirmed_at?: string;
          created_at?: string;
          id?: string;
          role?: Database['public']['Enums']['profile_role'] | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_opportunity: {
        Row: {
          created_at: string;
          id: string;
          last_alert_sent_at: string | null;
          opportunity_id: string;
          profile_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_alert_sent_at?: string | null;
          opportunity_id: string;
          profile_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_alert_sent_at?: string | null;
          opportunity_id?: string;
          profile_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_opportunity_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunity';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saved_opportunity_opportunity_id_fkey';
            columns: ['opportunity_id'];
            isOneToOne: false;
            referencedRelation: 'opportunity_public';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'saved_opportunity_profile_id_fkey';
            columns: ['profile_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      type: {
        Row: {
          id: string;
          label_el: string;
          label_en: string;
          sort_order: number;
        };
        Insert: {
          id: string;
          label_el: string;
          label_en: string;
          sort_order: number;
        };
        Update: {
          id?: string;
          label_el?: string;
          label_en?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      opportunity_public: {
        Row: {
          additional_information: string | null;
          ai_research: Json | null;
          ai_research_at: string | null;
          application_link_last_checked_at: string | null;
          application_requirements: string | null;
          apply_url: string | null;
          apply_url_candidate: string | null;
          apply_url_candidate_note: string | null;
          audience_notes: string | null;
          country: string | null;
          created_at: string | null;
          days_remaining: number | null;
          deadline_at: string | null;
          deadline_precision: Database['public']['Enums']['deadline_precision'] | null;
          deadline_raw: string | null;
          eligibility: string | null;
          eligible_countries: string | null;
          excluded_claims: string | null;
          expected_application_season: string | null;
          format: Database['public']['Enums']['format'] | null;
          funding: Database['public']['Enums']['funding'] | null;
          funding_details: string | null;
          host_city: string | null;
          id: string | null;
          last_verified_at: string | null;
          missing_information: string | null;
          official_url: string | null;
          opens_at: string | null;
          organiser: string | null;
          prep_time: Database['public']['Enums']['prep_time'] | null;
          reach: Database['public']['Enums']['reach'] | null;
          review_state: Database['public']['Enums']['review_state'] | null;
          source_type: Database['public']['Enums']['source_type'] | null;
          specific_majors: string | null;
          status: string | null;
          submitted_by: string | null;
          title: string | null;
          type_id: string | null;
          updated_at: string | null;
          verified_by: string | null;
        };
        Insert: {
          additional_information?: string | null;
          ai_research?: Json | null;
          ai_research_at?: string | null;
          application_link_last_checked_at?: string | null;
          application_requirements?: string | null;
          apply_url?: string | null;
          apply_url_candidate?: string | null;
          apply_url_candidate_note?: string | null;
          audience_notes?: string | null;
          country?: string | null;
          created_at?: string | null;
          days_remaining?: never;
          deadline_at?: string | null;
          deadline_precision?: Database['public']['Enums']['deadline_precision'] | null;
          deadline_raw?: string | null;
          eligibility?: string | null;
          eligible_countries?: string | null;
          excluded_claims?: string | null;
          expected_application_season?: string | null;
          format?: Database['public']['Enums']['format'] | null;
          funding?: Database['public']['Enums']['funding'] | null;
          funding_details?: string | null;
          host_city?: string | null;
          id?: string | null;
          last_verified_at?: string | null;
          missing_information?: string | null;
          official_url?: string | null;
          opens_at?: string | null;
          organiser?: string | null;
          prep_time?: Database['public']['Enums']['prep_time'] | null;
          reach?: Database['public']['Enums']['reach'] | null;
          review_state?: Database['public']['Enums']['review_state'] | null;
          source_type?: Database['public']['Enums']['source_type'] | null;
          specific_majors?: string | null;
          status?: never;
          submitted_by?: string | null;
          title?: string | null;
          type_id?: string | null;
          updated_at?: string | null;
          verified_by?: string | null;
        };
        Update: {
          additional_information?: string | null;
          ai_research?: Json | null;
          ai_research_at?: string | null;
          application_link_last_checked_at?: string | null;
          application_requirements?: string | null;
          apply_url?: string | null;
          apply_url_candidate?: string | null;
          apply_url_candidate_note?: string | null;
          audience_notes?: string | null;
          country?: string | null;
          created_at?: string | null;
          days_remaining?: never;
          deadline_at?: string | null;
          deadline_precision?: Database['public']['Enums']['deadline_precision'] | null;
          deadline_raw?: string | null;
          eligibility?: string | null;
          eligible_countries?: string | null;
          excluded_claims?: string | null;
          expected_application_season?: string | null;
          format?: Database['public']['Enums']['format'] | null;
          funding?: Database['public']['Enums']['funding'] | null;
          funding_details?: string | null;
          host_city?: string | null;
          id?: string | null;
          last_verified_at?: string | null;
          missing_information?: string | null;
          official_url?: string | null;
          opens_at?: string | null;
          organiser?: string | null;
          prep_time?: Database['public']['Enums']['prep_time'] | null;
          reach?: Database['public']['Enums']['reach'] | null;
          review_state?: Database['public']['Enums']['review_state'] | null;
          source_type?: Database['public']['Enums']['source_type'] | null;
          specific_majors?: string | null;
          status?: never;
          submitted_by?: string | null;
          title?: string | null;
          type_id?: string | null;
          updated_at?: string | null;
          verified_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'opportunity_type_id_fkey';
            columns: ['type_id'];
            isOneToOne: false;
            referencedRelation: 'type';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      can_edit_opportunities: { Args: never; Returns: boolean };
      is_moderator: { Args: never; Returns: boolean };
    };
    Enums: {
      deadline_precision: 'exact' | 'month' | 'unknown' | 'rolling';
      format: 'online' | 'in_person' | 'hybrid';
      funding: 'fully_funded' | 'partially_funded' | 'unfunded';
      prep_time: 'under_an_hour' | 'a_weekend' | 'longer';
      profile_role: 'ambassador' | 'moderator';
      reach: 'local' | 'national' | 'international';
      review_state: 'lead' | 'in_review' | 'published' | 'rejected' | 'archived';
      source_type: 'ambassador' | 'submission' | 'pipeline';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      deadline_precision: ['exact', 'month', 'unknown', 'rolling'],
      format: ['online', 'in_person', 'hybrid'],
      funding: ['fully_funded', 'partially_funded', 'unfunded'],
      prep_time: ['under_an_hour', 'a_weekend', 'longer'],
      profile_role: ['ambassador', 'moderator'],
      reach: ['local', 'national', 'international'],
      review_state: ['lead', 'in_review', 'published', 'rejected', 'archived'],
      source_type: ['ambassador', 'submission', 'pipeline'],
    },
  },
} as const;
