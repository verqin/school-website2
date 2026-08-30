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
      academic_years: {
        Row: {
          created_at: string
          ends_on: string
          id: string
          is_active: boolean
          name: string
          starts_on: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ends_on: string
          id?: string
          is_active?: boolean
          name: string
          starts_on: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ends_on?: string
          id?: string
          is_active?: boolean
          name?: string
          starts_on?: string
          updated_at?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          category: string
          coordinator_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          category?: string
          coordinator_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          category?: string
          coordinator_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_coordinator_id_fkey"
            columns: ["coordinator_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          detail: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          detail?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
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
      assessment_results: {
        Row: {
          assessment_id: string
          comment: string | null
          created_at: string
          id: string
          mark: number | null
          recorded_by: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          comment?: string | null
          created_at?: string
          id?: string
          mark?: number | null
          recorded_by?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          mark?: number | null
          recorded_by?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          academic_year_id: string | null
          assessment_date: string | null
          assessment_type: Database["public"]["Enums"]["assessment_type"]
          class_id: string
          created_at: string
          id: string
          max_mark: number
          name: string
          staff_id: string | null
          state: Database["public"]["Enums"]["publication_state"]
          subject_id: string
          term_id: string | null
          updated_at: string
          weight: number
        }
        Insert: {
          academic_year_id?: string | null
          assessment_date?: string | null
          assessment_type?: Database["public"]["Enums"]["assessment_type"]
          class_id: string
          created_at?: string
          id?: string
          max_mark: number
          name: string
          staff_id?: string | null
          state?: Database["public"]["Enums"]["publication_state"]
          subject_id: string
          term_id?: string | null
          updated_at?: string
          weight?: number
        }
        Update: {
          academic_year_id?: string | null
          assessment_date?: string | null
          assessment_type?: Database["public"]["Enums"]["assessment_type"]
          class_id?: string
          created_at?: string
          id?: string
          max_mark?: number
          name?: string
          staff_id?: string | null
          state?: Database["public"]["Enums"]["publication_state"]
          subject_id?: string
          term_id?: string | null
          updated_at?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          academic_year_id: string | null
          attendance_date: string
          class_id: string
          created_at: string
          id: string
          reason: string | null
          recorded_by: string | null
          session_label: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          subject_id: string | null
          term_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          attendance_date: string
          class_id: string
          created_at?: string
          id?: string
          reason?: string | null
          recorded_by?: string | null
          session_label?: string
          status: Database["public"]["Enums"]["attendance_status"]
          student_id: string
          subject_id?: string | null
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          attendance_date?: string
          class_id?: string
          created_at?: string
          id?: string
          reason?: string | null
          recorded_by?: string | null
          session_label?: string
          status?: Database["public"]["Enums"]["attendance_status"]
          student_id?: string
          subject_id?: string | null
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          audience: Database["public"]["Enums"]["audience_scope"]
          class_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          grade_level_id: string | null
          id: string
          location: string | null
          public_event_id: string | null
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          audience?: Database["public"]["Enums"]["audience_scope"]
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          grade_level_id?: string | null
          id?: string
          location?: string | null
          public_event_id?: string | null
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["audience_scope"]
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          grade_level_id?: string | null
          id?: string
          location?: string | null
          public_event_id?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendar_events_public_event_id_fkey"
            columns: ["public_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year_id: string
          capacity: number | null
          class_teacher_id: string | null
          created_at: string
          grade_level_id: string | null
          id: string
          is_active: boolean
          name: string
          room: string | null
          stream: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string
          grade_level_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          room?: string | null
          stream?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          capacity?: number | null
          class_teacher_id?: string | null
          created_at?: string
          grade_level_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          room?: string | null
          stream?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_class_teacher_id_fkey"
            columns: ["class_teacher_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
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
      departments: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      discipline_records: {
        Row: {
          action_taken: string | null
          category: string
          created_at: string
          description: string
          id: string
          incident_date: string
          internal_notes: string | null
          recorded_by: string | null
          status: Database["public"]["Enums"]["discipline_status"]
          student_id: string
          updated_at: string
          visible_to_guardians: boolean
        }
        Insert: {
          action_taken?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          incident_date?: string
          internal_notes?: string | null
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["discipline_status"]
          student_id: string
          updated_at?: string
          visible_to_guardians?: boolean
        }
        Update: {
          action_taken?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          incident_date?: string
          internal_notes?: string | null
          recorded_by?: string | null
          status?: Database["public"]["Enums"]["discipline_status"]
          student_id?: string
          updated_at?: string
          visible_to_guardians?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "discipline_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          academic_year_id: string
          application_id: string | null
          class_id: string | null
          created_at: string
          created_by: string | null
          end_date: string | null
          grade_level_id: string | null
          id: string
          notes: string | null
          reason: string | null
          stage: Database["public"]["Enums"]["enrollment_stage"]
          start_date: string | null
          student_id: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          application_id?: string | null
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          grade_level_id?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          stage?: Database["public"]["Enums"]["enrollment_stage"]
          start_date?: string | null
          student_id: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          application_id?: string | null
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          grade_level_id?: string | null
          id?: string
          notes?: string | null
          reason?: string | null
          stage?: Database["public"]["Enums"]["enrollment_stage"]
          start_date?: string | null
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
      examination_papers: {
        Row: {
          class_id: string | null
          created_at: string
          end_time: string | null
          examination_id: string
          grade_level_id: string | null
          id: string
          invigilator_id: string | null
          max_mark: number
          paper_date: string | null
          room: string | null
          start_time: string | null
          subject_id: string
          updated_at: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string
          end_time?: string | null
          examination_id: string
          grade_level_id?: string | null
          id?: string
          invigilator_id?: string | null
          max_mark?: number
          paper_date?: string | null
          room?: string | null
          start_time?: string | null
          subject_id: string
          updated_at?: string
        }
        Update: {
          class_id?: string | null
          created_at?: string
          end_time?: string | null
          examination_id?: string
          grade_level_id?: string | null
          id?: string
          invigilator_id?: string | null
          max_mark?: number
          paper_date?: string | null
          room?: string | null
          start_time?: string | null
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "examination_papers_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examination_papers_examination_id_fkey"
            columns: ["examination_id"]
            isOneToOne: false
            referencedRelation: "examinations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examination_papers_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examination_papers_invigilator_id_fkey"
            columns: ["invigilator_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examination_papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      examination_results: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          comment: string | null
          created_at: string
          grade_label: string | null
          id: string
          mark: number | null
          paper_id: string
          recorded_by: string | null
          state: Database["public"]["Enums"]["publication_state"]
          student_id: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          comment?: string | null
          created_at?: string
          grade_label?: string | null
          id?: string
          mark?: number | null
          paper_id: string
          recorded_by?: string | null
          state?: Database["public"]["Enums"]["publication_state"]
          student_id: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          comment?: string | null
          created_at?: string
          grade_label?: string | null
          id?: string
          mark?: number | null
          paper_id?: string
          recorded_by?: string | null
          state?: Database["public"]["Enums"]["publication_state"]
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "examination_results_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "examination_papers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examination_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      examinations: {
        Row: {
          academic_year_id: string
          created_at: string
          description: string | null
          ends_on: string | null
          id: string
          name: string
          starts_on: string | null
          state: Database["public"]["Enums"]["publication_state"]
          term_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          description?: string | null
          ends_on?: string | null
          id?: string
          name: string
          starts_on?: string | null
          state?: Database["public"]["Enums"]["publication_state"]
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          description?: string | null
          ends_on?: string | null
          id?: string
          name?: string
          starts_on?: string | null
          state?: Database["public"]["Enums"]["publication_state"]
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "examinations_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "examinations_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_categories: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      fee_structure_items: {
        Row: {
          amount_cents: number
          created_at: string
          fee_category_id: string
          fee_structure_id: string
          id: string
          is_mandatory: boolean
        }
        Insert: {
          amount_cents: number
          created_at?: string
          fee_category_id: string
          fee_structure_id: string
          id?: string
          is_mandatory?: boolean
        }
        Update: {
          amount_cents?: number
          created_at?: string
          fee_category_id?: string
          fee_structure_id?: string
          id?: string
          is_mandatory?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "fee_structure_items_fee_category_id_fkey"
            columns: ["fee_category_id"]
            isOneToOne: false
            referencedRelation: "fee_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structure_items_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year_id: string
          created_at: string
          currency: string
          grade_level_id: string | null
          id: string
          is_active: boolean
          name: string
          term_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          currency?: string
          grade_level_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          currency?: string
          grade_level_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fee_structures_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_adjustments: {
        Row: {
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          field: string
          id: string
          new_value: string | null
          old_value: string | null
          reason: string
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          field: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reason: string
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          field?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          reason?: string
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
      grading_bands: {
        Row: {
          created_at: string
          description: string | null
          id: string
          label: string
          max_percentage: number
          min_percentage: number
          points: number | null
          scale_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          label: string
          max_percentage: number
          min_percentage: number
          points?: number | null
          scale_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          max_percentage?: number
          min_percentage?: number
          points?: number | null
          scale_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "grading_bands_scale_id_fkey"
            columns: ["scale_id"]
            isOneToOne: false
            referencedRelation: "grading_scales"
            referencedColumns: ["id"]
          },
        ]
      }
      grading_scales: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_default: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      guardians: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          employer: string | null
          full_name: string
          id: string
          occupation: string | null
          phone: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employer?: string | null
          full_name: string
          id?: string
          occupation?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          employer?: string | null
          full_name?: string
          id?: string
          occupation?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          discount_cents: number
          fee_category_id: string | null
          id: string
          invoice_id: string
          quantity: number
          unit_amount_cents: number
        }
        Insert: {
          created_at?: string
          description: string
          discount_cents?: number
          fee_category_id?: string | null
          id?: string
          invoice_id: string
          quantity?: number
          unit_amount_cents: number
        }
        Update: {
          created_at?: string
          description?: string
          discount_cents?: number
          fee_category_id?: string | null
          id?: string
          invoice_id?: string
          quantity?: number
          unit_amount_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_fee_category_id_fkey"
            columns: ["fee_category_id"]
            isOneToOne: false
            referencedRelation: "fee_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          academic_year_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          discount_cents: number
          due_date: string | null
          guardian_id: string | null
          id: string
          invoice_no: string
          issue_date: string
          notes: string | null
          paid_cents: number
          status: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          subtotal_cents: number
          term_id: string | null
          total_cents: number
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_cents?: number
          due_date?: string | null
          guardian_id?: string | null
          id?: string
          invoice_no: string
          issue_date?: string
          notes?: string | null
          paid_cents?: number
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id: string
          subtotal_cents?: number
          term_id?: string | null
          total_cents?: number
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          discount_cents?: number
          due_date?: string | null
          guardian_id?: string | null
          id?: string
          invoice_no?: string
          issue_date?: string
          notes?: string | null
          paid_cents?: number
          status?: Database["public"]["Enums"]["invoice_status"]
          student_id?: string
          subtotal_cents?: number
          term_id?: string | null
          total_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      library_books: {
        Row: {
          author: string | null
          category: string | null
          cover_url: string | null
          created_at: string
          description: string | null
          id: string
          isbn: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          isbn?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          category?: string | null
          cover_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          isbn?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      library_copies: {
        Row: {
          book_id: string
          condition: string
          copy_code: string
          created_at: string
          id: string
          is_available: boolean
        }
        Insert: {
          book_id: string
          condition?: string
          copy_code: string
          created_at?: string
          id?: string
          is_available?: boolean
        }
        Update: {
          book_id?: string
          condition?: string
          copy_code?: string
          created_at?: string
          id?: string
          is_available?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "library_copies_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "library_books"
            referencedColumns: ["id"]
          },
        ]
      }
      library_loans: {
        Row: {
          borrowed_on: string
          copy_id: string
          created_at: string
          due_on: string
          id: string
          issued_by: string | null
          returned_on: string | null
          staff_id: string | null
          status: Database["public"]["Enums"]["loan_status"]
          student_id: string | null
          updated_at: string
        }
        Insert: {
          borrowed_on?: string
          copy_id: string
          created_at?: string
          due_on: string
          id?: string
          issued_by?: string | null
          returned_on?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          borrowed_on?: string
          copy_id?: string
          created_at?: string
          due_on?: string
          id?: string
          issued_by?: string | null
          returned_on?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["loan_status"]
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "library_loans_copy_id_fkey"
            columns: ["copy_id"]
            isOneToOne: false
            referencedRelation: "library_copies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_loans_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "library_loans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
      parent_student_relationships: {
        Row: {
          can_pickup: boolean
          created_at: string
          guardian_id: string
          id: string
          is_emergency_contact: boolean
          is_primary: boolean
          relationship: Database["public"]["Enums"]["guardian_relationship"]
          student_id: string
        }
        Insert: {
          can_pickup?: boolean
          created_at?: string
          guardian_id: string
          id?: string
          is_emergency_contact?: boolean
          is_primary?: boolean
          relationship?: Database["public"]["Enums"]["guardian_relationship"]
          student_id: string
        }
        Update: {
          can_pickup?: boolean
          created_at?: string
          guardian_id?: string
          id?: string
          is_emergency_contact?: boolean
          is_primary?: boolean
          relationship?: Database["public"]["Enums"]["guardian_relationship"]
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_student_relationships_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_student_relationships_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          requires_reference: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          requires_reference?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          requires_reference?: boolean
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string
          payment_method_id: string | null
          provider: string | null
          received_by: string | null
          student_id: string
          transaction_reference: string | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method_id?: string | null
          provider?: string | null
          received_by?: string | null
          student_id: string
          transaction_reference?: string | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string
          payment_method_id?: string | null
          provider?: string | null
          received_by?: string | null
          student_id?: string
          transaction_reference?: string | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
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
      receipts: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          guardian_id: string | null
          id: string
          issued_by: string | null
          payment_id: string
          receipt_no: string
          student_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          guardian_id?: string | null
          id?: string
          issued_by?: string | null
          payment_id: string
          receipt_no: string
          student_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          guardian_id?: string | null
          id?: string
          issued_by?: string | null
          payment_id?: string
          receipt_no?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_guardian_id_fkey"
            columns: ["guardian_id"]
            isOneToOne: false
            referencedRelation: "guardians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      report_card_subject_results: {
        Row: {
          created_at: string
          grade_label: string | null
          id: string
          mark: number | null
          max_mark: number
          percentage: number | null
          report_card_id: string
          staff_id: string | null
          subject_id: string
          teacher_comment: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          grade_label?: string | null
          id?: string
          mark?: number | null
          max_mark?: number
          percentage?: number | null
          report_card_id: string
          staff_id?: string | null
          subject_id: string
          teacher_comment?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          grade_label?: string | null
          id?: string
          mark?: number | null
          max_mark?: number
          percentage?: number | null
          report_card_id?: string
          staff_id?: string | null
          subject_id?: string
          teacher_comment?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_card_subject_results_report_card_id_fkey"
            columns: ["report_card_id"]
            isOneToOne: false
            referencedRelation: "report_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_card_subject_results_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_card_subject_results_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      report_cards: {
        Row: {
          academic_year_id: string
          approved_by: string | null
          attendance_present: number | null
          attendance_total: number | null
          class_id: string | null
          class_teacher_comment: string | null
          created_at: string
          id: string
          overall_grade: string | null
          overall_percentage: number | null
          principal_comment: string | null
          published_at: string | null
          state: Database["public"]["Enums"]["publication_state"]
          student_id: string
          submitted_by: string | null
          term_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          approved_by?: string | null
          attendance_present?: number | null
          attendance_total?: number | null
          class_id?: string | null
          class_teacher_comment?: string | null
          created_at?: string
          id?: string
          overall_grade?: string | null
          overall_percentage?: number | null
          principal_comment?: string | null
          published_at?: string | null
          state?: Database["public"]["Enums"]["publication_state"]
          student_id: string
          submitted_by?: string | null
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          approved_by?: string | null
          attendance_present?: number | null
          attendance_total?: number | null
          class_id?: string | null
          class_teacher_comment?: string | null
          created_at?: string
          id?: string
          overall_grade?: string | null
          overall_percentage?: number | null
          principal_comment?: string | null
          published_at?: string | null
          state?: Database["public"]["Enums"]["publication_state"]
          student_id?: string
          submitted_by?: string | null
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_cards_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_cards_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      school_announcements: {
        Row: {
          attachment_url: string | null
          audience: Database["public"]["Enums"]["audience_scope"]
          body: string
          class_id: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          grade_level_id: string | null
          id: string
          is_published: boolean
          priority: string
          publish_at: string
          title: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          audience?: Database["public"]["Enums"]["audience_scope"]
          body: string
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          grade_level_id?: string | null
          id?: string
          is_published?: boolean
          priority?: string
          publish_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          audience?: Database["public"]["Enums"]["audience_scope"]
          body?: string
          class_id?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          grade_level_id?: string | null
          id?: string
          is_published?: boolean
          priority?: string
          publish_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "school_announcements_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "school_announcements_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      school_documents: {
        Row: {
          audience: Database["public"]["Enums"]["audience_scope"]
          category: string
          created_at: string
          description: string | null
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          audience?: Database["public"]["Enums"]["audience_scope"]
          category?: string
          created_at?: string
          description?: string | null
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          audience?: Database["public"]["Enums"]["audience_scope"]
          category?: string
          created_at?: string
          description?: string | null
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
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
      staff: {
        Row: {
          created_at: string
          department_id: string | null
          email: string | null
          employment_status: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          photo_url: string | null
          position: string | null
          public_profile_id: string | null
          qualifications: string | null
          staff_no: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          email?: string | null
          employment_status?: string
          full_name: string
          id?: string
          is_active?: boolean
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          public_profile_id?: string | null
          qualifications?: string | null
          staff_no: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          department_id?: string | null
          email?: string | null
          employment_status?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          public_profile_id?: string | null
          qualifications?: string | null
          staff_no?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_public_profile_id_fkey"
            columns: ["public_profile_id"]
            isOneToOne: false
            referencedRelation: "staff_members"
            referencedColumns: ["id"]
          },
        ]
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
      student_activities: {
        Row: {
          activity_id: string
          created_at: string
          id: string
          joined_on: string
          left_on: string | null
          notes: string | null
          role: string | null
          student_id: string
        }
        Insert: {
          activity_id: string
          created_at?: string
          id?: string
          joined_on?: string
          left_on?: string | null
          notes?: string | null
          role?: string | null
          student_id: string
        }
        Update: {
          activity_id?: string
          created_at?: string
          id?: string
          joined_on?: string
          left_on?: string | null
          notes?: string | null
          role?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_activities_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_activities_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_charges: {
        Row: {
          academic_year_id: string | null
          amount_cents: number
          created_at: string
          description: string
          discount_cents: number
          fee_category_id: string | null
          fee_structure_id: string | null
          id: string
          invoice_id: string | null
          student_id: string
          term_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id?: string | null
          amount_cents: number
          created_at?: string
          description: string
          discount_cents?: number
          fee_category_id?: string | null
          fee_structure_id?: string | null
          id?: string
          invoice_id?: string | null
          student_id: string
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string | null
          amount_cents?: number
          created_at?: string
          description?: string
          discount_cents?: number
          fee_category_id?: string | null
          fee_structure_id?: string | null
          id?: string
          invoice_id?: string | null
          student_id?: string
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_charges_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_charges_fee_category_id_fkey"
            columns: ["fee_category_id"]
            isOneToOne: false
            referencedRelation: "fee_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_charges_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_charges_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_charges_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_charges_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      student_documents: {
        Row: {
          created_at: string
          doc_type: string
          file_name: string
          id: string
          mime_type: string | null
          size_bytes: number | null
          storage_path: string
          student_id: string
          title: string
          updated_at: string
          uploaded_by: string | null
          visible_to_guardians: boolean
          visible_to_student: boolean
        }
        Insert: {
          created_at?: string
          doc_type: string
          file_name: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path: string
          student_id: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
          visible_to_guardians?: boolean
          visible_to_student?: boolean
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_name?: string
          id?: string
          mime_type?: string | null
          size_bytes?: number | null
          storage_path?: string
          student_id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
          visible_to_guardians?: boolean
          visible_to_student?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "student_documents_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          admission_date: string | null
          application_id: string | null
          created_at: string
          current_academic_year_id: string | null
          current_class_id: string | null
          date_of_birth: string | null
          exit_date: string | null
          exit_reason: string | null
          first_name: string
          gender: string | null
          grade_level_id: string | null
          id: string
          last_name: string
          middle_name: string | null
          nationality: string | null
          photo_url: string | null
          place_of_birth: string | null
          previous_school: string | null
          status: Database["public"]["Enums"]["student_status"]
          student_no: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admission_date?: string | null
          application_id?: string | null
          created_at?: string
          current_academic_year_id?: string | null
          current_class_id?: string | null
          date_of_birth?: string | null
          exit_date?: string | null
          exit_reason?: string | null
          first_name: string
          gender?: string | null
          grade_level_id?: string | null
          id?: string
          last_name: string
          middle_name?: string | null
          nationality?: string | null
          photo_url?: string | null
          place_of_birth?: string | null
          previous_school?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_no: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admission_date?: string | null
          application_id?: string | null
          created_at?: string
          current_academic_year_id?: string | null
          current_class_id?: string | null
          date_of_birth?: string | null
          exit_date?: string | null
          exit_reason?: string | null
          first_name?: string
          gender?: string | null
          grade_level_id?: string | null
          id?: string
          last_name?: string
          middle_name?: string | null
          nationality?: string | null
          photo_url?: string | null
          place_of_birth?: string | null
          previous_school?: string | null
          status?: Database["public"]["Enums"]["student_status"]
          student_no?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "students_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: true
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_current_academic_year_id_fkey"
            columns: ["current_academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_current_class_fkey"
            columns: ["current_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      subject_grade_levels: {
        Row: {
          created_at: string
          grade_level_id: string
          id: string
          subject_id: string
        }
        Insert: {
          created_at?: string
          grade_level_id: string
          id?: string
          subject_id: string
        }
        Update: {
          created_at?: string
          grade_level_id?: string
          id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subject_grade_levels_grade_level_id_fkey"
            columns: ["grade_level_id"]
            isOneToOne: false
            referencedRelation: "grade_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subject_grade_levels_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          academic_level: string | null
          code: string
          created_at: string
          department_id: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          academic_level?: string | null
          code: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          academic_level?: string | null
          code?: string
          created_at?: string
          department_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_subject_assignments: {
        Row: {
          academic_year_id: string
          class_id: string
          created_at: string
          id: string
          staff_id: string
          subject_id: string
        }
        Insert: {
          academic_year_id: string
          class_id: string
          created_at?: string
          id?: string
          staff_id: string
          subject_id: string
        }
        Update: {
          academic_year_id?: string
          class_id?: string
          created_at?: string
          id?: string
          staff_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teacher_subject_assignments_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subject_assignments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subject_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teacher_subject_assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      terms: {
        Row: {
          academic_year_id: string
          created_at: string
          ends_on: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          starts_on: string
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          created_at?: string
          ends_on: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          starts_on: string
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          created_at?: string
          ends_on?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          starts_on?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "terms_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_slots: {
        Row: {
          academic_year_id: string
          class_id: string
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          label: string | null
          room: string | null
          staff_id: string | null
          start_time: string
          subject_id: string | null
          term_id: string | null
          updated_at: string
        }
        Insert: {
          academic_year_id: string
          class_id: string
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          label?: string | null
          room?: string | null
          staff_id?: string | null
          start_time: string
          subject_id?: string | null
          term_id?: string | null
          updated_at?: string
        }
        Update: {
          academic_year_id?: string
          class_id?: string
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          label?: string | null
          room?: string | null
          staff_id?: string | null
          start_time?: string
          subject_id?: string | null
          term_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_slots_academic_year_id_fkey"
            columns: ["academic_year_id"]
            isOneToOne: false
            referencedRelation: "academic_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_slots_term_id_fkey"
            columns: ["term_id"]
            isOneToOne: false
            referencedRelation: "terms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notifications: {
        Row: {
          body: string | null
          category: string
          created_at: string
          id: string
          is_read: boolean
          link_url: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          category?: string
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          title?: string
          user_id?: string
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
      can: { Args: { _permission: string }; Returns: boolean }
      current_guardian_id: { Args: never; Returns: string }
      current_staff_id: { Args: never; Returns: string }
      current_student_id: { Args: never; Returns: string }
      grade_for_percentage: {
        Args: { _percentage: number; _scale_id?: string }
        Returns: string
      }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_guardian_of: { Args: { _student_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      is_student_self: { Args: { _student_id: string }; Returns: boolean }
      next_application_reference: { Args: never; Returns: string }
      next_student_number: { Args: never; Returns: string }
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
      teaches_class: { Args: { _class_id: string }; Returns: boolean }
      teaches_student: { Args: { _student_id: string }; Returns: boolean }
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
