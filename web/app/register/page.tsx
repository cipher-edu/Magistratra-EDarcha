import { RegisterForm } from "@/components/RegisterForm";
import { ViewBeacon } from "@/components/ViewBeacon";
import { loadOrg } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const org = await loadOrg();
  return (
    <div className="auth-page">
      <ViewBeacon path="/register" />
      <RegisterForm org={org} />
    </div>
  );
}
