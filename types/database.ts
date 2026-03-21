export type UserRole = 'admin' | 'employee'
export type ProjectStatus = 'active' | 'completed' | 'on_hold'
export type TrackValue = 'permit' | 'design' | 'interior_design' | 'business_license' | 'claim' | 'other'
export type LeadSource = 'טלפון' | 'מייל' | 'קמפיין' | 'אחר'
export type RequirementStatus = 'ממתין' | 'בטיפול' | 'הוגש' | 'התקבל' | 'חזרו הערות'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          role: UserRole
          email: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          role?: UserRole
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          role?: UserRole
          email?: string | null
          created_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          name: string
          company: string | null
          phone: string | null
          email: string | null
          address: string | null
          lead_source: LeadSource | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          company?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          lead_source?: LeadSource | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          lead_source?: LeadSource | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          title: string
          location: string | null
          client_id: string | null
          tracks: TrackValue[]
          status: ProjectStatus
          contract_date: string | null
          info_file_number: string | null
          permit_submission_number: string | null
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          location?: string | null
          client_id?: string | null
          tracks?: TrackValue[]
          status?: ProjectStatus
          contract_date?: string | null
          info_file_number?: string | null
          permit_submission_number?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          location?: string | null
          client_id?: string | null
          tracks?: TrackValue[]
          status?: ProjectStatus
          contract_date?: string | null
          info_file_number?: string | null
          permit_submission_number?: string | null
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      project_stages: {
        Row: {
          id: string
          project_id: string
          track: TrackValue
          name: string
          order_index: number
          completed: boolean
          invoice_sent: boolean
          paid: boolean
          price: number
          completed_at: string | null
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          track: TrackValue
          name: string
          order_index: number
          completed?: boolean
          invoice_sent?: boolean
          paid?: boolean
          price?: number
          completed_at?: string | null
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          track?: TrackValue
          name?: string
          order_index?: number
          completed?: boolean
          invoice_sent?: boolean
          paid?: boolean
          price?: number
          completed_at?: string | null
          note?: string | null
          created_at?: string
        }
        Relationships: []
      }
      status_requirements: {
        Row: {
          id: string
          project_id: string
          section: string
          item_number: number | null
          requirement: string
          uploaded: boolean
          status: RequirementStatus
          status_date: string | null
          target_date: string | null
          notes: string | null
          order_index: number
        }
        Insert: {
          id?: string
          project_id: string
          section: string
          item_number?: number | null
          requirement: string
          uploaded?: boolean
          status?: RequirementStatus
          status_date?: string | null
          target_date?: string | null
          notes?: string | null
          order_index: number
        }
        Update: {
          id?: string
          project_id?: string
          section?: string
          item_number?: number | null
          requirement?: string
          uploaded?: boolean
          status?: RequirementStatus
          status_date?: string | null
          target_date?: string | null
          notes?: string | null
          order_index?: number
        }
        Relationships: []
      }
      project_contacts: {
        Row: {
          id: string
          project_id: string
          role: string
          appointed: boolean
          name: string | null
          phone: string | null
          email: string | null
        }
        Insert: {
          id?: string
          project_id: string
          role: string
          appointed?: boolean
          name?: string | null
          phone?: string | null
          email?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          role?: string
          appointed?: boolean
          name?: string | null
          phone?: string | null
          email?: string | null
        }
        Relationships: []
      }
      project_files: {
        Row: {
          id: string
          project_id: string
          file_name: string
          file_path: string
          file_type: string | null
          file_size: number | null
          uploaded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          file_name: string
          file_path: string
          file_type?: string | null
          file_size?: number | null
          uploaded_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          file_name?: string
          file_path?: string
          file_type?: string | null
          file_size?: number | null
          uploaded_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectStage = Database['public']['Tables']['project_stages']['Row']
export type StatusRequirement = Database['public']['Tables']['status_requirements']['Row']
export type ProjectContact = Database['public']['Tables']['project_contacts']['Row']
export type ProjectFile = Database['public']['Tables']['project_files']['Row']

// Joined types used in queries
export type ProjectWithClient = Project & {
  client: Client | null
  creator?: Pick<Profile, 'full_name'> | null
}

export type ClientWithProjects = Client & {
  projects: Project[]
}
