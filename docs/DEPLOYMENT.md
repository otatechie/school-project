# Deploying GovPay Desk to Dokploy

There are two ways to deploy this, and they are not interchangeable. Choosing
one and configuring it as if it were the other is the most common cause of a
502 from the proxy.

---

## Which one are you using?

| | **Compose** | **Application** |
|---|---|---|
| Dokploy service type | Compose | Application |
| Uses `docker-compose.yml` | Yes | **No — ignored entirely** |
| Creates a MySQL container | Yes, automatically | **No — you must create one** |
| `DB_HOST` | `db` | the database service's own hostname |
| Port to expose | handled by compose | must be set to **80** under Domains |

If your service was created as an **Application**, `docker-compose.yml` is not
read at all. There is no `db` service, and `DB_HOST=db` resolves to nothing.

---

## Option A — Compose (simplest)

Dokploy creates both the app and its database from `docker-compose.yml`.

1. Dokploy → your project → **Create Service** → **Compose**
2. Point it at this repository; it will find `docker-compose.yml`
3. Under **Environment**, paste the variables from `.env.docker.example`
4. Under **Domains**, add `govpay.win` → service `app`, port `80`
5. Deploy

`DB_HOST=db` is correct here — it is the name of the service in the compose
file.

---

## Option B — Application

You are running only the app, so the database must exist separately.

1. **Create the database first.** Dokploy → **Create Service** → **Database** →
   MySQL 8. Note the name you give it.
2. Dokploy → **Create Service** → **Application**, pointing at this repository
   with build type **Dockerfile**.
3. Under **Domains**, add `govpay.win` and set the **container port to 80**.
   Without this Dokploy does not know where to send traffic.
4. Under **Environment**, set the variables below. `DB_HOST` must be the
   database service's hostname from step 1 — not `db`, and never `127.0.0.1`,
   which is the app container itself.

```
APP_NAME="GovPay Desk"
APP_ENV=production
APP_KEY=base64:...            # php artisan key:generate --show
APP_DEBUG=false
APP_URL=https://govpay.win

DB_CONNECTION=mysql
DB_HOST=<your database service hostname>
DB_PORT=3306
DB_DATABASE=govpay
DB_USERNAME=govpay
DB_PASSWORD=<the password you set>

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=sync

LOG_CHANNEL=stderr
LOG_LEVEL=warning

ANTHROPIC_API_KEY=            # optional; blank disables the AI features
ANTHROPIC_MODEL=claude-opus-5

SEED_ON_FIRST_BOOT=true
DEMO_MODE=true
DEMO_PASSWORD=password
```

---

## Cloudflare

The domain is proxied through Cloudflare. Under **SSL/TLS → Overview**, use
**Full**. **Full (strict)** requires a valid certificate on the origin, which
Dokploy's internal proxy does not present, and produces a 502.

---

## Diagnosing a 502

A 502 means the proxy reached your server but got no valid response. Work
through these in order.

**0. Is the domain pointing at the right port?**
This is the most common cause and needs no redeploy. Dokploy → service →
**Domains** → the **Port** column must be **80**. The container listens on 80;
Dokploy defaults new domains to 8080, and nothing answers there.

The give-away is a 502 in the browser while the logs look completely healthy:

```
NOTICE: fpm is running
NOTICE: ready to handle connections
INFO success: nginx entered RUNNING state
Starting web server on port 80.
```

If the container says it is serving and the proxy says bad gateway, they are
talking about different ports.

**1. Is the container running?**
Dokploy → service → the status badge. If it is restarting, the app is dying at
boot.

**2. What do the logs say?**
Dokploy → service → **Logs**. The entrypoint prints its progress and, on
failure, a banner:

```
==============================================
STARTUP PROBLEM: <what went wrong>
==============================================
```

**3. Is the port set?**
On an Application deploy, Dokploy needs the container port under **Domains**.
It is **80**. If this is blank, nothing is routed and every request is a 502.

**4. Can the app reach the database?**
The logs will say `Waiting for the database...` and then either `Running
migrations...` or a banner naming the failure. With `SESSION_DRIVER=database`,
an unreachable database fails *every* request, because the session cannot be
read.

**5. Is `APP_KEY` set?**
The container refuses to start without it, and says so. Generating one per
deploy would invalidate every session, so it is deliberately fatal.

---

## Verifying a healthy deployment

```bash
curl -I https://govpay.win/up      # 200
curl -I https://govpay.win         # 200, or 302 to /login
```

`/up` is Laravel's health endpoint. It answers without touching the database,
so a 200 there with a 500 elsewhere points squarely at the database.
