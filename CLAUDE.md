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

Copy `.env.example` to `.env`. Use `.env.local` to override for local dev (e.g. `NEXTAUTH_URL=http://localhost:3000`). Key variables:
- `DATABASE_URL` — pooled Neon connection (app queries, uses pgbouncer)
- `DIRECT_URL` — direct Neon connection (migrations only, no pgbouncer)
- `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` — NextAuth / Google OAuth
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` — Web Push notifications
- `CRON_SECRET` — bearer token for both cron endpoints; must also be set in Vercel's Environment Variables for scheduled jobs to authenticate

## Architecture

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind v4 + Prisma 7 + Neon (PostgreSQL) + NextAuth v5 + web-push.

**PWA:** The app is an installable PWA. `public/sw.js` is the service worker. `src/app/manifest.ts` exports the web app manifest. `ServiceWorkerUpdater` handles SW version updates.

**Middleware:** `src/proxy.ts` is the Next.js middleware file (Next.js 16 uses `proxy.ts` instead of `middleware.ts`). It protects all routes except `/`, `/login`, `/api/auth/*`, `/api/cron/*`, and `/api/push/*`. The cron and push routes have their own auth (`CRON_SECRET` and `auth()` respectively).

**Auth:** `src/auth.ts` configures NextAuth with Google OAuth and the Prisma adapter. Session always includes `user.id`. `src/types/next-auth.d.ts` extends the session type. On first login (`createUser` event), Brazilian holidays are automatically seeded for the user via `seedHolidaysForUser`. Google OAuth must have both `https://memodate.vercel.app/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/google` registered as authorized redirect URIs.

**Database:** Prisma client is generated into `src/generated/prisma/` (not `node_modules`). The singleton in `src/lib/prisma.ts` uses `PrismaNeon` adapter for serverless-compatible connections. Always import from `@/generated/prisma`, not `@prisma/client`.

**Server Actions:** All mutations go through `src/lib/actions/`. They authenticate via `auth()`, validate input, and call Prisma directly. On success events actions `revalidatePath('/dashboard')` and redirect with a `?toast=` query param that `Toast` component reads.

**API Routes:**
- `/api/auth/[...nextauth]` — NextAuth handler
- `/api/cron/daily` — Daily push notification job. Runs at 11:00 UTC per `vercel.json`. For each user, resolves "today" in their timezone and sends push notifications for events where `date - daysBeforeAlert == today`.
- `/api/cron/monthly` — Monthly WhatsApp summary. Runs at 11:00 UTC on the 1st of each month. Sends a formatted message via CallMeBot to users who configured `whatsappPhone` + `whatsappApiKey`.
- `/api/push/subscribe` — Saves/deletes a `PushSubscription` record for the current user
- `/api/push/test` — Sends a test push to the current user

**WhatsApp (CallMeBot):** Users configure their number and API key in Settings. The number must be in the format used by WhatsApp itself — Brazilian numbers do NOT include the 9th digit (e.g. `553195650333`, not `5531995650333`). API key is obtained by sending `I allow callmebot to send me messages` to +34 684 770 005 on WhatsApp.

**Event Types:** `src/lib/eventTypeConfig.ts` is the single source of truth for type labels and Tailwind color classes. All display code reads from `EVENT_TYPE_CONFIG` — don't hardcode type strings elsewhere. Avoid `📅` emoji for notifications as it renders with the number 17 on some platforms.

**Dashboard layout:** `src/app/dashboard/layout.tsx` wraps all dashboard pages with `BottomNav`, `PageTransition`, `ErrorBoundary`, and `NetworkStatus`. The layout uses `h-[100dvh] flex flex-col overflow-hidden` — scrollable areas must use the `ScrollArea` component to work correctly inside this constraint.

**Date handling:** The cron job resolves each user's "today" using their stored `timezone` (IANA string, default `America/Sao_Paulo`) before checking which events to notify. All dates are stored as UTC in the DB.

**Cron jobs (Vercel Hobby plan):** Max 100 cron jobs, minimum interval once per day, precision ±59 min. `CRON_SECRET` must be set in Vercel's Environment Variables panel — the `.env` file is not used by Vercel at runtime.
