-- 1. Crie sua conta normalmente pelo aplicativo.
-- 2. Troque o e-mail abaixo pelo e-mail usado no cadastro.
-- 3. Execute esta linha no SQL Editor do Supabase.

update public.profiles
set role = 'admin', updated_at = now()
where email = 'SEU_EMAIL@EXEMPLO.COM';

-- Confirme o resultado:
select id, full_name, email, role
from public.profiles
where email = 'SEU_EMAIL@EXEMPLO.COM';
