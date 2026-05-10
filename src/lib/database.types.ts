// ==========================================
// Supabase Database Types
// Generated types for Impact Computers database schema
// ==========================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string
          slug: string
          title: string
          subtitle: string | null
          icon: string | null
          icon_url: string | null
          duration: string | null
          fees: string | null
          description: string | null
          overview: string | null
          syllabus: Json | null
          benefits: Json | null
          color: string | null
          popular: boolean | null
          certification: string | null
          exam_details: string | null
          sort_order: number | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          subtitle?: string | null
          icon?: string | null
          icon_url?: string | null
          duration?: string | null
          fees?: string | null
          description?: string | null
          overview?: string | null
          syllabus?: Json | null
          benefits?: Json | null
          color?: string | null
          popular?: boolean | null
          certification?: string | null
          exam_details?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          subtitle?: string | null
          icon?: string | null
          icon_url?: string | null
          duration?: string | null
          fees?: string | null
          description?: string | null
          overview?: string | null
          syllabus?: Json | null
          benefits?: Json | null
          color?: string | null
          popular?: boolean | null
          certification?: string | null
          exam_details?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      faculty: {
        Row: {
          id: string
          name: string
          designation: string | null
          qualification: string | null
          experience: string | null
          specialization: string | null
          photo_url: string | null
          branch: string | null
          bio: string | null
          sort_order: number | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          designation?: string | null
          qualification?: string | null
          experience?: string | null
          specialization?: string | null
          photo_url?: string | null
          branch?: string | null
          bio?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          designation?: string | null
          qualification?: string | null
          experience?: string | null
          specialization?: string | null
          photo_url?: string | null
          branch?: string | null
          bio?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      gallery: {
        Row: {
          id: string
          title: string | null
          description: string | null
          image_url: string
          category: string | null
          section: string | null
          alt_text: string | null
          sort_order: number | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          description?: string | null
          image_url: string
          category?: string | null
          section?: string | null
          alt_text?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          description?: string | null
          image_url?: string
          category?: string | null
          section?: string | null
          alt_text?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          title: string
          video_url: string
          video_type: string | null
          thumbnail_url: string | null
          section: string | null
          description: string | null
          sort_order: number | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          video_url: string
          video_type?: string | null
          thumbnail_url?: string | null
          section?: string | null
          description?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          video_url?: string
          video_type?: string | null
          thumbnail_url?: string | null
          section?: string | null
          description?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          title: string | null
          description: string | null
          image_url: string
          category: string | null
          student_name: string | null
          course_name: string | null
          sort_order: number | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title?: string | null
          description?: string | null
          image_url: string
          category?: string | null
          student_name?: string | null
          course_name?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string | null
          description?: string | null
          image_url?: string
          category?: string | null
          student_name?: string | null
          course_name?: string | null
          sort_order?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      enquiries: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          course_interest: string | null
          branch: string | null
          message: string | null
          is_read: boolean | null
          is_contacted: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          course_interest?: string | null
          branch?: string | null
          message?: string | null
          is_read?: boolean | null
          is_contacted?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          course_interest?: string | null
          branch?: string | null
          message?: string | null
          is_read?: boolean | null
          is_contacted?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          username: string
          email: string | null
          password_hash: string
          role: string
          permissions: Json | null
          is_active: boolean | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email?: string | null
          password_hash: string
          role?: string
          permissions?: Json | null
          is_active?: boolean | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          password_hash?: string
          role?: string
          permissions?: Json | null
          is_active?: boolean | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chat_sessions: {
        Row: {
          id: string
          session_id: string
          messages: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          messages?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          messages?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          page: string
          section_key: string
          title: string | null
          content: string | null
          is_active: boolean | null
          sort_order: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page: string
          section_key: string
          title?: string | null
          content?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          page?: string
          section_key?: string
          title?: string | null
          content?: string | null
          is_active?: boolean | null
          sort_order?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Helper to extract row type from a table
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
