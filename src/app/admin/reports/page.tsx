import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import AdminReportsClient from "./AdminReportsClient";

export default async function AdminReportsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#f8fafc" }}>
      <Navbar
        userRole={user.role as any}
        userName={user.name}
        userEmail={user.email}
      />
      <div className="max-w-container-max mx-auto px-margin-page pt-32 pb-10">
        <AdminReportsClient />
      </div>
    </main>
  );
}
