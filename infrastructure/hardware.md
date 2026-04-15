# Hardware & Storage

This document outlines the hardware configuration and storage logic within our Proxmox environment.

## Storage Logic

- **SSD (256GB):** Dedicated to the host OS and Container/VM Root Disks (`local` and `local-lvm`). This ensures high performance for core services.
- **HDD (1TB Toshiba):** Designated as "The Vault". This drive handles high-capacity data storage and routine backups.
