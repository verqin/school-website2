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
      admissions_periods: {
        Row: {
          academic_year: string
          application_fee_cents: number
          closes_at: string | null
          created_at: string
          currency: string
          id: string
          instructions: string | null
          is_active: boolean
          name: string
          opens_at: string
          updated_at: string
        }
        Insert: {
          academic_year: string
          application_fee_cents?: number
          closes_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          name: string
          opens_at?: string
          updated_at?: string
        }
        Update: {
          academic_year?: string
          application_fee_cents?: number
          closes_at?: string | null
          created_at?: string
          currency?: string
          id?: string
          instructions?: string | null
          is_active?: boolean
          name?: string
          opens_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admissions_requirements: {
        Row: {
          code: string
          created_at: string
          description: string | null
          grade_level_id: string | null
          id: string
          is_active: boolean
          is_mandatory: boolean
          label: string
          period_id: string | null
          requires_document: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          grade_level_id?: string | null
          id?: string
          is_active?: boolean
          is_mandatory?: boolean
          label: string
          period_id?: string | null
          requires_document?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          grade_level_id?: string | null
          id?: string
          is_active?: boolean
          is_mandatory?: boolean
          label?: string
          period_id?: string | null
          requires_document?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admissions_requirements_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_requirements_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "admissions_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      admissions_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          importance: string
          is_active: boolean
          link_url: string | null
          message: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          importance?: string
          is_active?: boolean
          link_url?: string | null
          message: string
          starts_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          importance?: string
          is_active?: boolean
          link_url?: string | null
          message?: string
          starts_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      applicant_notifications: {
        Row: {
          application_id: string | null
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          application_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          application_id?: string | null
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applicant_notifications_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          application_id: string | null
          created_at: string
          detail: Json
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          application_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          application_id?: string | null
          created_at?: string
          detail?: Json
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_audit_log_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_document_requests: {
        Row: {
          application_id: string
          created_at: string
          id: string
          label: string
          message: string | null
          requested_by: string
          requirement_id: string | null
          resolved_at: string | null
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          label: string
          message?: string | null
          requested_by: string
          requirement_id?: string | null
          resolved_at?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          label?: string
          message?: string | null
          requested_by?: string
          requirement_id?: string | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_document_requests_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_document_requests_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "admissions_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      application_documents: {
        Row: {
          application_id: string
          created_at: string
          doc_type: string
          file_name: string
          id: string
          mime_type: string | null
          rejection_reason: string | null
          requirement_id: string | null
          size_bytes: number | null
          status: Database["public"]["Enums"]["document_status"]
          storage_path: string
          updated_at: string
          uploaded_by: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          application_id: string
          created_at?: string
          doc_type: string
          file_name: string
          id?: string
          mime_type?: string | null
          rejection_reason?: string | null
          requirement_id?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path: string
          updated_at?: string
          uploaded_by: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string
          doc_type?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          rejection_reason?: string | null
          requirement_id?: string | null
          size_bytes?: number | null
          status?: Database["public"]["Enums"]["document_status"]
          storage_path?: string
          updated_at?: string
          uploaded_by?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "application_documents_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_documents_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "admissions_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      application_interviews: {
        Row: {
          application_id: string
          created_at: string
          created_by: string
          duration_minutes: number
          id: string
          interviewer_id: string | null
          interviewer_name: string | null
          location: string | null
          mode: string
          outcome: string | null
          scheduled_at: string
          staff_notes: string | null
          status: Database["public"]["Enums"]["interview_status"]
          updated_at: string
        }
        Insert: {
          application_id: string
          created_at?: string
          created_by: string
          duration_minutes?: number
          id?: string
          interviewer_id?: string | null
          interviewer_name?: string | null
          location?: string | null
          mode?: string
          outcome?: string | null
          scheduled_at: string
          staff_notes?: string | null
          status?: Database["public"]["Enums"]["interview_status"]
          updated_at?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          created_by?: string
          duration_minutes?: number
          id?: string
          interviewer_id?: string | null
          interviewer_name?: string | null
          location?: string | null
          mode?: string
          outcome?: string | null
          scheduled_at?: string
          staff_notes?: string | null
          status?: Database["public"]["Enums"]["interview_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_notes: {
        Row: {
          application_id: string
          author_id: string
          body: string
          created_at: string
          id: string
        }
        Insert: {
          application_id: string
          author_id: string
          body: string
          created_at?: string
          id?: string
        }
        Update: {
          application_id?: string
          author_id?: string
          body?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_notes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_payments: {
        Row: {
          amount_cents: number
          application_id: string
          created_at: string
          currency: string
          detail: Json
          id: string
          provider: string
          provider_reference: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount_cents?: number
          application_id: string
          created_at?: string
          currency?: string
          detail?: Json
          id?: string
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          application_id?: string
          created_at?: string
          currency?: string
          detail?: Json
          id?: string
          provider?: string
          provider_reference?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_payments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_status_history: {
        Row: {
          application_id: string
          changed_by: string | null
          created_at: string
          from_status: Database["public"]["Enums"]["application_status"] | null
          id: string
          note: string | null
          to_status: Database["public"]["Enums"]["application_status"]
        }
        Insert: {
          application_id: string
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["application_status"] | null
          id?: string
          note?: string | null
          to_status: Database["public"]["Enums"]["application_status"]
        }
        Update: {
          application_id?: string
          changed_by?: string | null
          created_at?: string
          from_status?: Database["public"]["Enums"]["application_status"] | null
          id?: string
          note?: string | null
          to_status?: Database["public"]["Enums"]["application_status"]
        }
        Relationships: [
          {
            foreignKeyName: "application_status_history_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applicant_user_id: string
          assigned_to: string | null
          created_at: string
          current_step: number
          decision: Database["public"]["Enums"]["application_status"] | null
          decision_at: string | null
          decision_by: string | null
          decision_note: string | null
          form_data: Json
          grade_level_id: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          last_autosaved_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          period_id: string | null
          reference_code: string | null
          status: Database["public"]["Enums"]["application_status"]
          student_dob: string | null
          student_first_name: string | null
          student_last_name: string | null
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          applicant_user_id: string
          assigned_to?: string | null
          created_at?: string
          current_step?: number
          decision?: Database["public"]["Enums"]["application_status"] | null
          decision_at?: string | null
          decision_by?: string | null
          decision_note?: string | null
          form_data?: Json
          grade_level_id?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          last_autosaved_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          period_id?: string | null
          reference_code?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_dob?: string | null
          student_first_name?: string | null
          student_last_name?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          applicant_user_id?: string
          assigned_to?: string | null
          created_at?: string
          current_step?: number
          decision?: Database["public"]["Enums"]["application_status"] | null
          decision_at?: string | null
          decision_by?: string | null
          decision_note?: string | null
          form_data?: Json
          grade_level_id?: string | null
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          last_autosaved_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          period_id?: string | null
          reference_code?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          student_dob?: string | null
          student_first_name?: string | null
          student_last_name?: string | null
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "admissions_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_handled: boolean
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_handled?: boolean
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_handled?: boolean
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          id: string
          is_published: boolean
          location: string | null
          slug: string
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          slug: string
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_published?: boolean
          location?: string | null
          slug?: string
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_albums: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          album_id: string
          alt_text: string | null
          caption: string | null
          created_at: string
          id: string
          image_url: string
          sort_order: number
        }
        Insert: {
          album_id: string
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          sort_order?: number
        }
        Update: {
          album_id?: string
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "gallery_albums"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_levels: {
        Row: {
          capacity: number | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          max_age: number | null
          min_age: number | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_age?: number | null
          min_age?: number | null
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          max_age?: number | null
          min_age?: number | null
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          author_name: string | null
          body: string | null
          category: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          body?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          body?: string | null
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          body: string | null
          created_at: string
          hero_image_url: string | null
          id: string
          is_published: boolean
          slug: string
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          hero_image_url?: string | null
          id?: string
          is_published?: boolean
          slug: string
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          hero_image_url?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          created_at: string
          details: string | null
          id: string
          image_url: string | null
          is_published: boolean
          level: string | null
          name: string
          slug: string
          sort_order: number
          summary: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          level?: string | null
          name: string
          slug: string
          sort_order?: number
          summary?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean
          level?: string | null
          name?: string
          slug?: string
          sort_order?: number
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      staff_members: {
        Row: {
          bio: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          is_published: boolean
          photo_url: string | null
          role_title: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name: string
          id?: string
          is_published?: boolean
          photo_url?: string | null
          role_title?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          is_published?: boolean
          photo_url?: string | null
          role_title?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      next_application_reference: { Args: never; Returns: string }
      set_application_status: {
        Args: {
          _application_id: string
          _note?: string
          _status: Database["public"]["Enums"]["application_status"]
        }
        Returns: {
          applicant_user_id: string
          assigned_to: string | null
          created_at: string
          current_step: number
          decision: Database["public"]["Enums"]["application_status"] | null
          decision_at: string | null
          decision_by: string | null
          decision_note: string | null
          form_data: Json
          grade_level_id: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          last_autosaved_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          period_id: string | null
          reference_code: string | null
          status: Database["public"]["Enums"]["application_status"]
          student_dob: string | null
          student_first_name: string | null
          student_last_name: string | null
          submitted_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_application: {
        Args: { _application_id: string }
        Returns: {
          applicant_user_id: string
          assigned_to: string | null
          created_at: string
          current_step: number
          decision: Database["public"]["Enums"]["application_status"] | null
          decision_at: string | null
          decision_by: string | null
          decision_note: string | null
          form_data: Json
          grade_level_id: string | null
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          last_autosaved_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          period_id: string | null
          reference_code: string | null
          status: Database["public"]["Enums"]["application_status"]
          student_dob: string | null
          student_first_name: string | null
          student_last_name: string | null
          submitted_at: string | null
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "applications"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "editor"
        | "viewer"
        | "super_admin"
        | "administrator"
        | "principal"
        | "deputy_principal"
        | "admissions_officer"
        | "finance_officer"
        | "teacher"
        | "class_teacher"
        | "librarian"
        | "parent"
        | "student"
      application_status:
        | "draft"
        | "submitted"
        | "under_review"
        | "documents_requested"
        | "interview_scheduled"
        | "interviewed"
        | "accepted"
        | "waitlisted"
        | "rejected"
        | "withdrawn"
      assessment_type:
        | "quiz"
        | "test"
        | "assignment"
        | "project"
        | "continuous"
        | "practical"
        | "other"
      attendance_status: "present" | "absent" | "late" | "excused"
      audience_scope:
        | "everyone"
        | "parents"
        | "students"
        | "teachers"
        | "staff"
        | "grade"
        | "class"
      discipline_status:
        | "open"
        | "under_review"
        | "resolved"
        | "escalated"
        | "closed"
      document_status: "pending" | "verified" | "rejected"
      enrollment_stage:
        | "pending"
        | "documentation"
        | "requirements"
        | "confirmed"
        | "active"
        | "paused"
        | "rejected"
        | "completed"
      guardian_relationship:
        | "mother"
        | "father"
        | "guardian"
        | "grandparent"
        | "sibling"
        | "other"
      interview_status: "scheduled" | "completed" | "cancelled" | "no_show"
      invoice_status:
        | "draft"
        | "issued"
        | "partially_paid"
        | "paid"
        | "overdue"
        | "cancelled"
      loan_status: "borrowed" | "returned" | "overdue" | "lost"
      payment_status:
        | "unpaid"
        | "pending"
        | "paid"
        | "failed"
        | "waived"
        | "refunded"
      publication_state:
        | "draft"
        | "submitted"
        | "reviewed"
        | "approved"
        | "published"
        | "unpublished"
      student_status:
        | "applicant"
        | "enrolled"
        | "active"
        | "suspended"
        | "transferred"
        | "graduated"
        | "withdrawn"
        | "archived"
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
    Enums: {
      app_role: [
        "admin",
        "editor",
        "viewer",
        "super_admin",
        "administrator",
        "principal",
        "deputy_principal",
        "admissions_officer",
        "finance_officer",
        "teacher",
        "class_teacher",
        "librarian",
        "parent",
        "student",
      ],
      application_status: [
        "draft",
        "submitted",
        "under_review",
        "documents_requested",
        "interview_scheduled",
        "interviewed",
        "accepted",
        "waitlisted",
        "rejected",
        "withdrawn",
      ],
      assessment_type: [
        "quiz",
        "test",
        "assignment",
        "project",
        "continuous",
        "practical",
        "other",
      ],
      attendance_status: ["present", "absent", "late", "excused"],
      audience_scope: [
        "everyone",
        "parents",
        "students",
        "teachers",
        "staff",
        "grade",
        "class",
      ],
      discipline_status: [
        "open",
        "under_review",
        "resolved",
        "escalated",
        "closed",
      ],
      document_status: ["pending", "verified", "rejected"],
      enrollment_stage: [
        "pending",
        "documentation",
        "requirements",
        "confirmed",
        "active",
        "paused",
        "rejected",
        "completed",
      ],
      guardian_relationship: [
        "mother",
        "father",
        "guardian",
        "grandparent",
        "sibling",
        "other",
      ],
      interview_status: ["scheduled", "completed", "cancelled", "no_show"],
      invoice_status: [
        "draft",
        "issued",
        "partially_paid",
        "paid",
        "overdue",
        "cancelled",
      ],
      loan_status: ["borrowed", "returned", "overdue", "lost"],
      payment_status: [
        "unpaid",
        "pending",
        "paid",
        "failed",
        "waived",
        "refunded",
      ],
      publication_state: [
        "draft",
        "submitted",
        "reviewed",
        "approved",
        "published",
        "unpublished",
      ],
      student_status: [
        "applicant",
        "enrolled",
        "active",
        "suspended",
        "transferred",
        "graduated",
        "withdrawn",
        "archived",
      ],
    },
  },
} as const
