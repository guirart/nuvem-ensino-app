# NU.V.E.M Ensino — aplicativo de cursos

Plataforma mobile em Next.js para médicos acessarem aulas, materiais, progresso e certificados. Esta versão inclui um painel administrativo funcional para criar cursos, criar módulos e fazer upload de videoaulas.

## Funcionalidade administrativa integrada

A rota `/admin/conteudo` permite:

- criar cursos;
- definir curso como rascunho ou publicado;
- criar módulos e datas de liberação;
- enviar vídeos grandes com upload retomável pelo protocolo TUS;
- acompanhar a porcentagem enviada;
- cadastrar a aula automaticamente no banco;
- listar e excluir aulas;
- acessar o painel também pelo celular.

Os vídeos não passam pela Vercel. O navegador envia diretamente para um bucket privado do Supabase Storage. O aluno recebe uma URL temporária somente quando possui matrícula ativa. O Supabase recomenda uploads retomáveis para arquivos maiores que 6 MB e para conexões instáveis.

## Tecnologias

- Next.js 16 e React 19;
- TypeScript e Tailwind CSS;
- Supabase Auth, Postgres e Storage;
- `tus-js-client` para upload retomável;
- Vercel para deploy;
- PWA instalável.

## Configuração do Supabase

### Projeto novo

1. Crie o projeto no Supabase.
2. Abra **SQL Editor**.
3. Execute `supabase/schema.sql`.

### Projeto que já executou o schema anterior

Execute somente:

```text
supabase/admin-video-upload.sql
```

Esse arquivo adiciona os campos de vídeo, cria o bucket privado `course-videos` e instala as políticas de segurança.

## Variáveis de ambiente

Adicione na Vercel e em `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICA
NEXT_PUBLIC_APP_URL=https://SEU-PROJETO.vercel.app
```

Não coloque chaves no GitHub.

## Criar o primeiro administrador

1. Faça o cadastro normalmente no aplicativo.
2. Abra `supabase/PROMOVER-ADMIN.sql`.
3. Troque `SEU_EMAIL@EXEMPLO.COM` pelo e-mail cadastrado.
4. Execute no SQL Editor.
5. Saia e entre novamente.

O menu **Painel administrativo** aparecerá na área do aluno.

## Enviar a primeira aula

1. Abra `/admin/conteudo`.
2. Crie o curso.
3. Crie um módulo.
4. Selecione curso e módulo.
5. Informe título, descrição, ordem e duração.
6. Escolha o arquivo de vídeo.
7. Clique em **Enviar aula**.

O vídeo é salvo em:

```text
course-videos/{courseId}/{moduleId}/{arquivo}
```

## Fazer a aula aparecer para um aluno

O curso precisa estar com status `published`. O aluno também precisa possuir um registro na tabela `enrollments` com status `active` ou `completed` e prazo ainda válido.

## Desenvolvimento local

Requisitos: Node.js 24.x.

```bash
npm install
npm run dev
```

Validação:

```bash
npm run typecheck
npm run build
```

## Segurança

- o bucket de vídeos é privado;
- somente perfis `admin` podem inserir, alterar ou excluir vídeos;
- alunos só podem gerar uma URL temporária quando possuem matrícula ativa;
- a role é conferida no servidor e nas políticas RLS;
- nenhum segredo é incluído no navegador;
- `controlsList="nodownload"` reduz o download casual, mas nenhuma plataforma web consegue impedir completamente gravação de tela.
