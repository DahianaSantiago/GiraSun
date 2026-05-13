export const IMAGE_FILTERS = {
  none: {
    label: "Sin filtro",
    css: "none",
  },
  sepia: {
    label: "Velo sepia",
    css: "sepia(0.75) contrast(1.25) brightness(0.8) saturate(1.3)",
  },
  ash: {
    label: "Ceniza",
    css: "saturate(0.05) contrast(1.4) brightness(0.72)",
  },
  haze: {
    label: "Neblina",
    css: "brightness(1.1) saturate(0.35) contrast(0.8) blur(1.5px)",
  },
  shadow: {
    label: "Sombra",
    css: "contrast(1.6) brightness(0.55) saturate(0.35)",
  },
} as const;

export type ImageFilterKey = keyof typeof IMAGE_FILTERS;

export function resolveFilter(key?: string | null): string | undefined {
  if (!key || key === "none") return undefined;
  return IMAGE_FILTERS[key as ImageFilterKey]?.css;
}
