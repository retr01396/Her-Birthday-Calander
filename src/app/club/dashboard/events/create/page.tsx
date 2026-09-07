import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { CreateClubEventPageClient } from "./CreateClubEventPageClient";

export default async function CreateClubEventPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "CLUB" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar
        userRole={user.role as any}
        userName={user.name}
        userEmail={user.email}
      />

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6 lg:px-8">
        <CreateClubEventPageClient />
      </main>
    </div>
  );
}
