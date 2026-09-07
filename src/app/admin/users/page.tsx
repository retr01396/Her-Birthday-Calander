import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import {
  getAdminUsersList,
  getDepartmentsList,
  getTotalUserCount,
} from "@/app/actions/adminUsers";
import AdminStudentsClient from "./AdminStudentsClient";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  const [users, departments, totalCount] = await Promise.all([
    getAdminUsersList({}),
    getDepartmentsList(),
    getTotalUserCount(),
  ]);

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <div className="max-w-container-max mx-auto px-margin-page py-10">
        <div className="mb-10">
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            Student Management
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="font-label-mono text-label-mono text-muted uppercase tracking-widest">
              {totalCount.toLocaleString()} Registered Students
            </p>
          </div>
        </div>

        <AdminStudentsClient
          initialUsers={users}
          departments={departments}
          totalCount={totalCount}
        />
      </div>
    </main>
  );
}
