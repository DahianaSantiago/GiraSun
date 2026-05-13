"use client";

import { useState, useTransition, useMemo } from "react";
import { adminUnsubscribeAction } from "@/app/actions/newsletter";
import type { Subscriber, SubscriberStatus } from "@/lib/newsletter";
import { formatCommentDate } from "@/lib/format-date";

type Filter = "all" | "confirmed" | "pending" | "unsubscribed";

function statusLabel(s: SubscriberStatus) {
  if (s === "confirmed") return "Confirmado";
  if (s === "pending") return "Pendiente";
  return "Baja";
}

function statusClass(s: SubscriberStatus) {
  if (s === "confirmed") return "published";
  if (s === "pending") return "next";
  return "done";
}

export function SubscriberList({ initial }: { initial: Subscriber[] }) {
  const [subscribers, setSubscribers] = useState(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [pending, startTransition] = useTransition();

  const visible = useMemo(() => {
    let list = subscribers;
    if (filter !== "all") list = list.filter((s) => s.status === filter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((s) => s.email.includes(q));
    return list;
  }, [subscribers, filter, search]);

  const counts = {
    all: subscribers.length,
    confirmed: subscribers.filter((s) => s.status === "confirmed").length,
    pending: subscribers.filter((s) => s.status === "pending").length,
    unsubscribed: subscribers.filter((s) => s.status === "unsubscribed").length,
  };

  const handleUnsub = (email: string) => {
    if (!confirm(`¿Dar de baja a ${email}?`)) return;
    setSubscribers((prev) =>
      prev.map((s) =>
        s.email === email ? { ...s, status: "unsubscribed" as SubscriberStatus } : s,
      ),
    );
    startTransition(async () => {
      await adminUnsubscribeAction(email);
    });
  };

  const handleExportCSV = () => {
    const confirmed = subscribers.filter((s) => s.status === "confirmed");
    const rows = [
      ["Email", "Fuente", "Fecha confirmación"],
      ...confirmed.map((s) => [
        s.email,
        s.source,
        s.confirmedAt ? new Date(s.confirmedAt).toISOString().slice(0, 10) : "",
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `suscriptores_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const FILTERS: { key: Filter; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "confirmed", label: "Confirmados" },
    { key: "pending", label: "Pendientes" },
    { key: "unsubscribed", label: "Baja" },
  ];

  return (
    <div style={{ opacity: pending ? 0.7 : 1, transition: "opacity 0.15s" }}>
      <div className="mod-filters">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`mod-filter-btn${filter === key ? "active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
            <span className="mod-filter-count">{counts[key]}</span>
          </button>
        ))}
        <input
          className="mod-search"
          type="search"
          placeholder="Buscar por email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn-secondary" onClick={handleExportCSV}>
          Exportar CSV
        </button>
      </div>

      {visible.length === 0 ? (
        <p style={{ color: "var(--ink-muted)", fontStyle: "italic", marginTop: 24 }}>
          No hay suscriptores en esta selección.
        </p>
      ) : (
        <div className="sub-list">
          {visible.map((s) => (
            <div
              key={s.email}
              className={`sub-row${s.status === "unsubscribed" ? "is-unsub" : ""}`}
            >
              <div className="sub-row-main">
                <span className="sub-row-email">{s.email}</span>
                <span className={`status-pill ${statusClass(s.status)}`}>
                  {statusLabel(s.status)}
                </span>
              </div>
              <div className="sub-row-meta">
                <span className="sub-row-meta-item">{s.source}</span>
                <span className="sub-row-meta-item">{formatCommentDate(s.createdAt)}</span>
                {s.confirmedAt && (
                  <span className="sub-row-meta-item">
                    confirmado {formatCommentDate(s.confirmedAt)}
                  </span>
                )}
              </div>
              <div className="sub-row-actions">
                {s.status !== "unsubscribed" && (
                  <button
                    type="button"
                    className="icon-btn danger"
                    title="Dar de baja"
                    onClick={() => handleUnsub(s.email)}
                  >
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
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
