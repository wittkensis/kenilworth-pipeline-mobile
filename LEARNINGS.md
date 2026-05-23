# Build Learnings

Hard-won fixes from the initial build of this app. Each entry documents what broke, why it was non-obvious, the fix, and which skill should carry the knowledge forward.

---

## 1. Coolify injects NODE_ENV=production at Docker build time

**What broke:** `npm ci` installed only 64 of 92 packages — TypeScript, Tailwind, and all of webpack were missing. The build failed with module-not-found errors.

**Why it was non-obvious:** Locally `npm ci` works fine. The Coolify platform silently injects `NODE_ENV=production` into the Docker build environment before the first `RUN` instruction, causing npm to treat devDependencies as optional and skip them. Nothing in the Coolify UI surfaces this.

**Fix:** Inline the env override for that specific `RUN` step — do not use an `ENV` directive (which persists across stages and causes a second problem; see #2):
```dockerfile
# deps stage
RUN NODE_ENV=development npm ci
```

**Skill:** `kw--infra/platforms/coolify.md` — add a Dockerfile template note. Any Next.js or TypeScript app deployed through Coolify needs this pattern.

---

## 2. ENV NODE_ENV=development in the builder stage breaks Next.js SSR

**What broke:** After fixing #1 by using `ENV NODE_ENV=development` (stage-wide), the build started producing a cryptic error: `<Html> should not be imported outside of pages/_document` at the `/404` route during static generation.

**Why it was non-obvious:** The error message points to a Next.js page structure problem, not an environment variable problem. The actual cause: `ENV NODE_ENV=development` persisted into the builder stage, causing Next.js to use the development React SSR build, which behaves differently during static prerendering.

**Fix:** Scope `NODE_ENV=development` inline to `npm ci` only. Explicitly override it for the build step:
```dockerfile
FROM base AS deps
RUN NODE_ENV=development npm ci   # inline only, no ENV directive

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN NODE_ENV=production npm run build  # explicit production build
```

**Skill:** `kw--infra/platforms/coolify.md` — include the final Dockerfile template. The `ENV` vs `RUN`-inline distinction for NODE_ENV is load-bearing.

---

## 3. @/ path alias requires explicit webpack config in next.config.ts

**What broke:** `Module not found: Can't resolve '@/components/BottomNav'` — only in the Docker/Alpine build, never locally.

**Why it was non-obvious:** `tsconfig.json` `paths` configuration works during local development because the TypeScript language server and ts-node handle path resolution. In Docker Alpine, webpack resolves module paths independently and ignores `tsconfig.json` paths by default. This is a known gap that only surfaces in containerized builds.

**Fix:** Add an explicit webpack alias in `next.config.ts`:
```ts
webpack: (config) => {
  config.resolve.alias['@'] = path.resolve(__dirname, 'src');
  return config;
}
```

**Skill:** `engineer` — any Next.js project using `@/` imports that will be built in Docker needs this. Should be in the Next.js + Docker boilerplate checklist.

---

## 4. redirect() in a page.tsx causes a static generation error in Next.js 15

**What broke:** Build error: `<Html> should not be imported outside of pages/_document`. Appeared on `/404`, not on the page with the redirect.

**Why it was non-obvious:** The error is thrown at the 404 page, not at the root page where `redirect()` was called. In Next.js 15, calling `redirect()` in a Server Component during static generation triggers an internal state that corrupts the static render pipeline for error pages. The symptom is misleading.

**Fix:** Never call `redirect()` in a page component. Move all redirects to middleware, which runs at the edge before static rendering:
```ts
// middleware.ts
if (pathname === '/') {
  return NextResponse.redirect(new URL('/pipeline', request.url));
}
```
```tsx
// page.tsx — returns null; redirect is handled by middleware
export default function Root() { return null; }
```

**Skill:** `engineer` — add a Next.js 15 note: root-level redirects belong in middleware, not in Server Components. This is a behavioral change from earlier Next.js versions.

---

## 5. Next.js standalone build requires public/ to exist

**What broke:** Docker runner stage failed with `/app/public: not found` during the COPY step.

**Why it was non-obvious:** The project had no `public/` directory — it was never needed. The Dockerfile's `COPY --from=builder /app/public ./public` instruction fails fatally if the source directory doesn't exist, even if nothing is in it.

**Fix:** Create `public/.gitkeep` to ensure the directory exists in the repo and therefore in the builder stage.

**Skill:** `engineer` — Next.js + Docker checklist: always include `public/.gitkeep` if the project has no static assets. Alternatively, add a `RUN mkdir -p public` in the builder stage before the copy.

---

## 6. Private GitHub repos require Coolify deploy key setup

**What broke:** Coolify build failed with `fatal: could not read Username for 'https://github.com'` — it couldn't clone the repo.

**Why it was non-obvious:** Coolify is self-hosted on a VPS with no GitHub credentials configured. It can't clone private repos over HTTPS without a token or SSH deploy key, and the error message looks like a generic git auth failure rather than a Coolify configuration problem.

**Fix (used here):** Made the repo public. This is acceptable because the app contains no secrets — passwords live in Coolify env vars, the database is on the VPS host, and `.gitignore` covers all sensitive files.

**Alternative fix:** In Coolify Settings → Source, add a GitHub deploy key (SSH). Required for repos that must remain private.

**Skill:** `kw--deploy` / `kw--infra/platforms/coolify.md` — document both paths. New apps targeting Coolify should default to public repos or configure deploy keys before the first deploy attempt.

---

## 7. Coolify persistent storage API is non-functional

**What broke:** Attempts to attach a persistent volume via the Coolify REST API (`/api/v1/applications/{uuid}/persistentstorage`) returned 404. The Coolify UI didn't expose volume config for this app type either.

**Why it was non-obvious:** The Coolify API docs list these endpoints as valid. The 404 appears to be a version-specific gap in the self-hosted instance (not a permissions error).

**Fix:** Insert the volume record directly into Coolify's PostgreSQL database:
```sql
INSERT INTO local_persistent_volumes (uuid, name, mount_path, host_path, resource_type, resource_id, created_at, updated_at, is_preview_suffix_enabled)
VALUES (gen_random_uuid()::text, 'pipeline-data', '/data', '/data', 'App\\Models\\Application', <app_db_id>, NOW(), NOW(), false);
```
The `resource_id` is the integer primary key of the app in Coolify's `applications` table (not the UUID). Redeploy after inserting.

**Skill:** `kw--infra/platforms/coolify.md` — document the PostgreSQL workaround as the known-working method for persistent volumes on this instance. Don't attempt the API route.
