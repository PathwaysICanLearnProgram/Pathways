export type AppRole = 'admin' | 'counsellor' | 'student'
export type Stage = 'Upper Primary' | 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | 'Form 5'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: AppRole
  active: boolean
  force_password_change: boolean
}

export interface StudentDetails {
  user_id: string
  stage: Stage
  career_focus: string | null
  graduation_year: number | null
  counsellor_id: string | null
  participant_type?: 'student' | 'client'
}

export interface ModuleRow {
  id: string
  slug: string
  category: string
  title: string
  summary: string
  content_md: string
  external_url: string | null
  is_published: boolean
}
