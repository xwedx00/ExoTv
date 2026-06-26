<div align="center">

# ExoTv

**A modern, self-contained anime & manga streaming web app.**

Watch anime, read manga, search scenes by image, and play anime OP/ED themes —
all from a single Next.js app with **no backend services, no database, and no
account required**.

[![CI](https://github.com/xwedx00/ExoTv/actions/workflows/ci.yml/badge.svg)](https://github.com/xwedx00/ExoTv/actions/workflows/ci.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149eca?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript)
![License](https://img.shields.io/badge/license-personal%20use-lightgrey)

</div>

---

## Table of contents

- [What is ExoTv](#what-is-exotv)
- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [The revamp — full audit trail](#the-revamp--full-audit-trail)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Credits](#credits)
- [Legal & disclaimer](#legal--disclaimer)

---

## What is ExoTv

ExoTv is a heavily-rebuilt fork of the open-source *Kaguya/Exoexs* anime+manga app.
The original depended on **four external services** (a scraper, a CORS proxy, a
socket server, and web-push) plus a **Supabase** database and accounts. ExoTv tears
all of that out and turns the app into its **own backend**:

- **Metadata** comes from the public **AniList** GraphQL API.
- **Anime sources** are scraped **in-app** (Next.js API routes) via `@consumet/extensions`.
- **Manga** comes from the official **MangaDex** API.
- **CORS / HLS proxying** is handled by an **in-app** `/api/proxy` route.
- **Everything you save** (watch history, reading progress, favourites, settings)
  lives in your browser's **localStorage** — no database, no sign-up.

The result is a single deployable Next.js app with zero required secrets.

## Features

- 🎬 **Anime streaming** — custom HLS player (Vidstack) with multi-provider source
  fallback, subtitles, and resume-where-you-left-off.
- 📖 **Manga reader** — chapters and pages straight from MangaDex.
- 🔎 **Scene search** — upload a screenshot, find the exact anime / episode / timestamp
  (powered by [trace.moe](https://trace.moe)).
- 🎵 **Anime themes** — a shuffle player for opening/ending songs (animethemes.moe),
  using the same Vidstack player as the watch page.
- 🗂️ **Browse & search** — AniList-powered catalog with genre / season / year / format
  filters and infinite scroll.
- 💾 **Local persistence** — watch & read history, watching/reading status, and
  favourites, all in localStorage. Nothing leaves your browser.
- 🌑 **Dark, frosted-glass UI** with smooth motion (redesign in progress — see
  [Roadmap](#roadmap)).

## Architecture

```
Single Next.js app (pages router, React 19)  ──►  deploy on any Node host
│
├─ Metadata        AniList GraphQL                     (public, no key)
│
├─ In-app API routes  (src/pages/api/*)  ── replaces the 4 external services
│   ├─ /api/anime/episodes   consumet META.Anilist → Episode[]
│   ├─ /api/anime/sources    provider → { sources, subtitles, fonts } (HLS)
│   ├─ /api/manga/chapters    MangaDex chapters
│   ├─ /api/manga/images      MangaDex page images
│   └─ /api/proxy             CORS/HLS proxy + m3u8 rewrite + header injection
│
├─ Persistence     browser localStorage (exotv:*)      (no DB, no accounts)
└─ Brand           ExoTv (English-only)
```

**Source strategy.** Anime uses consumet's `META.Anilist(provider)` so the AniList id
maps directly to a streaming provider — no manual title matching. Providers are tried
in a configurable fallback order (`ANIME_PROVIDERS`) until one returns episodes;
HiAnime often rate-limits (522), so AnimeUnity / AnimeSaturn are the reliable defaults.
Stream URLs carry expiring tokens, so source responses are cached only briefly; episode
and chapter **lists** are cached aggressively.

**The proxy.** `/api/proxy` adds permissive CORS, injects upstream `Referer`/`Origin`/
`User-Agent` headers to bypass hotlink checks, rewrites `.m3u8` playlists so every
segment routes back through the proxy, and transparently unwraps accidentally
double-proxied URLs (a quirk of hls.js re-resolving already-proxied URIs).

## Tech stack

| Area | Choice |
|---|---|
| Framework | **Next.js 16** (pages router, Turbopack) |
| UI | **React 19**, **Tailwind CSS v4**, frosted-glass design system |
| Language | **TypeScript 6** |
| Data | **TanStack Query v5**, AniList GraphQL |
| Player | **@vidstack/react** (HLS via hls.js) |
| Manga | **MangaDex** API |
| Anime sources | **@consumet/extensions** (+ `aniwatch` fallback engine) |
| Carousels | **Swiper 12** |
| Motion | **framer-motion / motion** |
| Persistence | browser **localStorage** |

## Getting started

**Prerequisites:** Node.js ≥ 20 and npm.

```bash
# 1. Install dependencies (the repo uses legacy-peer-deps via .npmrc)
npm install

# 2. (Optional) configure env — the app runs with zero config
cp .env.example .env

# 3. Start the dev server
npm run dev          # http://localhost:3000

# Production
npm run build
npm start
```

There are **no required environment variables** — the app works out of the box.

## Environment variables

Every variable is **optional** and there are **no secrets**. See [`.env.example`](./.env.example).

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_GA_ID` | Google Analytics measurement ID. Blank = analytics off. |
| `ANIME_PROVIDERS`   | Comma-separated provider fallback order for the anime scraper. Blank = default. |

> The original fork required Supabase keys + four external service URLs. **All of those
> are gone** — the `.env` is intentionally safe to commit.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server (Turbopack). |
| `npm run build` | Production build (+ `next-sitemap`). |
| `npm start` | Serve the production build. |
| `npm run typecheck` | `tsc --noEmit` type check. |

## Project structure

```
src/
├─ pages/
│  ├─ api/{anime,manga}/…    in-app source backend
│  ├─ api/proxy.ts           CORS / HLS proxy
│  ├─ anime/{details,watch}  detail + watch (Vidstack) pages
│  ├─ manga/{details,read}   detail + reader pages
│  ├─ themes.tsx             OP/ED shuffle player
│  ├─ scene-search.tsx       trace.moe image search
│  └─ browse.tsx, index.tsx  catalog + home
├─ lib/
│  ├─ sources/{anime,manga,cache}.ts   scraper + MangaDex + TTL cache
│  ├─ storage.ts             typed localStorage layer (replaces Supabase)
│  └─ i18n.tsx               English-only i18n shim
├─ components/               UI (shared + feature components)
├─ contexts/ hooks/ utils/   app logic
└─ styles/index.css          Tailwind v4 + frosted-glass design tokens
```

## The revamp — full audit trail

ExoTv was rebuilt from a partially-gutted fork in a series of verified phases.

### Recovery & de-Supabase
- A prior **"Deleted Everything"** commit had stripped the core types, the entire
  `Player/` directory, and the watch/read pages — which is why **256 files carried
  `@ts-nocheck`**. The deleted code and the 346-line `types/index.ts` were **recovered
  from git history** and reconciled.
- **Supabase removed entirely.** All persistence (watch/read history, status,
  favourites) was rewritten onto a typed, SSR-safe **localStorage** layer
  (`src/lib/storage.ts`). Auth, comments (tiptap), notifications, web-push, and uploads
  were deleted. No accounts.

### In-app source backend
- Built `src/lib/sources/*` + API routes for **anime** (consumet `META.Anilist` with
  provider fallback), **manga** (MangaDex), and a **CORS/HLS proxy** with m3u8 rewriting
  and header injection. Verified end-to-end: episodes play, chapters render.

### Modernization
- Upgraded to **Next 16 + React 19 + TypeScript 6 + Tailwind v4 + TanStack Query v5 +
  Swiper 12**. Migrated react-query→@tanstack (object form, `initialPageParam`),
  Tailwind v3→v4 (`@config` + `@tailwindcss/postcss`, aspect-ratio utilities), and
  dropped the custom webpack config for Turbopack. `npm audit` went from **49 vulns → ~4**.

### Player
- The recovered custom player used **`netplayer`**, which is abandoned and **breaks on
  React 19**. It was **replaced with Vidstack** (`@vidstack/react`). Key fixes:
  - Render the player **directly** in the watch page (the old persistent-player
    context indirection never mounted under React 19).
  - `/api/proxy` now **unwraps double-proxied URLs** (hls.js was re-proxying segments
    into 400s) — the real blocker behind "video won't play".
  - `logLevel="silent"` on the player: in real browsers, blocked autoplay made Vidstack
    log a rich object that **Next 16's dev console-capture crashed on**, tearing down the
    player; silencing the logger fixed playback in real Chrome.
  - The **themes** page was migrated onto the **same** Vidstack player.

### E2E audit (real browser)
- Every route was driven through a real browser. Fixed: a home-banner crash on empty
  trending data, an i18n shim that returned raw `namespace:key` strings, a react-select
  SSR hydration mismatch (stable `useId` instanceId), a nested-`<p>` hydration error in
  `InfoItem`, a missing `manifest.json`, and **graceful empty states** for titles with
  no source (the watch page used to 500, the reader white-screened).

### Cleanup & i18n
- **English-only:** removed `next-i18next`; non-English locale constants (vi/ru/es) and
  leftover Vietnamese strings were deleted.
- **Rebrand:** Kaguya/Exoexs → **ExoTv** throughout.
- **Dead code removed:** the abandoned `netplayer` dependency and its ~28 orphaned
  player/control files, the dead `config.ts` (stale Supabase + external-service URLs),
  and orphaned type packages.
- **Env consolidated** down to two optional, secret-free variables.

### Quality gates
- `tsc --noEmit` and `next build` both pass; CI runs them on every push/PR.

## Deployment

ExoTv is a standard Next.js app and deploys to any **Node host** (Railway, Render, Fly,
a VPS, or Docker). The planned watch-party feature will require a custom Node server
(socket.io + PeerServer), so a serverless-only target like Vercel is not recommended
long-term, but everything shipped today works on it.

```bash
npm run build && npm start
```

## Roadmap

- [ ] **UI redesign** (in progress) — Apple-style frosted glass, pill header with an
      English/native title toggle, custom player controls (skip OP/ED, next-episode,
      server/quality/sub-dub), a rebuilt manga reader (reading modes, fit modes, zoom),
      and a 2026 motion pass. The global design system (glass tokens, motion, ambient
      backdrop) has already landed.
- [ ] **Watch-party** — self-hosted socket.io + PeerServer custom server (`/wwf`).
- [ ] **Type-safety hardening** — remove the remaining `@ts-nocheck` markers, enable
      `strict`, add ESLint flat config + Prettier.

## Credits

ExoTv is built on the open-source **Kaguya / Exoexs** project by
[hoangvu12](https://github.com/hoangvu12). Metadata by [AniList](https://anilist.co),
manga by [MangaDex](https://mangadex.org), scene search by
[trace.moe](https://trace.moe), and themes by [AnimeThemes](https://animethemes.moe).

## Legal & disclaimer

ExoTv does not host any anime or manga. It aggregates third-party sources for **personal,
educational use**. You are responsible for complying with the laws of your jurisdiction
and the terms of the upstream providers. Do not deploy this publicly to redistribute
copyrighted content. No warranty is provided.
