import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";
import { ViewBeacon } from "@/components/ViewBeacon";
import { cabinetPath, currentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function WaitingPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN" || user.account_status === "ACTIVE") redirect(cabinetPath(user));
  const rejected = user.account_status === "REJECTED";

  return (
    <div className="login-screen">
      <ViewBeacon path="/kutish" />
      <section className="login-hero">
        <p className="crumb">Magistratura ERP</p>
        <h1>{rejected ? "So‘rov rad etildi." : "Hisob hali ochilmagan."}</h1>
        <p>Profil va ariza admin qarorigacha bloklangan.</p>
      </section>
      <section className="login-card">
        <div className="brand">
          <span className="mark">M</span>
          <div>
            <p className="eyebrow">Magistratura</p>
            <strong>{user.full_name}</strong>
          </div>
        </div>
        <h1>{rejected ? "Kabinet yopiq" : "Tasdiq kutilmoqda"}</h1>
        <p className="lede">
          {rejected
            ? "Admin so‘rovni rad etdi. Profil ochilmaydi va ariza qoldirib bo‘lmaydi."
            : "Ro‘yxat so‘rovingiz admin tasdig‘ini kutmoqda. Tasdiqlanguncha profil ochilmaydi va ariza qoldirib bo‘lmaydi."}
        </p>
        {user.status_note ? <p className="rule">{user.status_note}</p> : null}
        <p className="hint">{user.email}</p>
        <LogoutButton />
      </section>
    </div>
  );
}
