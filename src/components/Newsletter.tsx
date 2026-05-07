// Visual stub for Phase 2. Phase 6 wires the real form (server action +
// Resend double opt-in + Firestore subscriber). For now the inputs and
// button render but the form is non-functional.

export function Newsletter() {
  return (
    <section className="section">
      <div className="container">
        <div className="newsletter">
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: "oklch(0.85 0.02 85 / 0.6)",
                marginBottom: 14,
                position: "relative",
              }}
            >
              Cartas para quien lee despacio
            </div>
            <h3>
              Una carta cada luna llena.
              <br />
              <em>Sin prisas, sin algoritmos.</em>
            </h3>
            <p style={{ marginTop: 18 }}>
              Pensamientos sueltos, lo que estoy escribiendo, qué libros me están atravesando este
              mes. Llega a tu correo cuando hay algo que vale la pena contar — nunca antes.
            </p>
          </div>
          <div>
            <form>
              <input
                type="email"
                name="email"
                placeholder="tu correo electrónico"
                aria-label="tu correo electrónico"
                disabled
              />
              <button type="submit" disabled>
                Suscribirme
              </button>
            </form>
            <div className="check">
              <span>✿</span>
              <span>Sin spam. Una sola carta al mes. Te puedes ir cuando quieras.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
