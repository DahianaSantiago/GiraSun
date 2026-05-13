import { listAllComments } from "@/lib/firebase/comments";
import { CommentModerationList } from "@/components/admin/CommentModerationList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Comentarios · Admin" };

export default async function ComentariosPage() {
  const comments = await listAllComments();

  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <div className="admin-page-eyebrow">Admin · Moderación</div>
        <h1 className="admin-page-title">Comentarios</h1>
        <p className="admin-page-lede">
          {comments.length === 0
            ? "Todavía no hay comentarios."
            : `${comments.length} comentario${comments.length === 1 ? "" : "s"} en total.`}
        </p>
      </header>

      <CommentModerationList initial={comments} />
    </div>
  );
}
