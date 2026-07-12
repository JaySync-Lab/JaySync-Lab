# Graph Report - .  (2026-07-11)

## Corpus Check
- Corpus is ~9,577 words - fits in a single context window. You may not need a graph.

## Summary
- 94 nodes · 154 edges · 13 communities (12 shown, 1 thin omitted)
- Extraction: 82% EXTRACTED · 18% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.91)
- Token cost: 143,178 input · 25,266 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Docs Pipeline & Repo Governance|Docs Pipeline & Repo Governance]]
- [[_COMMUNITY_Service Inventory (Hosts & VMIDs)|Service Inventory (Hosts & VMIDs)]]
- [[_COMMUNITY_Playground Controller & Template Lifecycle|Playground Controller & Template Lifecycle]]
- [[_COMMUNITY_Media Stack & GPU Passthrough|Media Stack & GPU Passthrough]]
- [[_COMMUNITY_Round-2 Playground Fixes (Mobile, Feedback, Email)|Round-2 Playground Fixes (Mobile, Feedback, Email)]]
- [[_COMMUNITY_Core Network Services (Pi-hole, Uptime Kuma, Proxmox)|Core Network Services (Pi-hole, Uptime Kuma, Proxmox)]]
- [[_COMMUNITY_Docs Validation Script|Docs Validation Script]]
- [[_COMMUNITY_Proxmox Host Networking (Tailscale, vmbr0)|Proxmox Host Networking (Tailscale, vmbr0)]]
- [[_COMMUNITY_CT 105 Access Control History|CT 105 Access Control History]]
- [[_COMMUNITY_Secrets Management (SOPS + Age)|Secrets Management (SOPS + Age)]]
- [[_COMMUNITY_Hardware & Storage Architecture|Hardware & Storage Architecture]]
- [[_COMMUNITY_MagicDNS  Pi-hole DNS Fix|MagicDNS / Pi-hole DNS Fix]]
- [[_COMMUNITY_Verification Discipline & Mobile Fix|Verification Discipline & Mobile Fix]]

## God Nodes (most connected - your core abstractions)
1. `Changelog` - 16 edges
2. `inventory.yaml Root Document` - 15 edges
3. `Proxmox Host Node Identity & Config` - 12 edges
4. `Playground Controller (LXC 105)` - 9 edges
5. `validate-and-dispatch.yml Workflow` - 8 edges
6. `IP Allocation Map` - 8 edges
7. `Playground Controller (CT105)` - 8 edges
8. `Directory Legend` - 7 edges
9. `Sandbox Template Playground (CT180)` - 7 edges
10. `VMID Bands Schema` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Claude Code Local Settings Permissions` --conceptually_related_to--> `graphify Knowledge Graph Reference`  [INFERRED]
  .claude/settings.local.json → CLAUDE.md
- `validate-docs.mjs Script` --implements--> `Frontmatter Reference (RULEBOOK §5)`  [EXTRACTED]
  scripts/validate-docs.mjs → RULEBOOK.md
- `validate-docs.mjs Script` --implements--> `meta.json Reference (RULEBOOK §6)`  [EXTRACTED]
  scripts/validate-docs.mjs → RULEBOOK.md
- `Least-Privilege Credentials Convention` --semantically_similar_to--> `PlaygroundCtrlRole Privilege-Separated Access`  [INFERRED] [semantically similar]
  CLAUDE.md → CHANGELOG.md
- `2026-07-03 Changelog Entry (Docs Restructure & Secrets Move)` --references--> `validate-docs.mjs Script`  [EXTRACTED]
  CHANGELOG.md → scripts/validate-docs.mjs

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Docs Publishing Pipeline (validate, dispatch, sync)** — claude_pipeline_concept, workflows_validate_and_dispatch_workflow, scripts_validate_docs_script, infrastructure_inventory_root [EXTRACTED 0.90]
- **Secrets Isolation Pattern (SOPS boundary)** — sops_creation_rule, changelog_2026_07_03_entry, rulebook_secrets_isolation_rule, maintenance_secrets_directory_legend [INFERRED 0.80]
- **CT105 Identity Evolution (docs-engine to playground-controller)** — inventory_playground_controller, changelog_2026_07_07_entry, changelog_2026_07_11_entry, changelog_production_documentation_engine [EXTRACTED 0.90]
- **Fix-by-Real-World-Observation Pattern** — changelog_mobile_ctrl_toolbar_bug, changelog_terminal_scroll_history_bug, changelog_scrollbar_leak_bug, changelog_playground_controller_testing [INFERRED 0.85]
- **Core Lab Services on vmbr0 (Architecture Diagram)** — services_pi_hole_pi_hole, services_uptime_kuma_uptime_kuma, services_home_assistant_home_assistant, services_media_stack_media_stack, services_playground_controller_playground_controller [EXTRACTED 1.00]
- **Fast/Slow Storage Tiering Pattern (local/local-lvm/vault)** — infrastructure_hardware_storage_tiering, infrastructure_proxmox_host_node_identity, services_media_stack_storage_architecture [INFERRED 0.85]

## Communities (13 total, 1 thin omitted)

### Community 0 - "Docs Pipeline & Repo Governance"
Cohesion: 0.18
Nodes (18): 2026-04-16 Changelog Entry (SOPS + Uptime Kuma Docs), 2026-07-03 Changelog Entry (Docs Restructure & Secrets Move), Key Files List, graphify Knowledge Graph Reference, Docs-to-Site Publishing Pipeline, Claude Code Local Settings Permissions, Directory Legend, /secrets/ Directory Legend Entry (+10 more)

### Community 1 - "Service Inventory (Hosts & VMIDs)"
Cohesion: 0.30
Nodes (16): 2026-07-11 Changelog Entry (Inventory Sync Automation), inventory.yaml Root Document, Home Assistant (VM103), Media Stack (CT104), Pi-hole (CT100), Playground Controller (CT105), Proxmox Host, Sandbox Template Playground (CT180) (+8 more)

### Community 2 - "Playground Controller & Template Lifecycle"
Cohesion: 0.17
Nodes (13): CT 180 Template Classification Fix, Playground Host Resource Monitor (CPU/Memory), infrastructure/inventory.yaml (Single Source of Truth), JaySync-Lab GitHub Organization, jaysync-lab-playground Repository, Playground Controller Six-Scenario Test Pass, Mouse-Wheel Terminal Scroll/History Bug, Playground Controller Deployment Strategy (+5 more)

### Community 3 - "Media Stack & GPU Passthrough"
Cohesion: 0.33
Nodes (7): Intel iGPU Passthrough (for Media Stack), EZVIZ RTSP Integration Logic, Home Assistant (VM 103), VM over Docker Decision, Media Stack Deployment Strategy, GPU Passthrough (Hardware Transcoding), Media Stack (LXC 104)

### Community 4 - "Round-2 Playground Fixes (Mobile, Feedback, Email)"
Cohesion: 0.33
Nodes (6): Changelog, Mobile Ctrl Toolbar iPhone Bug, Playground Feedback Form, Proxmox Host Unplanned Outage (2026-07-06), Resend Email Integration, Animated Decorative Element Scrollbar Leak Bug

### Community 5 - "Core Network Services (Pi-hole, Uptime Kuma, Proxmox)"
Cohesion: 0.40
Nodes (6): Lab Architecture Diagram, Proxmox VE Hypervisor Software, Pi-hole Deployment Strategy, Pi-hole (LXC 100), Uptime Kuma Alerting Strategy & UI Customization, Uptime Kuma (LXC 101)

### Community 6 - "Docs Validation Script"
Cohesion: 0.40
Nodes (5): errors, REQUIRED_FIELDS, VALID_STATUS, validateMdx(), walk()

### Community 7 - "Proxmox Host Networking (Tailscale, vmbr0)"
Cohesion: 0.50
Nodes (5): Proxmox Host Node Identity & Config, Subscription Nag Removal, Tailscale Bare-Metal Placement, vmbr0 Linux Bridge, Tailscale Routing (Architectural Placement)

### Community 8 - "CT 105 Access Control History"
Cohesion: 0.50
Nodes (4): 2026-07-07 Changelog Entry (Playground Phase 3 / CT105 Controller), PlaygroundCtrlRole Privilege-Separated Access, production-documentation-engine (deprecated CT105 role), Least-Privilege Credentials Convention

### Community 9 - "Secrets Management (SOPS + Age)"
Cohesion: 0.50
Nodes (4): Documentation Publishing Pipeline (2026-07-03), Secret Management (SOPS + Age), /secrets Folder Separation, SOPS + Age Encryption Mechanism

### Community 10 - "Hardware & Storage Architecture"
Cohesion: 0.50
Nodes (4): JaySync-Lab (Homelab Overview), Hardware (HP ProDesk 400 G3 MT), Storage Architecture (Proxmox Tiering), Media Stack Storage Architecture

### Community 11 - "MagicDNS / Pi-hole DNS Fix"
Cohesion: 0.67
Nodes (3): Permanent DNS Fix (--accept-dns=false), The MagicDNS Conflict, Pi-hole Network Role & Traffic Flow

## Knowledge Gaps
- **15 isolated node(s):** `REQUIRED_FIELDS`, `VALID_STATUS`, `errors`, `Claude Code Local Settings Permissions`, `2026-07-10 Changelog Entry (Mobile Toolbar Fix)` (+10 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Changelog` connect `Round-2 Playground Fixes (Mobile, Feedback, Email)` to `Playground Controller & Template Lifecycle`, `Core Network Services (Pi-hole, Uptime Kuma, Proxmox)`, `Proxmox Host Networking (Tailscale, vmbr0)`, `Secrets Management (SOPS + Age)`, `Hardware & Storage Architecture`?**
  _High betweenness centrality (0.128) - this node is a cross-community bridge._
- **Why does `Proxmox Host Node Identity & Config` connect `Proxmox Host Networking (Tailscale, vmbr0)` to `Playground Controller & Template Lifecycle`, `Media Stack & GPU Passthrough`, `Round-2 Playground Fixes (Mobile, Feedback, Email)`, `Core Network Services (Pi-hole, Uptime Kuma, Proxmox)`, `Hardware & Storage Architecture`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **Why does `inventory.yaml Root Document` connect `Service Inventory (Hosts & VMIDs)` to `Docs Pipeline & Repo Governance`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **What connects `REQUIRED_FIELDS`, `VALID_STATUS`, `errors` to the rest of the system?**
  _24 weakly-connected nodes found - possible documentation gaps or missing edges._