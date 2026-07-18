import { ImageSlot } from "./ImageSlot";
import { getAboutHome } from "@/lib/content";

export async function AboutStrip() {
  const about = await getAboutHome();

  return (
    <section className="section" id="about" style={{ paddingTop: 0 }}>
      <div className="container">
        <div className="about-strip">
          <div className="photo">
            <ImageSlot
              src={about.photoSrc || undefined}
              alt={about.photoAlt}
              placeholder="Retrato (opcional)"
              style={{ position: "absolute", inset: 0 }}
            />
          </div>
          <div>
            <div className="section-eyebrow">Sobre quien escribe</div>
            <h3>{about.title}</h3>
            <p>{about.body}</p>
            <div className="sig">— GiraSun</div>
          </div>
        </div>
      </div>
    </section>
  );
}
