import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string

// Guard: if the env vars are missing (e.g. not set on the hosting platform),
// createClient() would throw at import time and crash the whole app into a
// blank page. Instead, warn loudly and fall back to harmless placeholders so
// the site still renders; Supabase-backed features degrade to empty states.
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseConfigured) {
  console.error(
    '[Supabase] Missing VITE_SUPABASE_URL and/or VITE_SUPABASE_PUBLISHABLE_KEY. ' +
      'Set them in your hosting platform’s environment variables and redeploy. ' +
      'Until then, gallery, blog, contact and admin features are unavailable.',
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)

export type Post = {
  id: string
  title: string
  slug: string
  body: string
  cover_image: string | null
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
