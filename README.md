# 9jaconnect — Front-End Redesign

Visual redesign scaffold for [9jaconnect](https://9jaconnect.com), based on the July 2026 Redesign Work Pack.

**Rule:** look changes, functionality stays locked. Routes, fields, labels, and actions match the work pack.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** design tokens (green + amber brand scales)
- **Fraunces** (display) + **Outfit** (body)
- **lucide-react**, **framer-motion**, **zod**, **react-hook-form**, **sonner**, **clsx** / **tailwind-merge** / **cva**

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Locked routes (scaffolded)

| Area | Routes |
|------|--------|
| Public | `/`, `/find`, `/professionals/[id]` |
| Auth | `/login`, `/signup/customer`, `/signup/professional`, check-email, forgot/reset password, `/verify-email` |
| Onboarding | `/onboarding/customer`, `/verify-identity` |
| Customer | `/dashboard/customer`, tickets, `/tickets/[ticketId]`, `/review/[ticketId]`, `/account-settings` |
| Professional | `/dashboard/professional`, tickets, profile, settings |
| Admin | `/admin/dashboard`, professionals, users, reviews, communications, categories |
| Shared | Navbar, Footer, `not-found` |

Work pack PDF: `docs/9jaconnect_Redesign_Work_Pack.pdf`

## Notes

- Pages use mock presentation data so UI/UX can be tweaked without touching the live API yet.
- When redesign is approved, wire JWT auth, Google OAuth, and existing backend endpoints without changing locked fields/flows.
