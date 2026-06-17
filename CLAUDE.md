# eniCarter — Project Memory

Tattoo artist portfolio site for Enikő Kocsis (Tinywitch.ttt).
Vue 3 + Vite + TypeScript + Tailwind CSS 4 + Supabase.

## Stack
- **Frontend:** Vue 3 (Composition API), Vite 7, TypeScript 5, Tailwind CSS 4
- **Backend:** Supabase (Auth, Postgres, Storage, Edge Functions)
- **Email:** Resend (via Supabase Edge Function)
- **Router:** Vue Router 5
- **Markdown:** `marked`

## Branch policy
Small project — **push directly to `main`**. No feature-branch workflow needed.

## Conventions
- **No placeholder text on form inputs, anywhere in the app.** Use a visible `<label>`
  for every field instead of an input `placeholder`. Applies to all current and future
  forms (login, contact, admin editors, etc.).

---

## What's been built

| Area | Status |
|---|---|
| Firebase removed, Supabase wired in | ✅ Done |
| Vue Router (`/`, `/blog`, `/blog/:slug`, `/admin`, 404 catch-all) | ✅ Done |
| Per-route document titles | ✅ Done |
| ContactForm → Supabase `contacts` table | ✅ Done |
| Resend email via edge function `send-contact-email` (branded `contact@tinywitchttt.com`) | ✅ Done |
| Gallery served exclusively from Supabase Storage (local fallback removed) | ✅ Done |
| Images optimized to WebP, auto-convert on admin upload | ✅ Done |
| Admin panel (`/admin`) — gallery + blog management | ✅ Done |
| Admin auth: email + password login (`signInWithPassword`), public signups disabled, two seeded accounts | ✅ Done |
| Blog: list view (`/blog`), full post view (`/blog/:slug`), cover images | ✅ Done |
| SEO: meta tags, social share image (1.91:1 crop), canonical domain, favicon, sitemap, SPA redirect | ✅ Done |
| Guard against missing Supabase env vars (no blank-page crash) | ✅ Done |
| Footer link to `/admin` (underlined, styled like copyright text) | ✅ Done |
| 45 unused image assets pruned | ✅ Done |

---

## What still needs to happen before going live

### 0. ✅ DONE (2026-06-17) — Admin auth is now email + password, signups disabled
Magic-link auth (`signInWithOtp`, `shouldCreateUser` defaulted true → anyone could
self-provision an `/admin` account) has been replaced with `signInWithPassword`.
- `AdminView.vue` shows a login-only form (email + password); no signup UI exists.
- Two accounts are seeded with passwords: `enitatts@gmail.com` (client) and
  `krsnmth@gmail.com` (dev). Both email-confirmed.
- Public signups disabled in Supabase Auth (`disable_signup: true`, verified via
  `/auth/v1/settings`), so `/admin` is limited to those two accounts. New accounts
  must be added manually in Supabase → Authentication → Users.
- Supabase MCP server wired into `.mcp.json` (OAuth) for DB/admin tasks.

### 1. Supabase project setup (client does this once)
- Create a Supabase project at supabase.com
- Run the migrations in `supabase/migrations/` (in order) in the SQL editor
- Create storage buckets per the migration comments
- Create an admin user in Authentication → Users (email + password)
- Add `.env.local`:
  ```
  VITE_SUPABASE_URL=https://xxxx.supabase.co
  VITE_SUPABASE_ANON_KEY=eyJ...
  ```

### 2. Resend setup (client does this once)
- Create account at resend.com, verify `tinywitchttt.com`
- Set Supabase secrets:
  ```bash
  supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
  supabase secrets set CONTACT_NOTIFY_EMAIL=enitatts@gmail.com
  ```
- Deploy: `supabase functions deploy send-contact-email`

### 2.5 Placeholder blog post (delete when no longer needed)
A published placeholder post exists purely as a layout test bed for `BlogPostView.vue`:
slug `madarak-es-mehek` ("A madarak és a méhek"), ~238-char Hungarian body with an `##`
subheading + italic, plus a cover image. Created directly in the DB. Remove it via
`/admin` → Blog → delete once the real first post is written / layout work is done.

### 3. Possible follow-ups
- **About section images** are still hardcoded local assets — could move to Supabase Storage so they're admin-manageable too
- **Contact submissions inbox** — admin panel has no way to *read* `contacts` table entries yet; could add a tab to AdminView
- Re-check `npm audit` periodically (already patched once)

---

## Key file map

```
src/
  lib/
    supabase.ts             — Supabase client
    image.ts                — WebP conversion helpers
  router/index.ts            — Vue Router + per-route document titles
  views/
    HomeView.vue            — wraps all home-page sections
    BlogView.vue            — blog list page
    BlogPostView.vue        — full blog post renderer
    AdminView.vue           — admin shell (gallery + blog management)
    NotFoundView.vue        — 404 catch-all
  components/
    WorkSection.vue / AboutSection.vue / ContactForm.vue / Footer.vue / Navbar.vue
    HeaderSection.vue / ImageCarousel.vue / ImageCarouselFullScreen.vue / SectionTitle.vue / Button.vue
supabase/
  migrations/
    001_initial.sql
    002_post_cover_image.sql
  functions/
    send-contact-email/
      index.ts              — Deno edge function → Resend API
```
