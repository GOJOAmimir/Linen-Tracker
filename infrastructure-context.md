# Infrastructure Context — Self-Hosted GitLab CI/CD on Proxmox

## Physical Host
- **Machine:** Ryzen 7 5800H, 40GB DDR4, ~463GB SSD
- **Hypervisor:** Proxmox VE
- **Network:** `192.168.50.0/24` subnet, Tailscale installed on Proxmox host with subnet routing — all LXC containers are reachable via Tailscale without installing Tailscale on each one

---

## LXC Containers

| VMID | Hostname | IP | RAM | Disk | Purpose |
|---|---|---|---|---|---|
| 200 | `gitlab` | `192.168.50.10` | 4GB | 40GB | GitLab CE + Container Registry |
| 201 | `gitlab-runner` | `192.168.50.20` | 2GB | 20GB | GitLab Runner (Docker executor) |
| 202 | `nginx-proxy-manager` | `192.168.50.51` | 1GB | 10GB | Nginx Proxy Manager + Cloudflare Tunnel |
| — | `dev-db` | `192.168.50.x` | 4GB | 60GB | MySQL 8, PostgreSQL 16, Redis (Docker) |
| — | `dev-prod` | `192.168.50.200` | 6GB | 40GB | Production deployment target (Docker) |

All LXC containers have nesting enabled. All containers run Ubuntu 24.04.

---

## GitLab
- **Web UI (external):** `https://gitlab.yourdomain.com` (via Cloudflare Tunnel)
- **Web UI (internal):** `http://192.168.50.10`
- **Container Registry:** `http://192.168.50.10:5050` (LAN / Tailscale only)
- **SSH remote:** `ssh://git@192.168.50.10` (LAN / Tailscale only)
- **Version:** GitLab CE, latest
- **Config file:** `/etc/gitlab/gitlab.rb` on the gitlab LXC
- **Registry is HTTP (not HTTPS)** — every Docker daemon that talks to it needs `insecure-registries` configured

---

## Nginx Proxy Manager (LXC 202)
- **IP:** `192.168.50.51`
- **Admin UI:** `http://192.168.50.51:81`
- **Docker Compose:** `/opt/nginx-proxy-manager/docker-compose.yml`
- Acts as the unified ingress layer for all services — both internal and external traffic routes through NPM
- Cloudflare Tunnel (`cloudflared`) is installed and running as a systemd service on this LXC
- New apps are exposed by adding a proxy host in NPM pointing to `192.168.50.200:<app-port>`

### Proxy Hosts configured in NPM

| Domain | Forward To | SSL |
|---|---|---|
| `gitlab.yourdomain.com` | `192.168.50.10:80` | Cloudflare cert, Force SSL, HTTP/2 on |

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
- **cloudflared installed on:** `192.168.50.51` (nginx-proxy-manager LXC)
- **Runs as:** systemd service (`cloudflared.service`)
- **Traffic flow:** `Internet → Cloudflare DNS → Cloudflare Tunnel → NPM (192.168.50.51:80) → backend service`

### Public Hostnames configured in Cloudflare

| Subdomain | Domain | Forwards to |
|---|---|---|
| `gitlab` | `yourdomain.com` | `192.168.50.51:80` |

### Service Access Summary

| Service | Access Method | URL |
|---|---|---|
| GitLab web UI | Cloudflare Tunnel | `https://gitlab.yourdomain.com` |
| Container Registry | LAN / Tailscale only | `http://192.168.50.10:5050` |
| GitLab SSH | LAN / Tailscale only | `ssh://git@192.168.50.10` |

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
  "insecure-registries": ["192.168.50.10:5050"]
}
```

---

## dev-prod Container
- **IP:** `192.168.50.200`
- **Docker installed**, SSH on port 22, `PermitRootLogin yes`, `PubkeyAuthentication yes`
- Each deployed app lives in `/opt/<project-name>/` with its own `docker-compose.yml` and `.env`
- Apps expose their port directly via `ports:` — NPM handles all routing and SSL termination
- No per-app Nginx — NPM is the single ingress layer for everything

`/etc/docker/daemon.json` on dev-prod:
```json
{
  "insecure-registries": ["192.168.50.10:5050"]
}
```

---

## dev-db Container
- MySQL 8 on port `3306`
- PostgreSQL 16 on port `5432`
- Redis Alpine on port `6379`
- Each service has its own `/opt/<service>/docker-compose.yml`
- Accessible from dev-prod via its internal IP

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
- dind started with `command: ["--insecure-registry=192.168.50.10:5050"]`
- Variables: `DOCKER_TLS_CERTDIR: ""`, `DOCKER_HOST: tcp://docker:2375`
- Logs into `$CI_REGISTRY` using built-in `$CI_REGISTRY_USER` / `$CI_REGISTRY_PASSWORD`
- Builds image, tags with `$CI_COMMIT_SHORT_SHA` and `latest`, pushes both
- Dockerfile lives inside the project subdirectory if monorepo, root if single app

**deploy stage:**
- Image: `alpine` with `openssh-client` installed
- SSHes into `dev-prod` (192.168.50.200) using `$DEPLOY_KEY`
- Runs `docker compose pull` + `docker compose up -d --remove-orphans` + `docker image prune -f`
- Only runs on `main`

---

## GitLab CI Variables (set per project)

| Variable | Type | Notes |
|---|---|---|
| `DEPLOY_KEY` | File | Ed25519 private key, newline at end |
| `DEPLOY_HOST` | Variable | `192.168.50.200` |
| `DEPLOY_USER` | Variable | `root` |
| `DB_NAME` | Variable | Masked |
| `DB_USER` | Variable | Masked |
| `DB_PASS` | Variable | Masked |

`$CI_REGISTRY`, `$CI_REGISTRY_USER`, `$CI_REGISTRY_PASSWORD`, `$CI_REGISTRY_IMAGE`, `$CI_COMMIT_SHORT_SHA` are all **built-in GitLab variables** — never set manually.

---

## Per-Project Checklist for a New Project

**On dev-prod:**
- [ ] Create `/opt/<project-name>/`
- [ ] Create `/opt/<project-name>/docker-compose.yml` — using `image:` (not `build:`), pointing to `192.168.50.10:5050/<namespace>/<project>:latest`, exposing the app port via `ports:`
- [ ] Create `/opt/<project-name>/.env` with app-specific secrets

**In NPM:**
- [ ] Add a proxy host pointing to `192.168.50.200:<app-port>`
- [ ] Attach domain/subdomain and SSL cert via Cloudflare

**In GitLab project settings:**
- [ ] Set CI/CD variables: `DEPLOY_KEY`, `DEPLOY_HOST`, `DEPLOY_USER`, plus any app-specific secrets
- [ ] Confirm instance runner is available and enabled for the project

**In the repo:**
- [ ] Add `Dockerfile` — adjust base image, port, and entry point for the stack
- [ ] Add `.gitlab-ci.yml` — adjust `image:` in test stage, `APP_DIR` variable if subdirectory, port references
- [ ] Add/update `package.json` (or equivalent) with a test script that exits 0 if no tests yet

**Stack-specific changes to `.gitlab-ci.yml`:**
- Node.js: `image: node:20-alpine`, `npm ci`, `npm test`
- Laravel/PHP: `image: php:8.2`, composer install, `php artisan test`
- Python: `image: python:3.12`, `pip install`, `pytest`
- Go: `image: golang:1.22`, `go test ./...`

---

## Current Live Projects

| Project | Repo | App Port | DB | Path on dev-prod |
|---|---|---|---|---|
| `gun_app_backend` | `mbudit/gun_app_backend` | `5002` | MySQL | `/opt/gun_app_backend/` |

---

## Still To Be Set Up (in progress)
- Monitoring (uptime + crash alerting)
- Secrets management (replacing plaintext `.env`)
- Merge request flow (branch protection, MR required to deploy)
