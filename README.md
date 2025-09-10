# Prizm

Prizm is an AI‑assisted presentation builder. It turns a short prompt into an editable, themed slide deck with smooth editing and a polished presentation mode.

## Highlights

- AI‑assisted outlines and starter content
- Drag‑and‑drop editor with resizable layouts
- Themed design system with curated fonts and colors
- Full‑screen presentation mode with transitions and precise scaling
- Project dashboard with fast canvas thumbnails
- Optimistic client updates and responsive UI

## Architecture (High‑Level)

- Next.js App Router + React with TypeScript
- Data access via Prisma to a relational database
- Hosted authentication provider for protected routes
- Client state with React Query (server state) and Zustand (editor state)
- Image uploads through a third‑party provider
- Generative AI integrations for outline, layout hints, and assets

## Core Concepts

- Projects: top‑level presentation entities and metadata
- Slides: each slide contains a recursive ContentItem tree (text, images, lists, columns, etc.)
- Themes: tokens controlling typography, color, and backgrounds across editor and presentation

## Repo Structure

- `src/app` — App Router pages and UI
- `src/actions` — Server actions for data and orchestration
- `src/components` — UI primitives and editor widgets
- `src/lib` — Utilities, types, constants (layouts, themes)
- `src/store` — Client stores for slides and prompts
- `prisma/schema.prisma` — Data model

## Security & Privacy

- Protected areas require authentication; server checks enforce resource ownership.
- Sensitive configuration (keys, secrets, URLs) lives in environment variables and is not committed.

## Status

Actively evolving.

## Roadmap (Summary)

- Debounced auto‑save and server snapshots
- Collaborative editing and presenter tools
- Export to PDF/PNG and improved performance instrumentation

