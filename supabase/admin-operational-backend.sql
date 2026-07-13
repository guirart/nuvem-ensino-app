-- NU.V.E.M Ensino — migração do painel administrativo operacional
-- Execute no SQL Editor depois do schema principal.

-- 1) Segurança de perfis: usuários comuns não podem se promover a administradores.
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "admins_update_profiles" on public.profiles;

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = public.current_user_role()
);

create policy "admins_update_profiles"
on public.profiles
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 2) Professores vinculados aos cursos.
alter table public.course_instructors enable row level security;

drop policy if exists "course_instructors_visible" on public.course_instructors;
drop policy if exists "admins_manage_course_instructors" on public.course_instructors;

create policy "course_instructors_visible"
on public.course_instructors
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.courses c
    where c.id = course_instructors.course_id
      and c.status = 'published'
      and public.has_active_enrollment(c.id)
  )
);

create policy "admins_manage_course_instructors"
on public.course_instructors
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- 3) Atualização automática de updated_at.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
before update on public.courses
for each row execute procedure public.set_updated_at();

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at
before update on public.lessons
for each row execute procedure public.set_updated_at();

drop trigger if exists enrollments_set_updated_at on public.enrollments;
create trigger enrollments_set_updated_at
before update on public.enrollments
for each row execute procedure public.set_updated_at();

drop trigger if exists progress_set_updated_at on public.lesson_progress;
create trigger progress_set_updated_at
before update on public.lesson_progress
for each row execute procedure public.set_updated_at();

-- 4) Índices usados pelas telas e estatísticas administrativas.
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists enrollments_course_status_idx on public.enrollments(course_id, status);
create index if not exists lessons_module_created_idx on public.lessons(module_id, created_at desc);
create index if not exists progress_completed_idx on public.lesson_progress(user_id, completed);

-- 5) Garante que a política de inserção de perfis continue restrita ao trigger/service role.
-- Não é criada política pública de INSERT em profiles.
