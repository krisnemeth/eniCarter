-- Add an optional cover image (public Storage URL) to blog posts.
-- The image is uploaded from the admin blog editor into the `gallery`
-- bucket under a `blog/` prefix, and its public URL is stored here.

alter table public.posts
  add column if not exists cover_image text;
