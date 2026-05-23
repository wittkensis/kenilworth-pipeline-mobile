# Kenilworth Pipeline — Mobile Web App

## What This Is

A mobile-first web app for tracking job applications, replacing a local Tauri desktop app. Live at `https://pipeline.ericwittke.com`. Personal use only — single-user, password-protected, no multi-tenancy.

The user needed to update opportunities on mobile (adding new applications, advancing statuses) without being tied to a desktop. The entire UI was rethought for thumbs: bottom sheets replace modals, chip selectors replace dropdowns, large tap targets throughout.

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15.3.2, App Router, TypeScript strict |
| Database | SQLite via better-sqlite3 (server-only, WAL mode) |
| Styling | Tailwind v4 + `@theme` color tokens |
| Auth | httpOnly cookie storing APP_PASSWORD value directly |
| Deploy | Docker → Coolify VPS (76.13.102.88) → Traefik HTTPS |
| Data persistence | `/data/pipeline.db` bind-mounted from VPS host |

---

## Project Structure

```
src/
  app/
    api/
      auth/login/     POST — sets auth cookie
      auth/logout/    POST — clears auth cookie
      companies/      GET list, POST create
      companies/[id]/ GET one, PUT update, DELETE
      opportunities/  GET list (with JOIN), POST create
      opportunities/[id]/ GET one, PUT update, DELETE
      stats/          GET dashboard counts
    companies/        Companies tab page
    login/            Login page
    pipeline/         Pipeline tab page (default after auth)
    globals.css       Tailwind import + @theme tokens + mobile resets
    layout.tsx        Root layout
    page.tsx          Returns null — middleware handles redirect
  components/
    BottomNav.tsx     Fixed bottom nav: Pipeline | FAB | Companies
    CompanySheet.tsx  Bottom sheet: add/edit company
    OpportunitySheet.tsx Bottom sheet: add/edit opportunity
    Sheet.tsx         Base bottom sheet (backdrop, handle, scroll, body lock)
    StatusBadge.tsx   Colored inline badge for opportunity status
  lib/
    auth.ts           AUTH_COOKIE const + checkPassword()
    db.ts             better-sqlite3 singleton, WAL mode, schema init
    middleware.ts     Route protection + root redirect
    types.ts          All types + STATUS_OPTIONS + EXCITEMENT_OPTIONS arrays
```

---

## Database Schema

### `companies`
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
name TEXT NOT NULL UNIQUE
excitement TEXT CHECK(excitement IN ('Dream Job','Highly Considering','Intriguing','Not Sure Yet','Never')) DEFAULT 'Not Sure Yet'
size_band TEXT
general_location TEXT
specific_location TEXT
description TEXT
domain TEXT
core_competencies TEXT
job_board_link TEXT
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### `opportunities`
```sql
id INTEGER PRIMARY KEY AUTOINCREMENT
company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE
position_title TEXT NOT NULL
job_posting_url TEXT
status TEXT CHECK(status IN ('Applied','Interviewing','Rejected','Early Discussions','No Go','Apply Soon')) DEFAULT 'Applied'
application_date DATE NOT NULL
rejection_stage TEXT          -- only set when status = 'Rejected'
contacts TEXT
notes TEXT
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

Indexes on: `company_id`, `status`, `application_date DESC`, `companies.name`, `companies.excitement`.

---

## Design System

Kenilworth v1.0, dark mode, folk-modernist palette:

| Token | Hex | Usage |
|-------|-----|-------|
| `folk-ink` | `#1A1816` | Page background |
| `folk-charcoal` | `#2D2A26` | Sheet/card backgrounds |
| `folk-stone` | `#8B7E6A` | Secondary text, borders, dividers |
| `folk-sand` | `#E8DCC8` | Input backgrounds |
| `folk-cream` | `#F5F1E8` | Primary text |

Status colors (not Kenilworth tokens — semantic only):

| Status | Color |
|--------|-------|
| Apply Soon | `#FCD34D` |
| Applied | `#60A5FA` |
| Early Discussions | `#C084FC` |
| Interviewing | `#4ADE80` |
| Rejected | `#F87171` |
| No Go | `#9CA3AF` |

Excitement colors:

| Level | Color |
|-------|-------|
| Dream Job | `#4ADE80` |
| Highly Considering | `#60A5FA` |
| Intriguing | `#C084FC` |
| Not Sure Yet | `#9CA3AF` |
| Never | `#F87171` |

---

## Mobile UI Patterns

**All interactions happen in bottom sheets** — never navigate to a new page for editing.

**Sheet anatomy:** `Sheet.tsx` provides the chrome (backdrop, drag handle, header with close, scroll container, body overflow lock). `OpportunitySheet` and `CompanySheet` are slotted into it.

**Company picker in OpportunitySheet:** An inline text input with a filtered dropdown list below it — NOT a native `<select>`. This was a deliberate choice because native selects with 241 entries are unusable on mobile.

**Chip selectors:** Status and Excitement use rows of tap-to-select chips instead of dropdowns. Chips carry their own color so the selection is immediately visible.

**Bottom nav:** Three zones — Pipeline tab (left), FAB/add button (center, raised), Companies tab (right). The FAB always opens OpportunitySheet. The nav is fixed at bottom, page content has `pb-24` to avoid overlap.

**Viewport:** All full-height containers use `h-dvh` (dynamic viewport height) not `h-screen`, so the sheet doesn't clip when the iOS address bar shrinks.

**iOS zoom prevention:** All `input`, `select`, `textarea` have `font-size: 16px` in globals.css. Below 16px iOS auto-zooms on focus.

**No tap highlight:** `* { -webkit-tap-highlight-color: transparent; }` in globals.css.

---

## Auth

- Cookie name: `pipeline_auth` (constant `AUTH_COOKIE` in `src/lib/auth.ts`)
- Cookie value: the raw `APP_PASSWORD` string
- Max age: 30 days
- httpOnly, SameSite=Lax
- Middleware checks every route except `/login` and `/api/auth/login`
- `page.tsx` returns `null` — middleware handles the `/` → `/pipeline` redirect at the edge, avoiding SSR redirect issues

---

## Deployment

- **Coolify app UUID:** `x14fj17alowt6v1vo7nvuv02`
- **Repo:** `wittkensis/kenilworth-pipeline-mobile` (public — no secrets in code)
- **Required env vars in Coolify:** `APP_PASSWORD`
- **Persistent volume:** `/data` on host → `/data` in container. Record inserted directly into Coolify's PostgreSQL `local_persistent_volumes` table (resource_id=4, resource_type=`App\Models\Application`) because the Coolify API's persistent storage endpoints return 404.
- **Database path:** `/data/pipeline.db` (set via `DATABASE_PATH` env var in Dockerfile)
- **Traefik** handles HTTPS/TLS automatically via Let's Encrypt.

Deploy flow: push to `main` → Coolify auto-deploys → container replaces in-place, `/data` volume survives.

---

## Critical Gotchas

**Docker / Coolify build quirks discovered during initial setup:**

1. **Coolify injects `NODE_ENV=production` at build time** — this causes `npm ci` to skip devDependencies (TypeScript, Tailwind, webpack all missing). Fix: `RUN NODE_ENV=development npm ci` in the `deps` stage. Do not use `ENV NODE_ENV=development` (stage-wide ENV persists into next stage).

2. **`@/` path alias doesn't resolve in Docker Alpine without explicit webpack config.** `tsconfig.json` `paths` alone is not enough. `next.config.ts` must include:
   ```ts
   webpack: (config) => {
     config.resolve.alias['@'] = path.resolve(__dirname, 'src');
     return config;
   }
   ```

3. **`public/` directory must exist.** The Dockerfile COPYs it; if it doesn't exist the build fails with "not found". Keep `public/.gitkeep`.

4. **`redirect()` in `page.tsx` during static generation causes `<Html> should not be imported outside of pages/_document` in Next.js 15.** Don't call `redirect()` in page components. Do root redirects in middleware only.

5. **Coolify API `/persistentstorage` endpoints return 404.** Use direct PostgreSQL insertion instead (see Deployment section above).
