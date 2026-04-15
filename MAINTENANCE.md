# 📖 The JaySync-Lab Rulebook (Repository Legend)

## The 6-Month Rule

> [!NOTE]  
> This repository is designed to be self-explanatory. If the author returns after 6 months of inactivity, this document serves as the absolute source of truth for where things belong, how to update them, and the rules of the environment.

## Directory Legend

- `/infrastructure/` -> Physical & Host OS (Hardware specs, Proxmox host configs, storage).
- `/networking/` -> Traffic & DNS (Pi-hole, Tailscale, IP reservations).
- `/services/` -> The Workloads (LXC/VM folders like uptime-kuma/).
- `/templates/` -> UI & Styling (CSS, HTML emails).
- `/security/` -> SOPS/Age encryption rules and public keys.

## IP Allocation Map

| Device/Service   | IP Address    | Type       | Notes                       |
|------------------|---------------|------------|-----------------------------|
| ZTE Router       | 192.168.1.1   | Hardware   | Gateway / DHCP Server       |
| Proxmox Host     | 192.168.1.100 | Bare Metal | Management UI (Port 8006)   |
| Pi-hole (DNS)    | 192.168.1.101 | LXC (101)  | Primary DNS                 |
| Uptime Kuma      | 192.168.1.102 | LXC (102)  | The "Watchman" (Port 3001)  |
| Home Assistant   | 192.168.1.11  | VM (103)   | Smart Home OS (Port 8123)   |

## Standard Update Procedures

- **Proxmox Host**: Uses `apt update && apt dist-upgrade`.
- **LXCs**: Uses standard Debian `apt`.
- **HAOS**: Uses the UI Supervisor.
