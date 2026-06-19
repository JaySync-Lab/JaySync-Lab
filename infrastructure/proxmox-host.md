# 🏗️ Proxmox Host: Node Configuration

> [!NOTE]
> This document covers the Proxmox VE node-level configuration: network bridge, storage pool definitions, post-install tweaks, and update channels. For physical hardware specs, see [`hardware.md`](hardware.md).

## Node Identity

| Property | Value |
| :--- | :--- |
| **Hostname** | `jaysync-lab` |
| **Management IP** | `192.168.1.100` |
| **Web UI** | `https://192.168.1.100:8006` |
| **Remote Access** | Tailscale (`100.87.172.121`) |

## Proxmox Software Versions

| Component | Version |
| :--- | :--- |
| **Proxmox VE** | 9.2.3 |
| **Kernel** | 7.0.6-2-pve |
| **Base OS** | Debian GNU/Linux 13 (trixie) |
| **QEMU** | 11.0.0 |
| **LXC** | 7.0.0 |

## Network Configuration

### Linux Bridge: `vmbr0`

All LXC containers and VMs use the `vmbr0` virtual bridge, which is bound to the host's physical Realtek GbE NIC (`r8169` driver).

```
auto vmbr0
iface vmbr0 inet static
    address  192.168.1.100/24
    gateway  192.168.1.1
    bridge-ports <physical-nic>
    bridge-stp   off
    bridge-fd    0
```

> [!TIP]
> To inspect the live network config on the node: `cat /etc/network/interfaces`

**Bridge design rationale:**
- Single-bridge flat LAN keeps routing simple for a home environment.
- All containers receive IPs in `192.168.1.0/24` directly visible to the home router.
- No internal VLAN segmentation (intentional — complexity not warranted at current scale).

## Storage Pool Definitions

Three storage pools are configured in Proxmox. Pool selection for new workloads follows the tier-matching principle: fast storage for I/O-sensitive workloads, vault for bulk data.

| Pool | Backend | Device | Capacity | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `local` | Directory (ext4) | SSD | ~94GB | ISOs, CT templates, Proxmox backups |
| `local-lvm` | LVM-Thin | SSD | ~320GB | VM/CT disk images (thin-provisioned) |
| `vault` | Directory (ext4) | HDD | ~916GB | Media data, snapshots, bulk backups |

**Mount point:** `vault` is mounted at `/mnt/pve/vault`.

> [!TIP]
> To check live pool status and usage: `pvesm status`

## Post-Installation Configuration

### 1. Subscription Nag Removal

The Proxmox community `no-subscription` repository was added to remove the enterprise-repo nag:

```bash
# /etc/apt/sources.list.d/pve-no-subscription.list
deb http://download.proxmox.com/debian/pve trixie pve-no-subscription
```

### 2. Tailscale (Bare-Metal VPN)

Tailscale is installed directly on the Proxmox host — **not** inside an LXC — so the management interface (`8006`) remains reachable remotely even if internal containers fail.

See [`/networking/tailscale-routing.md`](../networking/tailscale-routing.md) for the MagicDNS conflict fix and full rationale.

### 3. Intel iGPU Passthrough (for Media Stack)

The Intel HD Graphics 530 (`i915`) is passed through to CT 104 (media-stack) for hardware-accelerated video transcoding. The Proxmox host exposes `/dev/dri` which is bind-mounted into the container.

```bash
# Verify DRM render node is available on the host
ls -la /dev/dri/
```

## Update Procedure

```bash
apt update && apt dist-upgrade
```

Proxmox VE updates come via the `pve-no-subscription` repository. Always review release notes before applying a major version bump.
