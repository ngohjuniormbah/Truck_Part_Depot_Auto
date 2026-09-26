-- Truck Parts Depot Auto: image storage setup
-- Run this ONCE in Supabase Dashboard -> SQL Editor.
-- Safe to re-run.
--
-- Why: product/gallery photos were being stored as base64 text directly in
-- the products/gallery rows. Large multi-photo payloads could silently fail
-- to save (the app fell back to writing the row WITHOUT the images field,
-- with no visible error), so extra photos vanished after refresh. This
-- creates a real object-storage bucket so photos are uploaded as files and
-- only a small public URL is stored in the database row — which always
-- fits, and is dramatically faster to load on the storefront too.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Matches the current app's security model: the admin area is gated by a
-- client-side password only (no server-side auth), same as the existing
-- "RLS disabled" setup on your tables — so storage needs public read AND
-- public write for uploads from the admin page to work. If you later add
-- real Supabase Auth for the admin login, tighten the insert/update/delete
-- policies below to `auth.role() = 'authenticated'` instead of `true`.

drop policy if exists "Public read product images" on storage.objects;
create policy "Public read product images"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

drop policy if exists "Public upload product images" on storage.objects;
create policy "Public upload product images"
  on storage.objects for insert
  with check ( bucket_id = 'product-images' );

drop policy if exists "Public update product images" on storage.objects;
create policy "Public update product images"
  on storage.objects for update
  using ( bucket_id = 'product-images' );

drop policy if exists "Public delete product images" on storage.objects;
create policy "Public delete product images"
  on storage.objects for delete
  using ( bucket_id = 'product-images' );
