# AGENTS.md

## Cursor Cloud specific instructions

### Overview
This is a React 19 + Vite + TypeScript portfolio/business website for "J.A.M Packed SD." The backend uses Convex (cloud-hosted real-time DB + serverless functions) and authentication uses Clerk. There are no local databases or Docker containers.

### Dev commands
See `package.json` scripts. Key commands:
- `bun run dev:web` — Vite dev server only (port 3000)
- `bun run dev` — Vite + Convex dev concurrently (requires Convex credentials)
- `bun run build` — TypeScript check + Vite production build
- `bun run lint` — ESLint

### Known issues
- **ESLint is not a listed dependency.** The `lint` script calls `eslint .` but `eslint` and `eslint-config-next` are not in `package.json`. Running `bun run lint` will fail with "command not found." The `.eslintrc.json` also extends `next/core-web-vitals` and `next/typescript` even though this is not a Next.js project.
- **TypeScript check (`tsc`) passes cleanly** and is the reliable way to validate code quality.

### Environment variables
The app requires a `.env.local` file (see `env.example`). The critical variable is `VITE_CLERK_PUBLISHABLE_KEY` — without it, `App.tsx` throws at startup. For frontend-only development without Clerk/Convex, use placeholder values:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_placeholder
VITE_CONVEX_URL=https://placeholder.convex.cloud
```
The static HTML snapshot in `index.html` will still render even if React fails to initialize, so the Vite dev server serves content at `http://localhost:3000` regardless.

### Running the Vite dev server
Use `bun run dev:web` for frontend-only work. The full `bun run dev` also starts `convex dev` which requires valid Convex project credentials. Vite is configured to run on port 3000 with `open: true` (auto-opens browser).

### External services (all cloud-hosted, no local infra)
- **Convex** — real-time database and serverless functions (requires account + project)
- **Clerk** — authentication (requires publishable key)
- **UploadThing** — image uploads (optional, app works without it)
- **Stripe** — payments (currently disabled, files are `.bak`)
