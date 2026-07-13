-- NU.V.E.M Ensino — schema inicial
-- Execute no SQL Editor do Supabase em um projeto novo.

create extension if not exists pgcrypto;

create type public.user_role as enum ('student', 'instructor', 'admin');
create type public.course_status as enum ('draft', 'published', 'archived');
create type public.enrollment_status as enum ('pending', 'active', 'completed', 'cancelled', 'expired');
create type public.lesson_type as enum ('video', 'live', 'material', 'quiz');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  crm text,
  phone text,
  specialty text,
  role public.user_role not null default 'student',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_title text,
  description text,
  workload_minutes integer not null default 0,
  cover_url text,
  status public.course_status not null default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_instructors (
  course_id uuid references public.courses(id) on delete cascade,
  instructor_id uuid references public.profiles(id) on delete cascade,
  primary key (course_id, instructor_id)
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  position integer not null default 0,
  release_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  lesson_type public.lesson_type not null default 'video',
  position integer not null default 0,
  duration_seconds integer not null default 0,
  video_asset_id text,
  is_preview boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'pending',
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  watched_seconds integer not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  last_watched_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  storage_path text not null,
  created_at timestamptz not null default now(),
  check (lesson_id is not null or course_id is not null)
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  verification_code text not null unique default encode(gen_random_bytes(10), 'hex'),
  issued_at timestamptz not null default now(),
  file_path text,
  unique (user_id, course_id)
);

create index modules_course_position_idx on public.modules(course_id, position);
create index lessons_module_position_idx on public.lessons(module_id, position);
create index enrollments_user_status_idx on public.enrollments(user_id, status);
create index progress_user_lesson_idx on public.lesson_progress(user_id, lesson_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, crm)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'crm', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_active_enrollment(target_course_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.enrollments
    where user_id = auth.uid()
      and course_id = target_course_id
      and status in ('active', 'completed')
      and (expires_at is null or expires_at > now())
  );
$$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_instructors enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.materials enable row level security;
alter table public.certificates enable row level security;

create policy "profiles_select_own_or_admin" on public.profiles
for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin" on public.profiles
for update using (id = auth.uid() or public.is_admin());

create policy "published_courses_visible" on public.courses
for select using (status = 'published' or public.is_admin());

create policy "admins_manage_courses" on public.courses
for all using (public.is_admin()) with check (public.is_admin());

create policy "modules_visible_to_enrolled" on public.modules
for select using (
  public.is_admin() or public.has_active_enrollment(course_id)
);

create policy "admins_manage_modules" on public.modules
for all using (public.is_admin()) with check (public.is_admin());

create policy "lessons_visible_to_enrolled" on public.lessons
for select using (
  public.is_admin() or exists (
    select 1 from public.modules m
    where m.id = lessons.module_id
      and public.has_active_enrollment(m.course_id)
      and (m.release_at is null or m.release_at <= now())
  )
);

create policy "admins_manage_lessons" on public.lessons
for all using (public.is_admin()) with check (public.is_admin());

create policy "enrollments_select_own_or_admin" on public.enrollments
for select using (user_id = auth.uid() or public.is_admin());

create policy "admins_manage_enrollments" on public.enrollments
for all using (public.is_admin()) with check (public.is_admin());

create policy "progress_select_own_or_admin" on public.lesson_progress
for select using (user_id = auth.uid() or public.is_admin());

create policy "progress_insert_own" on public.lesson_progress
for insert with check (user_id = auth.uid());

create policy "progress_update_own" on public.lesson_progress
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "materials_visible_to_enrolled" on public.materials
for select using (
  public.is_admin() or
  (course_id is not null and public.has_active_enrollment(course_id)) or
  (lesson_id is not null and exists (
    select 1 from public.lessons l
    join public.modules m on m.id = l.module_id
    where l.id = materials.lesson_id and public.has_active_enrollment(m.course_id)
  ))
);

create policy "admins_manage_materials" on public.materials
for all using (public.is_admin()) with check (public.is_admin());

create policy "certificates_select_own_or_admin" on public.certificates
for select using (user_id = auth.uid() or public.is_admin());

create policy "admins_manage_certificates" on public.certificates
for all using (public.is_admin()) with check (public.is_admin());

-- ================================================================
-- Upload protegido de aulas pelo painel administrativo
-- ================================================================
alter table public.lessons add column if not exists video_provider text not null default 'supabase';
alter table public.lessons add column if not exists video_storage_path text;
create index if not exists lessons_video_storage_path_idx on public.lessons(video_storage_path) where video_storage_path is not null;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values ('course-videos', 'course-videos', false, 5368709120, array['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska']) on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
create or replace function public.can_access_course_video(object_name text) returns boolean language sql stable security definer set search_path = public as $$ select public.is_admin() or exists (select 1 from public.enrollments e where e.user_id = auth.uid() and e.course_id::text = split_part(object_name, '/', 1) and e.status in ('active', 'completed') and (e.expires_at is null or e.expires_at > now())); $$;
revoke all on function public.can_access_course_video(text) from public;
grant execute on function public.can_access_course_video(text) to authenticated;
create policy "admins_insert_course_videos" on storage.objects for insert to authenticated with check (bucket_id = 'course-videos' and public.is_admin());
create policy "admins_update_course_videos" on storage.objects for update to authenticated using (bucket_id = 'course-videos' and public.is_admin()) with check (bucket_id = 'course-videos' and public.is_admin());
create policy "admins_delete_course_videos" on storage.objects for delete to authenticated using (bucket_id = 'course-videos' and public.is_admin());
create policy "enrolled_users_select_course_videos" on storage.objects for select to authenticated using (bucket_id = 'course-videos' and public.can_access_course_video(name));
