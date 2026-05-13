"use client";

import { useState, useTransition, useMemo } from "react";
import Image from "next/image";
import { setCommentHiddenAction, deleteCommentAction } from "@/app/actions/comments";
import type { Comment } from "@/lib/firebase/comments";
import { formatCommentDate } from "@/lib/format-date";

type GroupFilter = "all" | "has-hidden";

type PostGroup = {
  key: string;
  postType: string;
  postSlug: string;
  href: string;
  comments: Comment[];
  hiddenCount: number;
  latestAt: number;
};

function buildGroups(comments: Comment[]): PostGroup[] {
  const map = new Map<string, Comment[]>();
  for (const c of comments) {
    const key = `${c.postType}/${c.postSlug}`;
    const list = map.get(key) ?? [];
    list.push(c);
    map.set(key, list);
  }
  return Array.from(map.entries())
    .map(([key, list]) => {
      const [postType, ...rest] = key.split("/");
      const postSlug = rest.join("/");
      const href = `/${postType === "cuento" ? "cuentos" : "escritos"}/${postSlug}`;
      const sorted = [...list].sort((a, b) => b.createdAt - a.createdAt);
      return {
        key,
        postType,
        postSlug,
        href,
        comments: sorted,
        hiddenCount: sorted.filter((c) => c.hidden).length,
        latestAt: sorted[0]?.createdAt ?? 0,
      };
    })
    .sort((a, b) => b.latestAt - a.latestAt);
}

const EyeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const TrashIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 0.15s" }}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const SNIPPET_LIMIT = 90;

function CommentRow({
  comment,
  onToggle,
  onRemove,
}: {
  comment: Comment;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const truncated = comment.body.length > SNIPPET_LIMIT;

  return (
    <div
      className={["mcl-row", comment.hidden && "is-hidden", expanded && "is-expanded"]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="mcl-row-avatar">
        {comment.authorPhotoURL ? (
          <Image
            src={comment.authorPhotoURL}
            alt=""
            width={22}
            height={22}
            className="mcl-avatar"
          />
        ) : (
          <div className="mcl-avatar mcl-avatar-placeholder" />
        )}
      </div>
      <div className="mcl-row-body">
        <span className="mcl-row-author">{comment.authorName}</span>
        <span
          className={["mcl-row-snippet", truncated && "is-truncatable"].filter(Boolean).join(" ")}
          onClick={truncated ? () => setExpanded((v) => !v) : undefined}
          title={truncated && !expanded ? "Ver completo" : undefined}
        >
          {expanded || !truncated ? comment.body : comment.body.slice(0, SNIPPET_LIMIT) + "…"}
        </span>
      </div>
      <span className="mcl-row-date">{formatCommentDate(comment.createdAt)}</span>
      <div className="mcl-row-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggle}
          title={comment.hidden ? "Mostrar" : "Ocultar"}
        >
          {comment.hidden ? <EyeIcon /> : <EyeOffIcon />}
        </button>
        <button type="button" className="icon-btn danger" onClick={onRemove} title="Eliminar">
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

export function CommentModerationList({ initial }: { initial: Comment[] }) {
  const [comments, setComments] = useState(initial);
  const [filter, setFilter] = useState<GroupFilter>("all");
  const [search, setSearch] = useState("");
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const withHidden = new Set<string>();
    const groups = buildGroups(initial);
    for (const g of groups) {
      if (g.hiddenCount > 0) withHidden.add(g.key);
    }
    return withHidden;
  });
  const [pending, startTransition] = useTransition();

  const groups = useMemo(() => buildGroups(comments), [comments]);

  const visibleGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = groups;
    if (filter === "has-hidden") list = list.filter((g) => g.hiddenCount > 0);
    if (q) {
      list = list
        .map((g) => ({
          ...g,
          comments: g.comments.filter(
            (c) =>
              c.postSlug.toLowerCase().includes(q) ||
              c.authorName.toLowerCase().includes(q) ||
              c.body.toLowerCase().includes(q),
          ),
        }))
        .filter((g) => g.comments.length > 0);
    }
    return list;
  }, [groups, filter, search]);

  // When searching, expand all matching groups automatically
  const effectiveOpen = useMemo(() => {
    if (search.trim()) {
      return new Set(visibleGroups.map((g) => g.key));
    }
    return openGroups;
  }, [search, visibleGroups, openGroups]);

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleHidden = (id: string, currentlyHidden: boolean) => {
    setComments((prev) => prev.map((c) => (c.id === id ? { ...c, hidden: !currentlyHidden } : c)));
    startTransition(async () => {
      await setCommentHiddenAction(id, !currentlyHidden);
    });
  };

  const remove = (id: string) => {
    if (!confirm("¿Eliminar este comentario? Esta acción no se puede deshacer.")) return;
    setComments((prev) => prev.filter((c) => c.id !== id));
    startTransition(async () => {
      await deleteCommentAction(id);
    });
  };

  const hiddenAdminCount = comments.filter((c) => c.hidden).length;

  return (
    <div style={{ opacity: pending ? 0.7 : 1, transition: "opacity 0.15s" }}>
      <div className="mod-filters">
        <button
          type="button"
          className={["mod-filter-btn", filter === "all" && "active"].filter(Boolean).join(" ")}
          onClick={() => setFilter("all")}
        >
          Todos los posts
          <span className="mod-filter-count">{groups.length}</span>
        </button>
        <button
          type="button"
          className={["mod-filter-btn", filter === "has-hidden" && "active"]
            .filter(Boolean)
            .join(" ")}
          onClick={() => setFilter("has-hidden")}
        >
          Con ocultos
          {hiddenAdminCount > 0 && (
            <span className="mod-filter-count mod-filter-count-alert">{hiddenAdminCount}</span>
          )}
        </button>
        <input
          className="mod-search"
          type="search"
          placeholder="Buscar comentario, autor o slug..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {visibleGroups.length === 0 ? (
        <p style={{ color: "var(--ink-muted)", fontStyle: "italic", marginTop: 24 }}>
          No hay comentarios en esta selección.
        </p>
      ) : (
        <div className="mcl-groups">
          {visibleGroups.map((group) => {
            const isOpen = effectiveOpen.has(group.key);
            return (
              <div key={group.key} className="mcl-group">
                <div className="mcl-group-header">
                  <button
                    type="button"
                    className="mcl-group-toggle"
                    onClick={() => toggleGroup(group.key)}
                    aria-expanded={isOpen}
                  >
                    <ChevronIcon open={isOpen} />
                    <span className="mcl-group-slug">
                      {group.postType}/{group.postSlug}
                    </span>
                    <span className="mcl-group-counts">
                      <span className="mcl-group-total">
                        {group.comments.length} comentario{group.comments.length === 1 ? "" : "s"}
                      </span>
                      {group.hiddenCount > 0 && (
                        <span className="mcl-group-hidden-badge">
                          {group.hiddenCount} oculto{group.hiddenCount === 1 ? "" : "s"}
                        </span>
                      )}
                    </span>
                    <span className="mcl-group-latest">{formatCommentDate(group.latestAt)}</span>
                  </button>
                  <a
                    href={group.href}
                    target="_blank"
                    rel="noreferrer"
                    className="mcl-group-link"
                    title="Ver post"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                </div>

                {isOpen && (
                  <div className="mcl-group-body">
                    {group.comments.map((c) => (
                      <CommentRow
                        key={c.id}
                        comment={c}
                        onToggle={() => toggleHidden(c.id, c.hidden)}
                        onRemove={() => remove(c.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
