import { getCurrentUser } from "@/lib/session";
import { Navbar } from "@/components/Navbar";
import { redirect } from "next/navigation";
import CreatePostClient from "./CreatePostClient";

export default async function CreatePostPage() {
  const user = await getCurrentUser();

  if (!user || (user.role !== "CLUB" && user.role !== "SUPER_ADMIN")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-canvas text-on-surface font-body-md">
      <Navbar
        userRole={user.role as any}
        userName={user.name}
        userEmail={user.email}
      />
      <main className="max-w-container-max mx-auto px-4 md:px-margin-page pt-28 pb-20">
        <CreatePostClient />
      </main>
    </div>
  );
}
