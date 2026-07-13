-- Dados ilustrativos. Execute após schema.sql apenas se quiser uma base de teste.
insert into public.courses (slug, title, short_title, description, workload_minutes, status)
values
  ('aperfeicoamento-dici', 'Aperfeiçoamento em DICI: Neurogastroenterologia e Métodos Diagnósticos', 'Aperfeiçoamento em DICI', 'Formação aprofundada em distúrbios da interação cérebro-intestino.', 5760, 'published'),
  ('microbiota-na-pratica', 'Microbiota na Prática do Gastroenterologista', 'Microbiota na Prática', 'Aplicação clínica baseada em evidências.', 300, 'published'),
  ('teste-respiratorio-hidrogenio-metano', 'Teste Respiratório de Hidrogênio e Metano', 'Teste Respiratório H₂ e CH₄', 'Fundamentos e interpretação dos testes respiratórios.', 120, 'published')
on conflict (slug) do nothing;
