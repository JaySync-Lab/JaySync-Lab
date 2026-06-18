# 🖥️ System Architecture & Hardware Configuration

> [!IMPORTANT]  
> **Engineering Objective:** Establish a stable, hypervisor-driven home lab using repurposed enterprise hardware. The host must support hardware virtualization, efficient containerization, and separate fast/slow storage tiers.

## Hardware Specifications

| Component | Specification | Notes |
| :--- | :--- | :--- |
| **Model** | HP ProDesk 400 G3 MT | Repurposed enterprise desktop (Serial: SGH552TW46). |
| **CPU** | Intel Core i5-6500 (4 Cores, 3.20GHz) | Skylake. VT-x & VT-d enabled. Turbo to 3.60GHz. |
| **RAM** | 16GB DDR4 | Upgraded from original 8GB. Allocated across LXCs and VMs. |
| **GPU** | Intel HD Graphics 530 (i915) | Onboard IGD. Available for passthrough to containers via `/dev/dri`. |
| **NIC** | Realtek RTL8111/8168 Gigabit (r8169) | Single GbE port bridged to `vmbr0`. |
| **Storage 1** | 512GB SSD | "The Fast Tier." Hosts Proxmox OS, LXC roots, VM boot drives. |
| **Storage 2** | 1TB Toshiba HDD | "The Vault." High-capacity storage for backups, media, and data. |

## Pre-Installation (BIOS Configuration)

- **Intel Virtualization Technology (VT-x)**: ENABLED (Crucial for KVM support).
- **Intel VT-d (Directed I/O)**: ENABLED (Allows PCI/USB passthrough).
- **Boot Mode**: UEFI.
- **ACPI Power Loss State**: Power On.

## Hypervisor Software

| Component | Version |
| :--- | :--- |
| **Proxmox VE** | 9.2.3 |
| **Kernel** | 7.0.6-2-pve |
| **Base OS** | Debian GNU/Linux 13 (trixie) |
| **QEMU** | 11.0.0 |
| **LXC** | 7.0.0 |
| **Hostname** | `jaysync-lab` |

## Storage Architecture (Proxmox Tiering)

| Pool | Type | Capacity | Content | Mount Point |
| :--- | :--- | :--- | :--- | :--- |
| `local` | Directory (ext4) | ~94GB | ISOs, backups, container templates | `/var/lib/vz` |
| `local-lvm` | LVM-Thin | ~320GB | VM/CT disk images (thin provisioned) | *(managed by PVE)* |
| `vault` | Directory (ext4) | ~916GB | Images, rootdirs, backups, ISOs, snippets, templates | `/mnt/pve/vault` |

- **SSD (512GB)**: Split into `local` (ext4) for ISOs/templates and `local-lvm` (LVM-Thin) for running Virtual Disks. Thin provisioning prevents bottlenecks.
- **HDD (1TB)**: Mounted as `vault` (Directory) at `/mnt/pve/vault`. Configured as a universal store accepting all content types. Used for media data, Proxmox snapshots, and container bind-mounts.
