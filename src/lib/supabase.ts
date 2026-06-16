import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Post = {
  id: string
  title: string
  slug: string
  body: string
  published: boolean
  published_at: string | null
  created_at: string
}

export type GalleryImage = {
  id: string
  url: string
  category: 'fresh' | 'designs'
  visible: boolean
  sort_order: number
  created_at: string
}

export type ContactSubmission = {
  id: string
  name: string
  email: string
  message: string
  created_at: string
}
