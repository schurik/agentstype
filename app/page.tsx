import { redirect } from "next/navigation";

/**
 * Home page redirects to /live where the main feed lives.
 */
export default function Home() {
  redirect("/live");
}
