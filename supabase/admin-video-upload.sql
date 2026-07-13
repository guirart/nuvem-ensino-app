-- Integração do painel administrativo com upload protegido de aulas.
-- Execute este arquivo no SQL Editor do Supabase depois de executar schema.sql.

alter table public.lessons
  add column if not exists video_provider text not null default 'supabase';

alter table public.lessons
  add column if not exists video_storage_path text;

create index if not exists lessons_video_storage_path_idx
  on public.lessons(video_storage_path)
  where video_storage_path is not null;

-- Bucket privado. O limite real também depende do plano e das configurações globais do projeto.
insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'course-videos',
  'course-videos',
  false,
  5368709120,
  array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- O primeiro segmento do caminho do vídeo é o ID do curso.
-- Exemplo: curso-id/modulo-id/arquivo.mp4
create or replace function public.can_access_course_video(object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.enrollments e
      where e.user_id = auth.uid()
        and e.course_id::text = split_part(object_name, '/', 1)
        and e.status in ('active', 'completed')
        and (e.expires_at is null or e.expires_at > now())
    );
$$;

revoke all on function public.can_access_course_video(text) from public;
grant execute on function public.can_access_course_video(text) to authenticated;

drop policy if exists "admins_insert_course_videos" on storage.objects;
create policy "admins_insert_course_videos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'course-videos'
  and public.is_admin()
);

drop policy if exists "admins_update_course_videos" on storage.objects;
create policy "admins_update_course_videos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'course-videos'
  and public.is_admin()
)
with check (
  bucket_id = 'course-videos'
  and public.is_admin()
);

drop policy if exists "admins_delete_course_videos" on storage.objects;
create policy "admins_delete_course_videos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'course-videos'
  and public.is_admin()
);

drop policy if exists "enrolled_users_select_course_videos" on storage.objects;
create policy "enrolled_users_select_course_videos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'course-videos'
  and public.can_access_course_video(name)
);

-- Depois de criar sua própria conta no aplicativo, transforme-a em administradora.
-- Troque o e-mail abaixo antes de executar a linha:
-- update public.profiles set role = 'admin' where email = 'SEU_EMAIL@EXEMPLO.COM';
