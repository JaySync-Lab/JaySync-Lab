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
| Home Assistant          | 192.168.1.11    | VM         | 103  | Smart Home OS (Port 8123)          |
| Media Stack             | 192.168.1.104   | LXC        | 104  | Docker-based streaming (GPU)       |
| Playground Controller   | 192.168.1.105   | LXC        | 105  | Playground session controller (dual-homed) |
| Tailscale (Proxmox)     | 100.87.172.121  | Overlay    | —    | Remote access mesh VPN             |

## Standard Update Procedures

- **Proxmox Host**: Uses `apt update && apt dist-upgrade`.
- **LXCs**: Uses standard Debian `apt`.
- **Docker-based LXCs (e.g., media-stack)**: Update containers via Docker Compose (`docker compose pull && docker compose up -d`), then update the host LXC with `apt`.
- **HAOS**: Uses the UI Supervisor.
