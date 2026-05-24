---
triggers: [deploy, redeploy, push, coolify, pipeline deploy, go live]
description: Pipeline deploy — Coolify UUID, env vars, SQLite volume, push-to-deploy flow.
---

# kwapp-pipeline--deploy

## Deploy Flow

```bash
git push origin main  # Coolify auto-deploys on push to main
```

Manual trigger if webhook isn't firing:
```bash
curl -s -X POST \
  -H "Authorization: Bearer 1|NwjnoGLmdEqtTR5YSI5NByst0SLZyeOWPpgKFRVwa1954ae1" \
  "http://76.13.102.88:8000/api/v1/applications/x14fj17alowt6v1vo7nvuv02/start"
```

## Coolify Config

| Field | Value |
|-------|-------|
| App UUID | `x14fj17alowt6v1vo7nvuv02` |
| Repo | `wittkensis/kenilworth-pipeline` (public) |
| Branch | `main` |
| VPS | `76.13.102.88` |
| URL | `pipeline.ericwittke.com` |

## Required Env Vars (set in Coolify dashboard)

| Var | Purpose |
|-----|---------|
| `APP_PASSWORD` | Login password (httpOnly cookie auth) |
| `DATABASE_PATH` | `/data/pipeline.db` (set in Dockerfile default, override if needed) |

## Persistent Volume

SQLite lives at `/data/pipeline.db` in the container, bind-mounted from the VPS host.
The volume record is in Coolify's PostgreSQL — inserted directly (Coolify API `/persistentstorage` returns 404).

**Never delete the container without confirming the `/data` volume is preserved.**

## Verification After Deploy

1. Visit `https://pipeline.ericwittke.com/login`
2. Log in with `APP_PASSWORD`
3. Confirm pipeline view loads with existing opportunities
4. Confirm a new opportunity can be created

## SSH Access (for debugging)

```bash
ssh -i ~/.ssh/epw-apps root@76.13.102.88
docker logs <container-id>
```
