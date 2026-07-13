# NU.V.E.M Ensino — aplicativo de cursos

Plataforma mobile em Next.js para médicos acessarem cursos, aulas, materiais, progresso e certificados. Esta versão possui painel administrativo conectado ao Supabase, com CRUD de cursos, módulos, aulas, usuários e matrículas.

## O que está funcional

### Painel administrativo

- visão geral com números calculados diretamente do banco;
- cursos publicados, rascunhos e arquivados;
- professor responsável por curso;
- quantidade real de módulos, aulas e matrículas;
- progresso médio calculado pelas aulas concluídas;
- criação e edição de cursos;
- criação, edição e exclusão de módulos;
- upload retomável de videoaulas;
- edição e exclusão de aulas;
- cadastro, edição e exclusão de usuários;
- perfis de aluno, professor e administrador;
- criação, alteração e exclusão de matrículas;
- validade, status e progresso de cada matrícula;
- busca e filtros em cursos, usuários e matrículas;
- logout, menu mobile e navegação ativa.

### Área do aluno

- login e cadastro pelo Supabase Auth;
- cursos liberados por matrícula;
- módulos com data de liberação;
- player com URL temporária de vídeo privado;
- conclusão de aulas e progresso real;
- perfil e certificados.

## Variáveis da Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_SUA_CHAVE_PUBLICA
NEXT_PUBLIC_APP_URL=https://SEU-APP.vercel.app
SUPABASE_SECRET_KEY=sb_secret_SUA_CHAVE_PRIVADA
```

`SUPABASE_SECRET_KEY` é usada apenas nas rotas do servidor para criar contas, trocar e-mail/senha e excluir usuários. Nunca coloque essa chave em uma variável `NEXT_PUBLIC` e nunca a envie ao GitHub.

Projetos legados também podem usar `SUPABASE_SERVICE_ROLE_KEY` no lugar de `SUPABASE_SECRET_KEY`.

## Banco de dados

Como o schema principal já foi executado, abra o SQL Editor do Supabase e execute:

```text
supabase/admin-operational-backend.sql
```

Essa migração:

- corrige a segurança de alteração de perfis;
- impede que um aluno transforme a própria conta em administrador;
- libera o vínculo real entre professores e cursos;
- cria índices usados pelas estatísticas;
- configura atualização automática de `updated_at`.

## Fluxo administrativo

### Criar curso

```text
/admin/cursos → Novo curso
```

Preencha título, carga horária, status e professor. Depois use **Editar** para alterar os dados e organizar módulos e aulas.

### Enviar aula

```text
/admin/conteudo
```

Crie o curso, crie o módulo, selecione o vídeo e envie. O arquivo vai diretamente para o bucket privado `course-videos` no Supabase Storage.

### Cadastrar usuário

```text
/admin/alunos → Novo usuário
```

O administrador define e-mail, senha temporária e perfil. Essa operação exige `SUPABASE_SECRET_KEY`.

### Criar matrícula

```text
/admin/matriculas → Nova matrícula
```

Escolha o aluno, o curso, o status, a data inicial e a expiração opcional.

## Como as estatísticas são calculadas

- **Cursos:** total de linhas em `courses`;
- **Alunos:** perfis com `role = student`;
- **Matrículas ativas:** status `active` e prazo ainda válido;
- **Aulas:** total de linhas em `lessons`;
- **Progresso de uma matrícula:** aulas concluídas pelo aluno dividido pelo total de aulas do curso;
- **Progresso médio de um curso:** média do progresso das matrículas ativas ou concluídas;
- **Progresso médio geral:** média do progresso de todas as matrículas válidas.

Não existem valores de exemplo nas telas administrativas.

## Desenvolvimento

Requisitos: Node.js 24.x.

```bash
npm install
npm run typecheck
npm run build
npm run dev
```

O workflow do GitHub Actions usa `npm install`, pois o projeto não inclui `package-lock.json`.

## Segurança

- o bucket de vídeos é privado;
- upload e exclusão de vídeos exigem perfil administrativo;
- alunos só acessam vídeos de cursos em que possuem matrícula válida;
- o painel confere a função `admin` no servidor e no RLS;
- criação e exclusão de contas passam por rotas de servidor;
- a chave secreta nunca é entregue ao navegador;
- o perfil do usuário comum não pode alterar a própria `role`.
