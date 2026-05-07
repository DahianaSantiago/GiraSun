export function SideRail({
  label = "Diario personal",
  year = String(new Date().getFullYear()),
}: {
  label?: string;
  year?: string;
}) {
  return (
    <div className="side-rail" aria-hidden="true">
      <div className="line" />
      <div className="label">{label}</div>
      <div className="line" />
      <div className="year-label">{year}</div>
    </div>
  );
}
