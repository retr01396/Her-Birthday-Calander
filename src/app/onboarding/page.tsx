import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OnboardingClient from "./OnboardingClient";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login"); // Sign in lives on the dedicated login pages
  }
  
  if (user.onboardingCompleted) {
    redirect("/dashboard"); // Already completed
  }

  // Pre-fill the academic details the student may have saved on an earlier
  // visit (e.g. they refreshed or were interrupted mid-onboarding).
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      department: true,
      yearOfStudy: true,
      division: true,
    },
  });

  return (
    <OnboardingClient
      initialName={profile?.name ?? user.name}
      initialDepartment={profile?.department ?? null}
      initialYear={profile?.yearOfStudy ?? null}
      initialDivision={profile?.division ?? null}
    />
  );
}
