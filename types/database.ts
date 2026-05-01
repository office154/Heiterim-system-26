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
          contact_name: string | null
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
          contact_name?: string | null
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
          contact_name?: string | null
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
          manager_id: string | null
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
          manager_id?: string | null
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
          manager_id?: string | null
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
          extra_payment: number
          completed_at: string | null
          note: string | null
          pending_completion: boolean
          pending_completion_by: string | null
          pending_completion_at: string | null
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
          extra_payment?: number
          completed_at?: string | null
          note?: string | null
          pending_completion?: boolean
          pending_completion_by?: string | null
          pending_completion_at?: string | null
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
          extra_payment?: number
          completed_at?: string | null
          note?: string | null
          pending_completion?: boolean
          pending_completion_by?: string | null
          pending_completion_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      project_assistants: {
        Row: {
          id: string
          project_id: string
          profile_id: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          profile_id: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          profile_id?: string
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
          name: string
          role: string | null
          company: string | null
          phone: string | null
          email: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          role?: string | null
          company?: string | null
          phone?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          role?: string | null
          company?: string | null
          phone?: string | null
          email?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          priority: 'critical' | 'high' | 'normal' | 'low'
          status: 'open' | 'in_progress' | 'waiting' | 'done'
          urgency: 'today' | 'week' | 'later'
          deadline: string | null
          contact_id: string | null
          waiting_on_contact_id: string | null
          phase: 'planning' | 'approvals' | 'client_decisions' | 'submission'
          party: 'internal' | 'client' | 'authority' | 'consultants'
          tags: string[]
          subtasks: { text: string; done: boolean }[]
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          priority?: 'critical' | 'high' | 'normal' | 'low'
          status?: 'open' | 'in_progress' | 'waiting' | 'done'
          urgency?: 'today' | 'week' | 'later'
          deadline?: string | null
          contact_id?: string | null
          waiting_on_contact_id?: string | null
          phase?: 'planning' | 'approvals' | 'client_decisions' | 'submission'
          party?: 'internal' | 'client' | 'authority' | 'consultants'
          tags?: string[]
          subtasks?: { text: string; done: boolean }[]
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          priority?: 'critical' | 'high' | 'normal' | 'low'
          status?: 'open' | 'in_progress' | 'waiting' | 'done'
          urgency?: 'today' | 'week' | 'later'
          deadline?: string | null
          contact_id?: string | null
          waiting_on_contact_id?: string | null
          phase?: 'planning' | 'approvals' | 'client_decisions' | 'submission'
          party?: 'internal' | 'client' | 'authority' | 'consultants'
          tags?: string[]
          subtasks?: { text: string; done: boolean }[]
          created_at?: string
          completed_at?: string | null
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
      requirement_steps: {
        Row: {
          id: string
          requirement_id: string
          project_id: string
          detail: string
          step_date: string | null
          done: boolean
          order_index: number
          notes: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          requirement_id: string
          project_id: string
          detail?: string
          step_date?: string | null
          done?: boolean
          order_index?: number
          notes?: string
          status?: string
        }
        Update: {
          id?: string
          detail?: string
          step_date?: string | null
          done?: boolean
          order_index?: number
          notes?: string
          status?: string
        }
        Relationships: []
      }
      todos: {
        Row: {
          id: string
          task: string
          project_id: string | null
          project_title: string
          source_requirement_id: string | null
          done: boolean
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task: string
          project_id?: string | null
          project_title: string
          source_requirement_id?: string | null
          done?: boolean
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task?: string
          project_id?: string | null
          project_title?: string
          source_requirement_id?: string | null
          done?: boolean
          created_by?: string | null
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
export type ProjectTask = Database['public']['Tables']['project_tasks']['Row']
export type ProjectFile = Database['public']['Tables']['project_files']['Row']
export type Todo = Database['public']['Tables']['todos']['Row']

// Task domain value types
export type TaskPriority = 'critical' | 'high' | 'normal' | 'low'
export type TaskStatus = 'open' | 'in_progress' | 'waiting' | 'done'
export type TaskUrgency = 'today' | 'week' | 'later'
export type TaskPhase = 'planning' | 'approvals' | 'client_decisions' | 'submission'
export type TaskParty = 'internal' | 'client' | 'authority' | 'consultants'
export type Subtask = { text: string; done: boolean }

export interface RequirementStep {
  id: string
  requirement_id: string
  project_id: string
  detail: string
  step_date: string | null
  done: boolean
  order_index: number
  notes: string
  status: string
  created_at: string
}

// Joined types used in queries
export type ProjectAssistant = Database['public']['Tables']['project_assistants']['Row']

export type ProjectWithClient = Project & {
  client: Client | null
  creator?: Pick<Profile, 'full_name'> | null
  manager?: Pick<Profile, 'id' | 'full_name'> | null
}

export type ClientWithProjects = Client & {
  projects: Project[]
}
