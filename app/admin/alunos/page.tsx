import { StudentsManager } from "@/components/admin/students-manager";
import { getAdminStudents } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminStudentsPage() {
  const students = await getAdminStudents();
  return <StudentsManager students={students} />;
}
