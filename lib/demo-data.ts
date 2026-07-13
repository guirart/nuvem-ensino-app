import type { Certificate, Course, Module } from "@/lib/types";

export const demoUser = {
  id: "demo-user",
  name: "Dr. Rafael Andrade",
  email: "medico@nuvemensino.com.br",
  role: "admin" as const,
  crm: "CRM-MG 000000",
};

export const courses: Course[] = [
  {
    id: "course-dici",
    slug: "aperfeicoamento-dici",
    title: "Aperfeiçoamento em DICI: Neurogastroenterologia e Métodos Diagnósticos",
    shortTitle: "Aperfeiçoamento em DICI",
    instructor: "Dra. Vera Ângelo",
    category: "Neurogastroenterologia",
    description:
      "Formação aprofundada em distúrbios da interação cérebro-intestino, investigação diagnóstica e aplicação clínica.",
    duration: "96 h",
    progress: 42,
    totalLessons: 24,
    completedLessons: 10,
    nextLessonId: "lesson-3",
    nextLessonTitle: "Eixo cérebro-intestino e mecanismos de sensibilização",
    accent: "linear-gradient(145deg, #174652, #21869a)",
    status: "active",
  },
  {
    id: "course-microbiota",
    slug: "microbiota-na-pratica",
    title: "Microbiota na Prática do Gastroenterologista",
    shortTitle: "Microbiota na Prática",
    instructor: "Dra. Vera Ângelo",
    category: "Gastroenterologia",
    description:
      "Aplicação crítica e baseada em evidências do conhecimento sobre microbiota na prática clínica.",
    duration: "5 h",
    progress: 75,
    totalLessons: 8,
    completedLessons: 6,
    nextLessonId: "micro-7",
    nextLessonTitle: "Probióticos: indicação e limites da evidência",
    accent: "linear-gradient(145deg, #315b4f, #4b8a76)",
    status: "active",
  },
  {
    id: "course-respiratorio",
    slug: "teste-respiratorio-hidrogenio-metano",
    title: "Teste Respiratório de Hidrogênio e Metano",
    shortTitle: "Teste Respiratório H₂ e CH₄",
    instructor: "Dra. Vera Ângelo",
    category: "Métodos diagnósticos",
    description:
      "Fundamentos, indicações, preparo, interpretação e armadilhas dos testes respiratórios.",
    duration: "2 h",
    progress: 100,
    totalLessons: 5,
    completedLessons: 5,
    nextLessonId: "resp-5",
    nextLessonTitle: "Conclusão",
    accent: "linear-gradient(145deg, #5b4778, #8a6aa9)",
    status: "completed",
  },
];

export const modulesByCourse: Record<string, Module[]> = {
  "aperfeicoamento-dici": [
    {
      id: "module-1",
      title: "Fundamentos dos DICI",
      order: 1,
      released: true,
      lessons: [
        {
          id: "lesson-1",
          moduleId: "module-1",
          title: "Boas-vindas e organização do curso",
          duration: "12 min",
          type: "video",
          completed: true,
        },
        {
          id: "lesson-2",
          moduleId: "module-1",
          title: "Critérios de Roma IV e raciocínio clínico",
          duration: "46 min",
          type: "video",
          completed: true,
        },
        {
          id: "lesson-3",
          moduleId: "module-1",
          title: "Eixo cérebro-intestino e mecanismos de sensibilização",
          duration: "58 min",
          type: "video",
          completed: false,
        },
        {
          id: "lesson-4",
          moduleId: "module-1",
          title: "Material complementar: leitura dirigida",
          duration: "PDF",
          type: "material",
          completed: false,
        },
      ],
    },
    {
      id: "module-2",
      title: "Métodos diagnósticos complementares",
      order: 2,
      released: true,
      lessons: [
        {
          id: "lesson-5",
          moduleId: "module-2",
          title: "Manometria esofágica de alta resolução",
          duration: "1 h 14 min",
          type: "video",
          completed: false,
        },
        {
          id: "lesson-6",
          moduleId: "module-2",
          title: "ImpedanciopHmetria: princípios de interpretação",
          duration: "1 h 02 min",
          type: "video",
          completed: false,
        },
      ],
    },
    {
      id: "module-3",
      title: "Aplicação clínica e discussão de casos",
      order: 3,
      released: false,
      releaseLabel: "Liberação em 18 de agosto",
      lessons: [
        {
          id: "lesson-7",
          moduleId: "module-3",
          title: "Discussão de caso: dor abdominal crônica",
          duration: "Ao vivo",
          type: "live",
          completed: false,
          locked: true,
        },
      ],
    },
  ],
  "microbiota-na-pratica": [
    {
      id: "micro-module-1",
      title: "Microbiota e prática clínica",
      order: 1,
      released: true,
      lessons: [
        {
          id: "micro-1",
          moduleId: "micro-module-1",
          title: "Composição e funções da microbiota intestinal",
          duration: "38 min",
          type: "video",
          completed: true,
        },
        {
          id: "micro-7",
          moduleId: "micro-module-1",
          title: "Probióticos: indicação e limites da evidência",
          duration: "44 min",
          type: "video",
          completed: false,
        },
      ],
    },
  ],
  "teste-respiratorio-hidrogenio-metano": [
    {
      id: "resp-module-1",
      title: "Curso completo",
      order: 1,
      released: true,
      lessons: [
        {
          id: "resp-5",
          moduleId: "resp-module-1",
          title: "Conclusão e orientações finais",
          duration: "18 min",
          type: "video",
          completed: true,
        },
      ],
    },
  ],
};

export const certificates: Certificate[] = [
  {
    id: "cert-1",
    courseTitle: "Teste Respiratório de Hidrogênio e Metano",
    issuedAt: "10 de julho de 2026",
    workload: "2 horas",
    status: "available",
  },
  {
    id: "cert-2",
    courseTitle: "Microbiota na Prática do Gastroenterologista",
    issuedAt: "Concluir as aulas restantes",
    workload: "5 horas",
    status: "pending",
  },
];

export function getCourseBySlug(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export function getLessonById(id: string) {
  for (const [courseSlug, modules] of Object.entries(modulesByCourse)) {
    for (const module of modules) {
      const lesson = module.lessons.find((item) => item.id === id);
      if (lesson) {
        return {
          lesson,
          module,
          course: getCourseBySlug(courseSlug),
        };
      }
    }
  }
  return null;
}
