import { redirect } from "next/navigation";

/** The whole site is the birthday experience — send / straight there. */
export default function Home() {
  redirect("/birthday");
}
