import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { ClubSetupWizard } from "./ClubSetupWizard";

export default async function ClubSetupPage() {
  const sessionUser = await getCurrentUser();

  if (!sessionUser) {
    redirect("/");
  }

  // Only the club's own account can complete its setup wizard.
  if (sessionUser.role !== "CLUB" || !sessionUser.clubId) {
    redirect("/");
  }

  const club = await prisma.club.findUnique({
    where: { id: sessionUser.clubId },
  });

  if (!club) {
    redirect("/");
  }

  // A published club has nothing left to set up — go to the dashboard.
  if (club.status === "PUBLISHED") {
    redirect("/club/dashboard");
  }

  return (
    <div className="min-h-screen bg-canvas text-on-surface font-body-md">
      <Navbar userRole="CLUB" userName={club.name} userEmail={club.username} />
      <main className="max-w-3xl mx-auto px-4 md:px-6 pt-28 pb-20">
        <ClubSetupWizard club={club} />
      </main>
    </div>
  );
}
