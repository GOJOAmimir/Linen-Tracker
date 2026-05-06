# Infrastructure Context — Self-Hosted GitLab CI/CD on Proxmox

## Physical Host
- **Machine:** Ryzen 7 5800H, 40GB DDR4, ~463GB SSD
- **Hypervisor:** Proxmox VE
- **Network:** `192.168.100.0/24` subnet, Tailscale installed on Proxmox host with subnet routing — all LXC containers are reachable via Tailscale without installing Tailscale on each one

---

## Internal DNS
AdGuard Home runs on LXC `192.168.100.19` and serves as the internal DNS resolver for all containers and the Proxmox host. All containers and the host use `192.168.100.19` as their primary DNS, with `1.1.1.1` as fallback.

DNS rewrites configured in AdGuard:

| Hostname | Resolves To |
|---|---|
| `gitlab.lan` | `192.168.100.18` |
| `runner.lan` | `192.168.100.17` |
| `npm.lan` | `192.168.100.15` |
| `dev-prod.lan` | `192.168.100.13` |
| `dev-db.lan` | `192.168.100.14` |

All internal services and configs reference hostnames, not IPs — IPs are only documented here for reference.

---

## LXC Containers

| VMID | Hostname | IP | DNS | RAM | Disk | Purpose |
|---|---|---|---|---|---|---|
| 100 | `adguard` | `192.168.100.100` | — | 512MB | 2GB | AdGuard Home (internal DNS) |
| 200 | `dev-prod` | `192.168.100.13` | `dev-prod.lan` | 6GB | 40GB | Production deployment target (Docker) |
| 101 | `dev-db` | `192.168.100.14` | `dev-db.lan` | 4GB | 60GB | MySQL 8, PostgreSQL 16, Redis (Docker) |
| 201 | `nginx-proxy-manager` | `192.168.100.15` | `npm.lan` | 1GB | 10GB | Nginx Proxy Manager + Cloudflare Tunnel |
| 202 | `gitlab-runner` | `192.168.100.17` | `runner.lan` | 2GB | 20GB | GitLab Runner (Docker executor) |
| 203 | `gitlab` | `192.168.100.18` | `gitlab.lan` | 4GB | 40GB | GitLab CE + Container Registry |

All LXC containers have nesting enabled. All containers run Ubuntu 24.04.

---

## GitLab
- **Web UI (external):** `https://gitlab.simtechindo.com` (via Cloudflare Tunnel)
- **Web UI (internal):** `http://gitlab.lan`
- **Container Registry:** `http://gitlab.lan:5050` (LAN / Tailscale only)
- **SSH remote:** `ssh://git@gitlab.lan` (LAN / Tailscale only)
- **Version:** GitLab CE, latest
- **Config file:** `/etc/gitlab/gitlab.rb` on the gitlab LXC
- **Registry is HTTP (not HTTPS)** — every Docker daemon that talks to it needs `insecure-registries` configured

---

## Nginx Proxy Manager (LXC 201)
- **IP:** `192.168.100.15`
- **DNS:** `npm.lan`
- **Admin UI:** `http://npm.lan:81` (internal) / `https://npm.simtechindo.com` (external)
- **Docker Compose:** `/opt/nginx-proxy-manager/docker-compose.yml`
- Acts as the unified ingress layer for all services — both internal and external traffic routes through NPM
- Cloudflare Tunnel (`cloudflared`) is installed and running as a systemd service on this LXC
- New apps are exposed by adding a proxy host in NPM pointing to `dev-prod.lan:<app-port>`

### NPM SSL Notes
- **Do not enable Force SSL before the certificate is attached** — NPM will throw an internal error, save the proxy host but drop the SSL config
- Correct flow: save proxy host with SSL = None first, then edit to attach cert + enable Force SSL
- All proxy hosts use **Let's Encrypt** certs (not Cloudflare origin certs)
- Cloudflare SSL/TLS mode set to **Full** (not Flexible, not Full Strict)

### Proxy Hosts configured in NPM

| Domain | Forward To | SSL | Notes |
|---|---|---|---|
| `gitlab.simtechindo.com` | `gitlab.lan:80` | Let's Encrypt, Force SSL, HTTP/2 on | |
| `linen.simtechindo.com` | `dev-prod.lan:8080` | Let's Encrypt, Force SSL, HTTP/2 on | Cache assets + WebSocket support enabled |
| `linen-ws.simtechindo.com` | `dev-prod.lan:8081` | Let's Encrypt, Force SSL, HTTP/2 on | WebSocket support enabled; 502 in browser is expected — WSS only |
| `npm.simtechindo.com` | `npm.lan:81` | Let's Encrypt, Force SSL, HTTP/2 on | |
| `adguard.simtechindo.com` | `192.168.100.19:80` | Let's Encrypt, Force SSL, HTTP/2 on | |
| `status.simtechindo.com` | `dev-prod.lan:3001` | Let's Encrypt, Force SSL, HTTP/2 on | |

### docker-compose.yml
```yaml
services:
  npm:
    image: jc21/nginx-proxy-manager:latest
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "81:81"
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
```

---

## Cloudflare Tunnel
- **Tunnel name:** (your tunnel name)
- **cloudflared installed on:** `192.168.100.15` (nginx-proxy-manager LXC)
- **Runs as:** systemd service (`cloudflared.service`)
- **Traffic flow:** `Internet → Cloudflare DNS → Cloudflare Tunnel → NPM (npm.lan:80) → backend service`

### Public Hostnames configured in Cloudflare

| Subdomain | Domain | Forwards to |
|---|---|---|
| `gitlab` | `simtechindo.com` | `192.168.100.15:80` |
| `linen` | `simtechindo.com` | `192.168.100.15:80` |
| `linen-ws` | `simtechindo.com` | `192.168.100.15:80` |
| `npm` | `simtechindo.com` | `192.168.100.15:80` |
| `adguard` | `simtechindo.com` | `192.168.100.15:80` |
| `status` | `simtechindo.com` | `192.168.100.15:80` |

### Service Access Summary

| Service | Access Method | URL |
|---|---|---|
| GitLab web UI | Cloudflare Tunnel | `https://gitlab.simtechindo.com` |
| Linen Tracker | Cloudflare Tunnel | `https://linen.simtechindo.com` |
| WebSocket Server | Cloudflare Tunnel | `wss://linen-ws.simtechindo.com` (WSS only — 502 in browser is normal) |
| NPM Admin | Cloudflare Tunnel | `https://npm.simtechindo.com` |
| AdGuard Home | Cloudflare Tunnel | `https://adguard.simtechindo.com` |
| Uptime Kuma | Cloudflare Tunnel | `https://status.simtechindo.com` |
| Container Registry | LAN / Tailscale only | `http://gitlab.lan:5050` |
| GitLab SSH | LAN / Tailscale only | `ssh://git@gitlab.lan` |

---

## GitLab Runner
- **Executor:** Docker
- **Default image:** `docker:24`
- **Privileged:** yes (required for Docker-in-Docker builds)
- **Config:** `/etc/gitlab-runner/config.toml` on the runner LXC
- **volumes:** `["/cache"]` — no socket mount (uses dind instead)
- **Registered as:** instance runner, runs untagged jobs

`/etc/docker/daemon.json` on the runner LXC:
```json
{
  "insecure-registries": ["gitlab.lan:5050"]
}
```

---

## dev-prod Container
- **IP:** `192.168.100.13` / **DNS:** `dev-prod.lan`
- **Docker installed**, SSH on port 22, `PermitRootLogin yes`, `PubkeyAuthentication yes`
- Each deployed app lives in `/opt/<project-name>/` with its own `docker-compose.yml` and `.env`
- Apps expose their port directly via `ports:` — NPM handles all routing and SSL termination
- No per-app Nginx — NPM is the single ingress layer for everything

`/etc/docker/daemon.json` on dev-prod:
```json
{
  "insecure-registries": ["gitlab.lan:5050"]
}
```

---

## dev-db Container
- **IP:** `192.168.100.14` / **DNS:** `dev-db.lan`
- MySQL 8 on port `3306`
- PostgreSQL 16 on port `5432`
- Redis Alpine on port `6379`
- Each service has its own `/opt/<service>/docker-compose.yml`
- Accessible from dev-prod via `dev-db.lan`

---

## Monitoring

### Uptime Kuma
- **Deployed on:** `dev-prod` at `/opt/uptime-kuma/`
- **External URL:** `https://status.simtechindo.com`
- **Port:** `3001`
- No env vars, no external DB — uses local SQLite in `./data`

`/opt/uptime-kuma/docker-compose.yml`:
```yaml
services:
  uptime-kuma:
    image: louislam/uptime-kuma:1
    restart: unless-stopped
    ports:
      - "3001:3001"
    volumes:
      - ./data:/app/data
```

### Monitors configured

| Name | Type | Target | Notes |
|---|---|---|---|
| GitLab | HTTP(s) | `https://gitlab.simtechindo.com` | Full stack check via Cloudflare Tunnel |
| Linen Tracker | HTTP(s) | `https://linen.simtechindo.com` | Full stack check via Cloudflare Tunnel |
| NPM Admin | HTTP(s) | `https://npm.simtechindo.com` | Full stack check via Cloudflare Tunnel |
| AdGuard | HTTP(s) | `https://adguard.simtechindo.com` | Full stack check via Cloudflare Tunnel |
| WebSocket Server | TCP Port | `dev-prod.lan:8081` | HTTP check not used — 502 is expected in browser |
| MySQL | TCP Port | `dev-db.lan:3306` | |
| PostgreSQL | TCP Port | `dev-db.lan:5432` | |
| Redis | TCP Port | `dev-db.lan:6379` | |
| Container Registry | TCP Port | `gitlab.lan:5050` | |
| GitLab SSH | TCP Port | `gitlab.lan:22` | |

### Notification
- **Channel:** Email (SMTP)
- **Provider:** Hostinger business email (`alerts@simtechindo.com` or equivalent)
- **SMTP Host:** `smtp.hostinger.com`, port `587`, STARTTLS
- **Retries before alert:** 2 (avoids false alarms from brief blips)
- **Heartbeat interval:** 60 seconds

### Email DNS Records (Cloudflare)
All three email authentication records are configured on `simtechindo.com`:

| Type | Name | Purpose |
|---|---|---|
| TXT | `@` | SPF — `v=spf1 include:_spf.mail.hostinger.com ~all` |
| TXT | `hostingermail1._domainkey` | DKIM — provided by Hostinger |
| TXT | `_dmarc` | DMARC |

---

## GitLab Project Structure
Projects live under the **`simtechdev`** group. Group-level CI/CD variables are inherited by all projects automatically.

### Group-level CI/CD Variables (simtechdev)

| Variable | Type | Notes |
|---|---|---|
| `REGISTRY_HOST` | Variable | `gitlab.lan:5050` |
| `DEPLOY_HOST` | Variable | `dev-prod.lan` |
| `DEPLOY_USER` | Variable | `root` |
| `DEPLOY_KEY` | File | Ed25519 private key, newline at end — masked, protected |

### Project-level CI/CD Variables (per project)

All app-specific env vars are stored here and written to `/opt/<project-name>/.env` by the deploy job on every pipeline run. GitLab is the single source of truth — `.env` files on dev-prod are generated artifacts, never manually maintained.

Typical variables per project (exact set varies per app):

| Variable | Type | Notes |
|---|---|---|
| `PORT` | Variable | App listen port |
| `DB_HOST` | Variable | e.g. `dev-db.lan` |
| `DB_PORT` | Variable | e.g. `3306` |
| `DB_NAME` | Variable | Masked |
| `DB_USER` | Variable | Masked |
| `DB_PASS` | Variable | Masked |
| `TRIGGER_SECRET` | Variable | Masked — any app-specific secrets |

`$CI_REGISTRY`, `$CI_REGISTRY_USER`, `$CI_REGISTRY_PASSWORD`, `$CI_REGISTRY_IMAGE`, `$CI_COMMIT_SHORT_SHA` are all **built-in GitLab variables** — never set manually.

### .env Generation Notes
- The deploy job writes `.env` via `printf` inside the SSH command — overwrites the file on every deploy
- **Do not** use both `env_file:` and `environment:` with `${VAR}` refs in `docker-compose.yml` — use `env_file:` only, drop the `environment:` block
- If the `.env` on dev-prod is stale or doubled, wipe it with `truncate -s 0 /opt/<project>/.env` and re-run the pipeline

---

## CI/CD Pipeline Structure

Every project follows this pattern:

**Stages:** `test → build → deploy`

**test stage:**
- Image: language-specific (e.g. `node:20-alpine`, `python:3.12`, `php:8.2`)
- Runs `npm test` / `pytest` / `php artisan test` etc.
- Runs on `main` and `merge_requests`

**build stage:**
- Image: `docker:24` with `docker:24-dind` sidecar
- dind started with `command: ["--insecure-registry=gitlab.lan:5050"]` — **must be hardcoded here, variable expansion does not work in service `command:`**
- Variables: `DOCKER_TLS_CERTDIR: ""`, `DOCKER_HOST: tcp://docker:2375`
- Logs into `$CI_REGISTRY` using built-in `$CI_REGISTRY_USER` / `$CI_REGISTRY_PASSWORD`
- Builds image, tags with `$CI_COMMIT_SHORT_SHA` and `latest`, pushes both
- Dockerfile lives inside the project subdirectory if monorepo, root if single app

**deploy stage:**
- Image: `alpine` with `openssh` installed — use `openssh`, not `openssh-client` (removed in Alpine 3.23+)
- SSHes into `$DEPLOY_HOST` (`dev-prod.lan`) using `$DEPLOY_KEY`
- Uses `$CI_PROJECT_NAME` to reference `/opt/<project-name>/` — no hardcoded project paths
- Writes `.env` to `/opt/$CI_PROJECT_NAME/.env` via `printf` **before** pulling the image — overwrites on every deploy
- Runs `docker compose pull` + `docker compose up -d --remove-orphans` + `docker image prune -f`
- Only runs on `main`
- `docker-compose.yml` on dev-prod uses `env_file:` only — no `environment:` block with `${VAR}` refs

### Standard `.gitlab-ci.yml` Template

```yaml
stages:
  - test
  - build
  - deploy

variables:
  APP_DIR: "."        # override if monorepo subdirectory
  APP_PORT: "8080"    # override per project

# ─── TEST ───────────────────────────────────────────────
test:
  stage: test
  image: node:20-alpine   # change per stack
  cache:
    key: $CI_COMMIT_REF_SLUG
    paths:
      - $APP_DIR/node_modules/
  before_script:
    - cd $APP_DIR && npm ci
  script:
    - npm test
  only:
    - main
    - merge_requests

# ─── BUILD ──────────────────────────────────────────────
build:
  stage: build
  image: docker:24
  services:
    - name: docker:24-dind
      command: ["--insecure-registry=gitlab.lan:5050"]  # cannot use variable here
  variables:
    DOCKER_TLS_CERTDIR: ""
    DOCKER_HOST: tcp://docker:2375
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA -f $APP_DIR/Dockerfile $APP_DIR
    - docker tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main

# ─── DEPLOY ─────────────────────────────────────────────
deploy:
  stage: deploy
  image: alpine
  before_script:
    - apk add --no-cache openssh  # openssh-client does not exist in Alpine 3.23+, use openssh
    - eval $(ssh-agent -s)
    - chmod 400 $DEPLOY_KEY
    - ssh-add $DEPLOY_KEY
  script:
    - ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$DEPLOY_HOST "
        mkdir -p /opt/$CI_PROJECT_NAME &&
        printf 'PORT=%s\nDB_HOST=%s\nDB_PORT=%s\nDB_USER=%s\nDB_PASS=%s\nDB_NAME=%s\nTRIGGER_SECRET=%s\n' \
          '$PORT' '$DB_HOST' '$DB_PORT' '$DB_USER' '$DB_PASS' '$DB_NAME' '$TRIGGER_SECRET' \
          > /opt/$CI_PROJECT_NAME/.env &&
        docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY &&
        docker compose -f /opt/$CI_PROJECT_NAME/docker-compose.yml pull &&
        docker compose -f /opt/$CI_PROJECT_NAME/docker-compose.yml up -d --remove-orphans &&
        docker image prune -f
      "
  only:
    - main
```

**Stack-specific changes to test stage:**
- Node.js: `image: node:20-alpine`, `npm ci`, `npm test`
- Laravel/PHP: `image: php:8.2`, composer install, `php artisan test`
- Python: `image: python:3.12`, `pip install`, `pytest`
- Go: `image: golang:1.22`, `go test ./...`

---

## Per-Project Checklist for a New Project

**On dev-prod:**
- [ ] Create `/opt/<project-name>/`
- [ ] Create `/opt/<project-name>/docker-compose.yml` — using `image:` (not `build:`), pointing to `gitlab.lan:5050/simtechdev/<project>:latest`, exposing the app port via `ports:`, using `env_file: - /opt/<project-name>/.env` (no `environment:` block)
- [ ] Do **not** manually create `.env` — it is written by the pipeline on every deploy

**In NPM:**
- [ ] Add a proxy host pointing to `dev-prod.lan:<app-port>` — **save without SSL first**
- [ ] Edit proxy host to attach Let's Encrypt cert + enable Force SSL
- [ ] Enable WebSocket support if the app uses WebSockets
- [ ] Enable Cache Assets if the app serves a frontend

**In Cloudflare Tunnel:**
- [ ] Add public hostname pointing to `192.168.100.15:80`

**In GitLab (`simtechdev` group):**
- [ ] Ensure project is under the `simtechdev` group (not personal namespace)
- [ ] Set project-level CI/CD variables: `PORT`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS`, plus any app-specific secrets (e.g. `TRIGGER_SECRET`) — these are written to `.env` by the deploy job
- [ ] Update the heredoc in `.gitlab-ci.yml` deploy stage to match the exact variables this project needs
- [ ] Confirm instance runner is available and enabled for the project

**In Uptime Kuma:**
- [ ] Add HTTP(s) monitor for the new public domain
- [ ] Add TCP monitor if the app exposes a non-HTTP port

**In the repo:**
- [ ] Add `Dockerfile` — adjust base image, port, and entry point for the stack
- [ ] Add `.gitlab-ci.yml` — adjust `image:` in test stage, `APP_DIR` if subdirectory
- [ ] Add/update `package.json` (or equivalent) with a test script that exits 0 if no tests yet

---

## Current Live Projects

| Project | Group | Repo | App Port | DB | Domain | Path on dev-prod |
|---|---|---|---|---|---|---|
| `gun_app_backend` | `simtechdev` | `simtechdev/gun_app_backend` | `5002` | MySQL (`dev-db.lan`) | — | `/opt/gun_app_backend/` |
| `Linen-Tracker` | `simtechdev` | `simtechdev/Linen-Tracker` | `8080` | MySQL (`dev-db.lan`) | `linen.simtechindo.com` | `/opt/Linen-Tracker/` |
| `WebSocketServer` | `simtechdev` | `simtechdev/WebSocketServer` | `8081` | MySQL (`dev-db.lan`) | `linen-ws.simtechindo.com` (WSS only) | `/opt/WebSocketServer/` |
| `uptime-kuma` | — | manual (no pipeline) | `3001` | — | `status.simtechindo.com` | `/opt/uptime-kuma/` |

---

## Still To Be Set Up (in progress)
- Email notification in Uptime Kuma (SMTP via Hostinger configured, deliverability being resolved)
- Merge request flow (branch protection, MR required to deploy)
