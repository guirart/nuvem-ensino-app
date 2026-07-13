import { EnrollmentsManager } from "@/components/admin/enrollments-manager";
import { getAdminCourses, getAdminEnrollments, getAdminStudents } from "@/lib/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminEnrollmentsPage() {
  const [enrollments, students, courses] = await Promise.all([
    getAdminEnrollments(),
    getAdminStudents(),
    getAdminCourses(),
  ]);
  return <EnrollmentsManager enrollments={enrollments} students={students} courses={courses} />;
}
