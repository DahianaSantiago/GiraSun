import { listAllSubscribers, listNewsletterSends } from "@/lib/newsletter";
import { NewsletterComposer } from "@/components/admin/NewsletterComposer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Newsletter · Admin" };

export default async function NewsletterPage() {
  const [subscribers, history] = await Promise.all([listAllSubscribers(), listNewsletterSends()]);
  const confirmedCount = subscribers.filter((s) => s.status === "confirmed").length;

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div className="admin-page-eyebrow">Admin · Newsletter</div>
        <h1 className="admin-page-title">Carta mensual</h1>
        <p className="admin-page-lede">
          Compón la carta y envíala a los suscriptores confirmados de una sola vez.
        </p>
      </header>

      <NewsletterComposer confirmedCount={confirmedCount} initialHistory={history} />
    </div>
  );
}
