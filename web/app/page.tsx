import { redirect } from "next/navigation";
import { cabinetPath, currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  redirect(cabinetPath(user));
}
