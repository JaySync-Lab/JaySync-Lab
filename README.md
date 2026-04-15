# JaySync-Lab

> [!NOTE]
> High-performance home server built on Proxmox, emphasizing security (SOPS), monitoring, and smart home integration.

## Architecture

```mermaid
flowchart LR
    A[ZTE Router] --> B[Proxmox VE]
    B --> C[Pi-hole <br> DNS]
    C --> D[Uptime Kuma <br> Monitoring]
```

## Tech Stack

- **Hardware:** Intel i5-6500
- **Hypervisor:** Proxmox VE
- **Containers:** Debian LXCs
- **Virtual Machines:** Home Assistant OS (HAOS VM)
- **Networking/VPN:** Tailscale
