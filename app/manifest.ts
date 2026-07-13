import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NU.V.E.M Ensino",
    short_name: "NU.V.E.M",
    description: "Cursos e aulas para profissionais da saúde.",
    start_url: "/aluno",
    display: "standalone",
    background_color: "#f4f7f7",
    theme_color: "#17313b",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
