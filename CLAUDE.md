# eniCarter — Project Memory

Tattoo artist portfolio site for Enikő Kocsis (Tinywitch.ttt).
Vue 3 + Vite + TypeScript + Tailwind CSS 4 + Supabase.

## Stack
- **Frontend:** Vue 3 (Composition API), Vite 7, TypeScript 5, Tailwind CSS 4
- **Backend:** Supabase (Auth, Postgres, Storage, Edge Functions)
- **Email:** Resend (via Supabase Edge Function)
- **Router:** Vue Router 4

## Active branch
`claude/project-status-review-71Wxv`

---

## What's been built

| Area | Status |
|---|---|
| Firebase removed, Supabase wired in | ✅ Done |
| Vue Router (`/`, `/admin`, `/admin/login`, `/blog/:slug`) | ✅ Done |
| ContactForm → Supabase `contacts` table | ✅ Done |
| WorkSection → loads gallery from Supabase Storage (local fallback) | ✅ Done |
| Admin login (Supabase email/password auth) | ✅ Done |
| Admin gallery manager (upload/delete per category) | ✅ Done |
| Admin blog editor (CRUD, cover image, inline images, markdown) | ✅ Done |
| Blog section on home page + `/blog/:slug` full post view | ✅ Done |
| Resend email notification (Supabase Edge Function) | ✅ Done |

---

## What still needs to happen before going live

### 1. Supabase project setup (client does this once)
- Create a Supabase project at supabase.com
- Run `supabase/migration.sql` in the SQL editor — creates all tables, RLS, and storage bucket instructions
- Create the two storage buckets manually in the dashboard (Storage tab): `gallery` (public) and `blog` (public), with the RLS policies in the migration file comments
- Create an admin user in Authentication → Users (email + password)
- Add `.env.local` with:
  ```
  VITE_SUPABASE_URL=https://xxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJ...
  ```

### 2. Resend setup (client does this once)
- Create account at resend.com, verify their domain
- Set Supabase secrets:
  ```bash
  supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
  supabase secrets set CONTACT_TO_EMAIL=enitatts@gmail.com
  supabase secrets set CONTACT_FROM_EMAIL=noreply@yourdomain.com
  ```
- Deploy the edge function:
  ```bash
  supabase functions deploy notify-contact
  ```

### 3. Things left to code / polish
- **Email — reply-to domain:** confirm Resend `from` address matches the client's verified domain once they set it up
- **About section images** are still hardcoded local assets — could be moved to Supabase Storage so they're manageable from the admin panel too
- **Blog markdown** uses a lightweight hand-rolled renderer; if the client needs richer formatting (tables, code blocks, etc.) consider adding `marked` or `markdown-it`
- **Image optimisation** — the local design PNGs are large (500 KB–1 MB). Worth adding a Vite image plugin or compressing them before shipping
- **SEO / meta tags** — no `<meta>` tags or Open Graph yet; worth adding per-page titles at minimum
- **Contact submissions inbox** — admin panel currently has no way to *read* contact submissions; could add a third tab to AdminView showing the `contacts` table

---

## Key file map

```
src/
  lib/supabase.ts          — Supabase client
  router/index.ts          — Vue Router (auth guard on /admin)
  views/
    HomeView.vue           — wraps all home-page sections
    AdminView.vue          — tabbed admin shell (gallery + blog)
    AdminLoginView.vue     — Supabase auth login form
    BlogPostView.vue       — full blog post renderer
  components/
    admin/
      AdminGallery.vue     — image upload/delete per category
      AdminBlog.vue        — blog post CRUD + image attachments
    BlogSection.vue        — published post cards on home page
    WorkSection.vue        — gallery (loads from Supabase, falls back to local)
    ContactForm.vue        — writes to contacts table + invokes edge function
supabase/
  migration.sql            — run in Supabase SQL editor
  functions/
    notify-contact/
      index.ts             — Deno edge function → Resend API
```
