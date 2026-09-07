import { redirect } from "next/navigation";

// The main page (`/`) IS the dashboard — it shows all upcoming events, the
// student's registered events with QR passes, and saved bookmarks under the
// hero section. This legacy route just forwards there.
export default function DashboardPage() {
  redirect("/");
}
