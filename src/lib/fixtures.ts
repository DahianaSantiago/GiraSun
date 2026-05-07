// Phase 2 fixture content. Phase 3 replaces this file with MDX file reads
// from /content/{type}/*.mdx + frontmatter validated by Zod. Pages should
// import from this module so the swap can happen in one place.

export type Tone = "warm" | "sage" | "blush";
export type PostType = "cuento" | "escrito";

export type Post = {
  slug: string;
  type: PostType;
  /** Display label for the post category, e.g. 'Cuento cuentos' or 'Escribo'. */
  tag: string;
  /** Short single-word eyebrow rendered above the title on cards, e.g. 'Cuento'. */
  cat: string;
  /** Full title. Use \\\`<em>\\\` in titleHTML for italic-flecked emphasis. */
  title: string;
  /** Optional title with HTML emphasis on a single word, e.g. 'La casa donde <em>siempre</em> es agosto'. */
  titleHTML?: string;
  excerpt: string;
  /** Italic deck shown on the detail page sticky side. */
  dek?: string;
  /** ISO date. */
  date: string;
  /** Human-readable Spanish date used on cards / bylines. */
  dateLabel: string;
  readingMinutes: number;
  /** Featured-on-home flag. */
  featured?: boolean;
  /** Optional path under /public/images/... — Phase 3 wires real images. */
  heroSrc?: string;
  heroAlt: string;
  /** Section H2s used to seed the TOC on the detail page. */
  sections: string[];
};

export type Book = {
  num: string;
  title: string;
  author: string;
  status: "now" | "next" | "done";
  cover: Tone;
};

export type Film = {
  num: string;
  title: string;
  director: string;
  year: number;
  date: string;
  note: string;
  cover: Tone;
};

export const STATUS_LABELS: Record<Book["status"], string> = {
  now: "Leyendo",
  next: "Próximo",
  done: "Terminado",
};

// ---------------------------------------------------------------------------
// Cuentos & Escritos
// ---------------------------------------------------------------------------

export const POSTS: Post[] = [
  {
    slug: "casa-agosto",
    type: "cuento",
    tag: "Cuento cuentos",
    cat: "Cuento",
    title: "La casa donde siempre es agosto",
    titleHTML: "La casa donde <em>siempre</em> es agosto",
    excerpt:
      "Una historia sobre las casas que recordamos antes de habitarlas, sobre las abuelas que dejan recados en la harina, y sobre todo lo que aprende a vivir en los pasillos cuando nadie mira.",
    dek: "Una historia sobre las casas que recordamos antes de habitarlas.",
    date: "2026-05-05",
    dateLabel: "5 mayo, 2026",
    readingMinutes: 6,
    featured: true,
    heroAlt: "Cocina de verano con luz lateral entrando por la ventana",
    sections: [
      "La ventana que daba al verano",
      "Recados en la harina",
      "El piano que nadie tocaba",
      "Lo que aprendió a vivir en los pasillos",
    ],
  },
  {
    slug: "verano-otra-casa",
    type: "cuento",
    tag: "Cuento cuentos",
    cat: "Cuento",
    title: "El verano de la otra casa",
    excerpt: "Volver a un lugar que ya no existe — y descubrir que sigue siendo tuyo.",
    dek: "Volver a un lugar que ya no existe — y descubrir que sigue siendo tuyo.",
    date: "2026-04-18",
    dateLabel: "18 abril, 2026",
    readingMinutes: 7,
    heroAlt: "Patio con higuera y luz dorada de la tarde",
    sections: [
      "El olor del verano nuevo",
      "La hamaca, el libro abandonado",
      "Una conversación que no tuvimos",
      "Lo que dejé al irme",
    ],
  },
  {
    slug: "recados-harina",
    type: "cuento",
    tag: "Cuento cuentos",
    cat: "Cuento",
    title: "Los recados en la harina",
    excerpt: "Pequeñas notas que mi abuela escribía con el dedo y barría al final del día.",
    date: "2026-03-21",
    dateLabel: "21 marzo, 2026",
    readingMinutes: 5,
    heroAlt: "Tres rayas de harina sobre mármol blanco",
    sections: ["El primer recado", "El armario azul", "Lo que se barría al final del día"],
  },
  {
    slug: "abrir-puerta",
    type: "escrito",
    tag: "Escribo",
    cat: "Escrito",
    title: "Sobre el ruido de abrir una puerta",
    titleHTML: "Sobre el ruido de <em>abrir</em> una puerta",
    excerpt:
      "Hay puertas que pesan más por dentro que por fuera. Esta tarde aprendí cuál era la mía.",
    dek: "Hay puertas que pesan más por dentro que por fuera.",
    date: "2026-04-28",
    dateLabel: "28 abril, 2026",
    readingMinutes: 4,
    heroAlt: "Puerta entreabierta con luz cálida del otro lado",
    sections: ["La cerradura que conocía", "El umbral", "Volver a entrar"],
  },
  {
    slug: "diario-mayo",
    type: "escrito",
    tag: "Escribo",
    cat: "Escrito",
    title: "Diario, primer miércoles de mayo",
    excerpt: "Notas sueltas: la luz a las seis, el café que se enfría, lo que dije sin pensar.",
    date: "2026-04-12",
    dateLabel: "12 abril, 2026",
    readingMinutes: 3,
    heroAlt: "Cuaderno abierto con taza de café al lado, luz de mañana",
    sections: ["6 de la mañana", "Antes del mediodía", "Por la noche"],
  },
  {
    slug: "carta-junio",
    type: "escrito",
    tag: "Escribo",
    cat: "Escrito",
    title: "Una carta que no envié en junio",
    excerpt: "Hay correos que se escriben para no enviarlos. Este es uno.",
    date: "2026-03-04",
    dateLabel: "4 marzo, 2026",
    readingMinutes: 5,
    heroAlt: "Sobres y papel de carta sobre escritorio antiguo",
    sections: ["Querido tú", "Lo que no te dije", "Por qué no la mando"],
  },
];

export function getPostsByType(type: PostType): Post[] {
  return POSTS.filter((p) => p.type === type).sort((a, b) => b.date.localeCompare(a.date));
}

export function findPost(type: PostType, slug: string): Post | undefined {
  return POSTS.find((p) => p.type === type && p.slug === slug);
}

// ---------------------------------------------------------------------------
// Club de lectura — books on the shelf
// ---------------------------------------------------------------------------

export const BOOKS: Book[] = [
  { num: "01", title: "Bonsái", author: "Alejandro Zambra", status: "now", cover: "warm" },
  {
    num: "02",
    title: "Sobre los huesos de los muertos",
    author: "Olga Tokarczuk",
    status: "now",
    cover: "sage",
  },
  {
    num: "03",
    title: "Las cosas que perdimos en el fuego",
    author: "Mariana Enríquez",
    status: "next",
    cover: "blush",
  },
  { num: "04", title: "Stoner", author: "John Williams", status: "next", cover: "warm" },
  {
    num: "05",
    title: "El año del pensamiento mágico",
    author: "Joan Didion",
    status: "done",
    cover: "sage",
  },
  {
    num: "06",
    title: "Los detectives salvajes",
    author: "Roberto Bolaño",
    status: "done",
    cover: "blush",
  },
];

// ---------------------------------------------------------------------------
// CineClub — past sessions
// ---------------------------------------------------------------------------

export const FILMS: Film[] = [
  {
    num: "12",
    title: "Paris, Texas",
    director: "Wim Wenders",
    year: 1984,
    date: "2 mayo 2026",
    note: "El desierto, el rojo, el silencio.",
    cover: "warm",
  },
  {
    num: "11",
    title: "Cleo de 5 a 7",
    director: "Agnès Varda",
    year: 1962,
    date: "18 abril 2026",
    note: "Dos horas que duran una vida.",
    cover: "sage",
  },
  {
    num: "10",
    title: "Lost in Translation",
    director: "Sofia Coppola",
    year: 2003,
    date: "4 abril 2026",
    note: "Sobre lo que no se puede traducir.",
    cover: "blush",
  },
  {
    num: "09",
    title: "El espíritu de la colmena",
    director: "Víctor Erice",
    year: 1973,
    date: "21 marzo 2026",
    note: "Una niña, un monstruo, una luz amarilla.",
    cover: "warm",
  },
  {
    num: "08",
    title: "Stalker",
    director: "Andrei Tarkovsky",
    year: 1979,
    date: "7 marzo 2026",
    note: "Caminar lentamente hacia el deseo.",
    cover: "sage",
  },
  {
    num: "07",
    title: "Cold War",
    director: "Paweł Pawlikowski",
    year: 2018,
    date: "21 febrero 2026",
    note: "Blanco y negro como una herida.",
    cover: "blush",
  },
];
