-- ============================================================
-- eniCarter — Supabase migration
-- Run this in the Supabase SQL editor to set up the project.
-- ============================================================

-- ── contacts ────────────────────────────────────────────────
create table if not exists contacts (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  message     text not null,
  created_at  timestamptz not null default now()
);

-- Anyone may insert a contact submission; only authenticated users may read them.
alter table contacts enable row level security;
create policy "public insert contacts"  on contacts for insert with check (true);
create policy "admin read contacts"     on contacts for select using (auth.role() = 'authenticated');

-- ── gallery_images ───────────────────────────────────────────
-- category: 'fresh' | 'designs'
create table if not exists gallery_images (
  id            uuid primary key default gen_random_uuid(),
  category      text not null check (category in ('fresh', 'designs')),
  storage_path  text not null,          -- path inside the 'gallery' bucket
  display_name  text,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now()
);

alter table gallery_images enable row level security;
create policy "public read gallery"       on gallery_images for select using (true);
create policy "admin insert gallery"      on gallery_images for insert with check (auth.role() = 'authenticated');
create policy "admin update gallery"      on gallery_images for update using (auth.role() = 'authenticated');
create policy "admin delete gallery"      on gallery_images for delete using (auth.role() = 'authenticated');

-- ── blog_posts ───────────────────────────────────────────────
create table if not exists blog_posts (
  id                uuid primary key default gen_random_uuid(),
  title             text not null,
  slug              text not null unique,
  content           text not null default '',
  cover_image_path  text,               -- path inside the 'blog' bucket (nullable)
  published         boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table blog_posts enable row level security;
create policy "public read published posts"  on blog_posts for select using (published = true);
create policy "admin full access posts"      on blog_posts for all using (auth.role() = 'authenticated');

-- auto-update updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger blog_posts_updated_at
  before update on blog_posts
  for each row execute procedure set_updated_at();

-- ── blog_post_images ─────────────────────────────────────────
create table if not exists blog_post_images (
  id            uuid primary key default gen_random_uuid(),
  post_id       uuid not null references blog_posts(id) on delete cascade,
  storage_path  text not null,          -- path inside the 'blog' bucket
  created_at    timestamptz not null default now()
);

alter table blog_post_images enable row level security;
create policy "public read post images"   on blog_post_images for select using (true);
create policy "admin manage post images"  on blog_post_images for all using (auth.role() = 'authenticated');

-- ── Storage buckets ──────────────────────────────────────────
-- Run these in the Supabase dashboard → Storage, or via the API.
-- Both buckets are public so their files can be served via public URLs.
--
-- insert into storage.buckets (id, name, public) values ('gallery', 'gallery', true);
-- insert into storage.buckets (id, name, public) values ('blog',    'blog',    true);
--
-- Storage RLS (gallery bucket):
-- create policy "public read gallery storage"   on storage.objects for select using (bucket_id = 'gallery');
-- create policy "admin write gallery storage"   on storage.objects for insert with check (bucket_id = 'gallery' and auth.role() = 'authenticated');
-- create policy "admin delete gallery storage"  on storage.objects for delete using (bucket_id = 'gallery' and auth.role() = 'authenticated');
--
-- Storage RLS (blog bucket):
-- create policy "public read blog storage"      on storage.objects for select using (bucket_id = 'blog');
-- create policy "admin write blog storage"      on storage.objects for insert with check (bucket_id = 'blog' and auth.role() = 'authenticated');
-- create policy "admin delete blog storage"     on storage.objects for delete using (bucket_id = 'blog' and auth.role() = 'authenticated');
