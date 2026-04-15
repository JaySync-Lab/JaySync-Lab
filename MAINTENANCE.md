# Maintenance & Operations

## The "6-Month Rule"

> [!IMPORTANT]  
> **6-Month Rule:** Wait at least 6 months before performing major version upgrades on core infrastructure (e.g., Proxmox VE). This delay ensures community validation and reduces the risk of zero-day bugs affecting lab stability.

## IP Assignment Table

| Service / Node | IP Address | Notes |
| :--- | :--- | :--- |
| **Proxmox Host** | `.100` | Physical Server |
| **Pi-hole** | `.101` | LXC |
| **Uptime Kuma** | `.102` | LXC |
| **Home Assistant** | `.11` | VM |

## Update Procedure

Updating the infrastructure follows different guidelines depending on whether it's the host or a container:

### Proxmox Host

Perform updates using standard package management tools:
```bash
apt update && apt full-upgrade -y
```

### LXC Containers

For LXC containers (e.g., Pi-hole, Uptime Kuma), use the appropriate **community script updates** rather than native `apt` upgrades. This ensures complex service configurations and dependencies remain intact.
