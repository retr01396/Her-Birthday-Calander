import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { AdminClubCreateForm } from "./AdminClubCreateForm";

export default async function AdminCreateClubPage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser || sessionUser.role !== "SUPER_ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen max-w-3xl mx-auto px-4 py-12 pb-20">
      <h1 className="text-3xl font-bold mb-8">Create New Club & Credentials</h1>
      <AdminClubCreateForm />
    </div>
  );
}
