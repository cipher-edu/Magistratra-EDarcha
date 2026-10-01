import { ArizaForm } from "@/components/ArizaForm";
import { Shell } from "@/components/Shell";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewDocumentPage() {
  const user = await requireUser("MAGISTR");
  return (
    <Shell role="MAGISTR" name={user.full_name} active="/magistr/hujjat/yangi" title="Ariza yuborish">
      <div className="page-head">
        <div>
          <p className="eyebrow">Yangi ariza</p>
          <h2>Hujjat turini tanlab, fayllarni biriktiring</h2>
        </div>
      </div>
      <ArizaForm mode="create" submitLabel="Yuborish" />
    </Shell>
  );
}
