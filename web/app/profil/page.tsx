import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/ProfileForm";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";
import { loadOrg } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.account_status !== "ACTIVE") redirect("/kutish");
  const org = user.role === "MAGISTR" ? await loadOrg() : [];

  return (
    <Shell role={user.role} name={user.full_name} active="/profil" title="Profil">
      <div className="page-head">
        <div>
          <p className="eyebrow">{user.role === "ADMIN" ? "Administrator" : "Magistr"}</p>
          <h2>Profil va parol</h2>
        </div>
      </div>
      <ProfileForm
        role={user.role}
        fullName={user.full_name}
        email={user.email}
        phone={user.phone ?? ""}
        faculty={user.faculty ?? ""}
        department={user.department ?? ""}
        specialty={user.specialty ?? ""}
        course={user.course ?? 1}
        funding={user.funding ?? "Grant"}
        org={org}
      />
    </Shell>
  );
}
