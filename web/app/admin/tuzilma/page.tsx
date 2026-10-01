import { OrgEditor } from "@/components/OrgEditor";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";
import { loadOrg } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StructurePage() {
  const admin = await requireUser("ADMIN");
  const org = await loadOrg();
  return (
    <Shell role="ADMIN" name={admin.full_name} active="/admin/tuzilma" title="Tuzilma">
      <section className="stat-hero">
        <div>
          <p className="eyebrow">Sozlash</p>
          <h2>Fakultet, kafedra va mutaxassislik</h2>
          <p className="hint">Ro‘yxat va profil shu ro‘yxatdan tanlanadi. Talabasi bor yozuv o‘chirilmaydi.</p>
        </div>
      </section>
      <OrgEditor org={org} />
    </Shell>
  );
}
