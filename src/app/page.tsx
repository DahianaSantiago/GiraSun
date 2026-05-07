export default function HomePage() {
  return (
    <section className="container" style={{ padding: "110px 0", textAlign: "center" }}>
      <p
        style={{
          fontSize: "11px",
          letterSpacing: "0.32em",
          textTransform: "uppercase",
          color: "var(--ink-muted)",
          marginBottom: "22px",
        }}
      >
        Diario personal · MMXXVI
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display-xl)",
          fontWeight: 400,
          fontSize: "var(--fs-display-xl)",
          lineHeight: "var(--leading-display)",
          letterSpacing: "var(--tracking-tight)",
          color: "var(--ink)",
          margin: "0 0 28px",
        }}
      >
        Gira<em style={{ fontStyle: "italic", color: "var(--accent)" }}>Sun</em>
      </h1>
      <p
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: "22px",
          lineHeight: 1.5,
          color: "var(--ink-soft)",
          maxWidth: "48ch",
          margin: "0 auto",
        }}
      >
        Tú eres un girasol, pero cuando caminas te vuelves sol, y entonces yo, sin remedio, me
        convierto en girasol.
      </p>
    </section>
  );
}
