# 🖥️ System Architecture & Hardware Configuration

> [!IMPORTANT]  
> **Engineering Objective:** Establish a stable, hypervisor-driven home lab using repurposed enterprise hardware. The host must support hardware virtualization, efficient containerization, and separate fast/slow storage tiers.

## Hardware Specifications

| Component | Specification | Notes |
| :--- | :--- | :--- |
| **CPU** | Intel Core i5-6500 (4 Cores, 3.20GHz) | Handles Proxmox, VMs, LXCs. |
| **RAM** | 8GB DDR4 | Allocated across LXCs and VMs. |
| **Storage 1** | 256GB SSD | "The Fast Tier." Hosts Proxmox OS, LXC roots, VM boot drives. |
| **Storage 2** | 1TB Toshiba HDD | "The Vault." High-capacity storage for backups and dev databases. |

## Pre-Installation (BIOS Configuration)

- **Intel Virtualization Technology (VT-x)**: ENABLED (Crucial for KVM support).
- **Intel VT-d (Directed I/O)**: ENABLED (Allows PCI/USB passthrough).
- **Boot Mode**: UEFI.
- **ACPI Power Loss State**: Power On.

## Storage Architecture (Proxmox Tiering)

- **SSD (256GB)**: Split into `local` (ext4) for ISOs/templates and `local-lvm` (LVM-Thin) for running Virtual Disks. Thin provisioning prevents bottlenecks.
- **HDD (1TB)**: Mounted as vault (Directory). Note that no OS files reside here; it is purely for Proxmox snapshots and data.
