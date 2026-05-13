import { listAllSubscribers } from "@/lib/newsletter";
import { SubscriberList } from "@/components/admin/SubscriberList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Suscriptores · Admin" };

export default async function SuscriptoresPage() {
  const subscribers = await listAllSubscribers();
  const confirmed = subscribers.filter((s) => s.status === "confirmed").length;

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div className="admin-page-eyebrow">Admin · Newsletter</div>
        <h1 className="admin-page-title">Suscriptores</h1>
        <p className="admin-page-lede">
          {subscribers.length === 0
            ? "Todavía no hay suscriptores."
            : `${subscribers.length} registro${subscribers.length === 1 ? "" : "s"} · ${confirmed} confirmado${confirmed === 1 ? "" : "s"}.`}
        </p>
      </header>

      <SubscriberList initial={subscribers} />
    </div>
  );
}
