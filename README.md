# NU.V.E.M Ensino — aplicativo de cursos

Base inicial de uma plataforma mobile para médicos acessarem aulas, materiais, progresso e certificados da NU.V.E.M Ensino.

## O que já está pronto

- Next.js com TypeScript e App Router;
- interface responsiva para celular e desktop;
- PWA instalável na tela inicial;
- login, cadastro e recuperação de senha;
- integração preparada para Supabase Auth;
- área do aluno com cursos, módulos, aulas, progresso, perfil e certificados;
- painel administrativo demonstrativo;
- endpoint para registrar conclusão de aula;
- schema SQL com usuários, cursos, módulos, aulas, matrículas, progresso, materiais e certificados;
- políticas iniciais de Row Level Security;
- deploy compatível com Vercel;
- CI pelo GitHub Actions.

## Modo demonstração

O projeto abre e funciona sem banco configurado. Nesse modo, use o login já preenchido e clique em **Entrar**. Os dados são demonstrativos e ficam em `lib/demo-data.ts`.

Esse modo permite publicar um primeiro preview na Vercel antes de contratar ou configurar os demais serviços.

## Rodar localmente

Requisitos: Node.js 20.9 ou superior.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

Para validar antes de publicar:

```bash
npm run typecheck
npm run build
```

## Enviar ao repositório já criado

O repositório de destino é:

```text
https://github.com/guirart/nuvem-ensino-app
```

### Opção 1 — Git pelo terminal

Baixe e extraia este projeto. Dentro da pasta extraída, execute:

```bash
git init
git branch -M main
git remote add origin https://github.com/guirart/nuvem-ensino-app.git
git add .
git commit -m "feat: estrutura inicial da plataforma NU.V.E.M Ensino"
git push -u origin main
```

Caso o repositório já tenha um README criado no GitHub, faça antes:

```bash
git pull origin main --allow-unrelated-histories
```

Resolva eventual conflito, confirme o commit e depois execute o `git push`.

### Opção 2 — Upload pelo GitHub

Abra o repositório, clique em **Add file → Upload files**, arraste todo o conteúdo da pasta e confirme em **Commit changes**. Não envie a pasta externa como um único diretório; `package.json` deve ficar na raiz do repositório.

## Configurar o Supabase

1. Crie um projeto no Supabase.
2. Abra **SQL Editor**.
3. Execute `supabase/schema.sql`.
4. Opcionalmente, execute `supabase/seed.sql`.
5. Em **Project Settings → API**, copie a URL do projeto e a chave pública.
6. Copie `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

7. Preencha:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

A chave `SUPABASE_SERVICE_ROLE_KEY` só deve ser usada em rotas administrativas no servidor e nunca no navegador.

### Tornar o primeiro usuário administrador

Depois que a conta for criada, execute no SQL Editor, substituindo o e-mail:

```sql
update public.profiles
set role = 'admin'
where email = 'seu-email@dominio.com';
```

## Login com Google

1. Crie credenciais OAuth no Google Cloud.
2. Ative o provedor Google em **Supabase → Authentication → Providers**.
3. Adicione a URL de callback informada pelo Supabase no Google Cloud.
4. Em **Authentication → URL Configuration**, configure:
   - Site URL de produção;
   - `http://localhost:3000/auth/callback`;
   - `https://app.nuvemensino.com.br/auth/callback`.

## Publicar na Vercel

1. Entre na Vercel com a conta vinculada ao GitHub.
2. Clique em **Add New → Project**.
3. Importe `guirart/nuvem-ensino-app`.
4. Mantenha o framework detectado como Next.js.
5. Faça o primeiro deploy.
6. Para ativar o banco real, adicione as variáveis em **Settings → Environment Variables**.
7. Em **Settings → Domains**, adicione `app.nuvemensino.com.br`.
8. No provedor de DNS do domínio, crie o registro indicado pela Vercel.

Cada `push` na branch `main` publica uma nova versão de produção. Outras branches geram previews separados.

## Vídeos

O player atual é um protótipo visual. Para produção, use Mux ou Cloudflare Stream. Grave no campo `lessons.video_asset_id` apenas o identificador do vídeo e gere o token de reprodução no servidor depois de confirmar:

- usuário autenticado;
- matrícula ativa;
- curso correto;
- data de liberação do módulo;
- prazo de acesso não expirado.

Não envie vídeos ao GitHub e não exponha links públicos permanentes.

## Próximos passos técnicos

1. Conectar as telas aos dados reais do Supabase.
2. Criar CRUD administrativo de cursos, módulos e aulas.
3. Integrar o checkout atual por webhook para gerar matrículas automaticamente.
4. Integrar Mux ou Cloudflare Stream.
5. Gerar certificados PDF com código de verificação.
6. Adicionar notificações e calendário de aulas ao vivo.
7. Registrar auditoria de alterações administrativas.

## Estrutura principal

```text
app/
  login/
  cadastro/
  aluno/
  admin/
  api/
components/
lib/
public/
supabase/
```

## Segurança

- Não envie `.env.local` ao GitHub.
- Não use a `service_role` em componentes do navegador.
- Mantenha RLS ativa no Supabase.
- Valide matrícula e liberação no servidor, não apenas na interface.
- Use URLs assinadas para vídeos e materiais privados.
- Revise políticas, consentimentos e retenção de dados antes da produção.
