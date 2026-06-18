# JaySync-Lab

> [!NOTE]
> High-performance home server built on Proxmox, emphasizing security (SOPS), monitoring, and smart home integration.

## Architecture

```mermaid
flowchart LR
    A[ZTE Router] --> B["Proxmox VE 9.2 <br> jaysync-lab"]
    B --> C["Pi-hole <br> DNS (CT 100)"]
    B --> D["Uptime Kuma <br> Monitoring (CT 101)"]
    B --> E["Home Assistant <br> Smart Home (VM 103)"]
    B --> F["Media Stack <br> Streaming (CT 104)"]
    B --> G["Docs Engine <br> Documentation (CT 105)"]
```

## Tech Stack

- **Hardware:** HP ProDesk 400 G3 MT — Intel i5-6500, 16GB DDR4
- **Hypervisor:** Proxmox VE 9.2.3 (Kernel 7.0.6-2-pve)
- **Base OS:** Debian GNU/Linux 13 (trixie)
- **Containers:** Debian LXCs (Unprivileged)
- **Virtual Machines:** Home Assistant OS (HAOS VM)
- **Networking/VPN:** Tailscale (bare-metal)
