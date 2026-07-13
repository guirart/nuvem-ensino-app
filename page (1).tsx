import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/layout/service-worker-register";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "NU.V.E.M Ensino",
    template: "%s | NU.V.E.M Ensino",
  },
  description: "Plataforma de formação médica da NU.V.E.M Ensino.",
  applicationName: "NU.V.E.M Ensino",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NU.V.E.M Ensino",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#17313b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
