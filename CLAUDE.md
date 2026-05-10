# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # prisma generate + next build
npm run lint         # ESLint

# Database
npx prisma migrate dev    # Run migrations (uses DIRECT_URL from prisma.config.ts)
npx prisma studio         # Open database browser
npx prisma generate       # Regenerate client after schema changes

# Generate VAPID keys for push notifications
npx web-push generate-vapid-keys
```

## Environment Variables

Copy `.env.example` to `.env`. Key variables:
- `DATABASE_URL` — pooled Neon connection (app queries, uses pgbouncer)
- `DIRECT_URL` — direct Neon connection (migrations only, no pgbouncer)
- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — NextAuth / Google OAuth
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` — Web Push notifications
- `CRON_SECRET` — bearer token for the daily cron endpoint

## Architecture

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + Prisma 7 + Neon (PostgreSQL) + NextAuth v5 + web-push.

**PWA:** The app is a installable PWA. `public/sw.js` is the service worker. `src/app/manifest.ts` exports the web app manifest. `ServiceWorkerUpdater` handles SW version updates.

**Middleware:** `src/proxy.ts` is the Next.js middleware file (Next.js 16 uses `proxy.ts` instead of `middleware.ts`). It protects all routes except `/`, `/login`, `/api/auth/*`, `/api/cron/*`, and `/api/push/*`.

**Auth:** `src/auth.ts` configures NextAuth with Google OAuth and the Prisma adapter. Session always includes `user.id`. `src/types/next-auth.d.ts` extends the session type. On first login (`createUser` event), Brazilian holidays are automatically seeded for the user via `seedHolidaysForUser`.

**Database:** Prisma client is generated into `src/generated/prisma/` (not `node_modules`). The singleton in `src/lib/prisma.ts` uses `PrismaNeon` adapter for serverless-compatible connections. Always import from `@/generated/prisma`, not `@prisma/client`.

**Server Actions:** All mutations go through `src/lib/actions/events.ts`. They authenticate via `auth()`, validate input, and call Prisma directly. On success they `revalidatePath('/dashboard')` and redirect with a `?toast=` query param that `Toast` component reads.

**API Routes:**
- `/api/auth/[...nextauth]` — NextAuth handler
- `/api/cron/daily` — Daily push notification job. Protected by `Authorization: Bearer CRON_SECRET`. Runs at 11:00 UTC per `vercel.json`. Handles per-user timezones and recurring vs one-time events.
- `/api/push/subscribe` — Saves a `PushSubscription` record for the current user
- `/api/push/test` — Sends a test push to the current user

**Event Types:** `src/lib/eventTypeConfig.ts` is the single source of truth for type labels and Tailwind color classes. All display code reads from `EVENT_TYPE_CONFIG` — don't hardcode type strings elsewhere.

**Dashboard layout:** `src/app/dashboard/layout.tsx` wraps all dashboard pages with `BottomNav`, `PageTransition`, `ErrorBoundary`, and `NetworkStatus`. The layout uses `h-[100dvh] flex flex-col overflow-hidden` — scrollable areas must use the `ScrollArea` component to work correctly inside this constraint.

**Date handling:** The cron job resolves each user's "today" using their stored `timezone` (IANA string, default `America/Sao_Paulo`) before checking which events to notify. All dates are stored as UTC in the DB.
