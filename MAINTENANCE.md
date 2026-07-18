# 📖 The JaySync-Lab Rulebook (Repository Legend)

## The 6-Month Rule

> [!NOTE]  
> This repository is designed to be self-explanatory. If the author returns after 6 months of inactivity, this document serves as the absolute source of truth for where things belong, how to update them, and the rules of the environment.

## Directory Legend

- `/docs/` -> All documentation content as MDX (includes `infrastructure/`,
  `networking/`, `security/`, and `services/` subfolders), sourced by the
  docs site and validated by CI before it can publish.
- `/infrastructure/` -> Machine-readable inventory only (`inventory.yaml`)
  — not prose documentation; the equivalent hardware/host writeups now
  live under `/docs/infrastructure/`.
- `/templates/` -> UI & Styling (CSS, HTML emails).
- `/secrets/` -> SOPS+age encrypted credentials. Never fetched by the docs
  site's build.
- `/scripts/` -> Repo tooling (`validate-docs.mjs` and anything else that
  supports the docs pipeline).
- `/.github/` -> CI workflows (`validate-and-dispatch.yml`).
- `CHANGELOG.md` -> Technical changelog.
- `MAINTENANCE.md` -> This file.
- `RULEBOOK.md` -> Docs-authoring howto.

## IP Allocation Map

| Device/Service          | IP Address      | Type       | VMID | Notes                              |
|-------------------------|-----------------|------------|------|------------------------------------|
| ZTE Router              | 192.168.1.1     | Hardware   | —    | Gateway / DHCP Server              |
| Proxmox Host            | 192.168.1.100   | Bare Metal | —    | Management UI (Port 8006)          |
| Pi-hole (DNS)           | 192.168.1.101   | LXC        | 100  | Primary DNS                        |
| Uptime Kuma             | 192.168.1.102   | LXC        | 101  | The "Watchman" (Port 3001)         |
| Nginx Proxy Manager     | 192.168.1.106   | LXC        | 102  | Reverse proxy, wildcard TLS (Port 81 admin) |
| Home Assistant          | 192.168.1.12    | VM         | 103  | Smart Home OS (Port 8123)          |
| Media Stack             | 192.168.1.104   | LXC        | 104  | Docker-based streaming (GPU)       |
| Playground Controller   | 192.168.1.105   | LXC        | 105  | Playground session controller (dual-homed) |
| Monitoring Stack        | 192.168.1.120   | LXC        | 120  | Prometheus + Grafana + pve-exporter (Port 3000) |
| Homepage Dashboard      | 192.168.1.121   | LXC        | 121  | gethomepage.dev dashboard (Port 3000) |
| Tailscale (Proxmox)     | 100.87.172.121  | Overlay    | —    | Remote access mesh VPN             |

## Standard Update Procedures

- **Proxmox Host**: Uses `apt update && apt dist-upgrade`.
- **LXCs**: Uses standard Debian `apt`.
- **Docker-based LXCs (e.g., media-stack)**: Update containers via Docker Compose (`docker compose pull && docker compose up -d`), then update the host LXC with `apt`.
- **HAOS**: Uses the UI Supervisor.

## AI-Assisted Infrastructure Access

Since 2026-07-15, infrastructure changes made with an AI assistant (e.g.
Claude Code) go through a dedicated, non-root `claude-agent` account
rather than the root SSH key, following the same least-privilege
philosophy as every other credential in this ecosystem:

- **`claude-agent` (SSH, Proxmox host)**: unprivileged Linux user with
  its own SSH keypair. Sudo access is intentionally narrow and grows
  only by explicit, one-at-a-time sign-off as real tasks need it — see
  `/etc/sudoers.d/claude-agent` on the host for the current live scope
  (as of 2026-07-16: `tailscale`, `sysctl`, appending to
  `/etc/sysctl.conf`, `pct`, `pveam`, and read-only `qm status`/`qm
  config`/`qm agent ... network-get-interfaces`). Notably **not**
  granted: `pveum` (Proxmox user/role/permission management) or
  anything that starts/stops/destroys a VM — those either go through a
  one-off root-key bootstrap action (e.g. creating a new scoped
  Proxmox API user) or are left to the human.
- **`claude-agent@jaysynclab.com` (NPM admin)**: a second, separate
  dedicated account inside Nginx Proxy Manager itself (VMID 102), used
  to keep proxy hosts up to date as new services come online without
  needing the human's own NPM login. NPM has no scoped/read-only role
  (admin or nothing), so this is full admin *within NPM only* — no
  reach into Proxmox, SSH, or anything else.
- **`pve-exporter@pve` (Proxmox API token)**: read-only (`Sys.Audit`,
  `Datastore.Audit`, `VM.Audit`), used only by the monitoring stack's
  Prometheus exporter (VMID 120) to scrape metrics.

If you're auditing access months later: any of the above accounts can
be deleted/revoked independently without affecting the others or
requiring a root-key rotation.
