# GiraSun

> _"Tú eres un girasol, pero cuando caminas te vuelves sol, y entonces yo, sin remedio, me convierto en girasol."_

Diario literario de Dahiana Santiago — cuentos, escritos, club de lectura y CineClub.

Hosted on Vercel at **[girasun.com](https://girasun.com)** (próximamente).

---

## Stack

- **Next.js 16** (App Router) + TypeScript + Turbopack
- **Tailwind CSS v4** sobre tokens del [GiraSun Design System](../GiraSun%20Design%20System/)
- **Firebase** (Auth + Firestore) para comentarios, likes y suscriptores
- **Resend** para envío del newsletter
- **MDX** en `/content` para los textos largos; imágenes en `/public/images`
- **TipTap** en el panel de admin para escritura

## Requirements

- Node `>=22` (ver `.nvmrc`)
- pnpm `9.12.1` (definido en `packageManager`)

## Commands

```bash
pnpm install         # instalar dependencias
pnpm dev             # servidor de desarrollo (http://localhost:3000)
pnpm build           # build de producción
pnpm start           # servir el build
pnpm lint            # eslint
pnpm typecheck       # tsc --noEmit
pnpm format          # prettier --write .
pnpm format:check    # verificar formato sin escribir
```

## Project layout

```
app/                  rutas (públicas y /admin)
src/components/       componentes React
src/lib/              firebase, mdx, octokit, email, auth, rate-limit
content/              .mdx — cuentos / escritos / club-de-lectura / cineclub
public/images/        imágenes referenciadas desde MDX
public/fonts/         Cormorant Garamond + Inter (auto-hospedados)
emails/               plantillas react-email
firestore.rules       reglas de Firestore (deny-all + allows específicos)
```

## Workflow

- Cambios de **código** → rama `feat/*` → PR → revisión (jjcadu) → merge → Vercel auto-deploya `main`.
- Publicación de **contenido** desde el panel de admin → commit directo a `main` vía la GitHub App (bypass de branch protection limitado a `/content/**` y `/public/images/**`).

Más detalles del plan en `~/.claude/plans/inside-documents-girasun-we-have-luminous-abelson.md`.
