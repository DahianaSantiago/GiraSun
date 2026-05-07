import Image from "next/image";
import { CommentComposer } from "./CommentComposer";
import { formatCommentDate, listVisibleComments, type Comment } from "@/lib/firebase/comments";

const ADMIN_BADGE = (
  <span className="badge" title="Autora">
    Autora
  </span>
);

const AUTHOR_EMAILS = new Set<string>(["hola@girasun.com", "dahianasantiago@gmail.com"]);

const isAuthor = (c: Comment): boolean => AUTHOR_EMAILS.has(c.authorName.toLowerCase());

const initial = (name: string): string => (name.trim()[0] ?? "?").toUpperCase();

export async function CommentThread({
  postType,
  postSlug,
}: {
  postType: "cuento" | "escrito";
  postSlug: string;
}) {
  const comments = await listVisibleComments(postType, postSlug);

  return (
    <section className="comments">
      <div className="container">
        <h3>
          Comentarios <span className="count">({comments.length})</span>
        </h3>
        <div className="ornament">·</div>
        <p className="lede">
          Pensamientos, reflexiones, recuerdos que detonó la lectura. Leo todos.
        </p>

        <CommentComposer postType={postType} postSlug={postSlug} />

        {comments.length === 0 ? (
          <p className="empty">Aún no hay comentarios. Sé el primero en escribir.</p>
        ) : (
          comments.map((c) => (
            <article className="comment" key={c.id}>
              <div className="av">
                {c.authorPhotoURL ? (
                  <Image src={c.authorPhotoURL} alt="" width={36} height={36} />
                ) : (
                  <span>{initial(c.authorName)}</span>
                )}
              </div>
              <div>
                <div className="head">
                  <span className="name">{c.authorName}</span>
                  {isAuthor(c) ? ADMIN_BADGE : null}
                  <span className="when">{formatCommentDate(c.createdAt)}</span>
                </div>
                <p>{c.body}</p>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
