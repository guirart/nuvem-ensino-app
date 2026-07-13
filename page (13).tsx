import { redirect } from "next/navigation";
import { StudentShell } from "@/components/layout/student-shell";
import { getCurrentUser } from "@/lib/auth";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <StudentShell user={user}>{children}</StudentShell>;
}
