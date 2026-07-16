# Changelog

All notable changes to the JaySync-Lab configuration and documentation are recorded here. Dates reflect when changes were committed to the repository.

## 2026-07-16

- **Built and deployed the reverse proxy** (Nginx Proxy Manager, VMID 102, `192.168.1.106`) — Docker Compose LXC, wildcard `*.lab.jaysynclab.com` cert issued via Let's Encrypt DNS-01 through Cloudflare, Pi-hole wildcard DNS pointing all subdomains at it. Full design/architecture on [`docs/networking/reverse-proxy.mdx`](docs/networking/reverse-proxy.mdx), now flipped from `draft` to `published`
  - Gotcha: NPM's default admin email (`admin@example.com`) makes every Let's Encrypt request fail with a generic "Internal Error" that looks like a Cloudflare/network problem but isn't — the email has to be changed to a real address first
  - Gotcha: Pi-hole v6/FTL no longer reads `/etc/dnsmasq.d/*.conf` for wildcard DNS — the correct place is `misc.dnsmasq_lines` in `/etc/pihole/pihole.toml`
  - Live proxy hosts: `pihole`, `kuma`, `proxmox` (needed `Scheme: https`, not `http`, to avoid a redirect loop against Proxmox's TLS-only port 8006), `ha` (needed `http.trusted_proxies`/`use_x_forwarded_for` added to Home Assistant's `configuration.yaml` — HA rejects unrecognized reverse proxies with 400 otherwise), `grafana`. `media-stack` deliberately excluded, not an oversight
- **Built the monitoring stack** (Prometheus + Grafana + pve-exporter, VMID 120, `192.168.1.120`) — complements Uptime Kuma rather than replacing it; imported the community "Proxmox via Prometheus" dashboard, confirmed live per-guest CPU/status data. Full writeup on [`docs/services/monitoring-stack.mdx`](docs/services/monitoring-stack.mdx)
  - New dedicated read-only Proxmox API user (`pve-exporter@pve`, custom `ExporterAuditRole`: `Sys.Audit`/`Datastore.Audit`/`VM.Audit` only) — token secret was piped directly into the exporter's config file on the host and never printed to any log or transcript
  - Gotcha: Proxmox reserves the `PVE`-prefixed role-ID namespace; a role named `PVEExporterRole` fails, had to rename to `ExporterAuditRole`
  - Gotcha: a config file written from the host via `pct exec` inherited a `600` root-only umask, unreadable by the container's non-root Docker process — silent crashloop until `chmod 644`
- **Found and fixed a real, pre-existing data drift**: Home Assistant (VMID 103)'s documented IP, `192.168.1.11` in `infrastructure/inventory.yaml`/`MAINTENANCE.md`, was stale — the VM's actual IP is `192.168.1.12` (confirmed unreachable at `.11` from a peer container, then confirmed live at `.12` via the Proxmox console). Fixed in both files
- **Introduced `claude-agent`**, a dedicated non-root account for AI-assisted infrastructure changes, replacing ad-hoc use of the root SSH key — see the new [AI-Assisted Infrastructure Access](MAINTENANCE.md#ai-assisted-infrastructure-access) section in `MAINTENANCE.md` for the full credential picture (SSH account + narrowly-scoped sudoers grown one explicit approval at a time, a separate dedicated NPM admin account, and the `pve-exporter@pve` API token)
- Tailscale: added Pi-hole as a **split-DNS** nameserver (admin console DNS tab, restricted to `lab.jaysynclab.com`) so friendly URLs resolve identically on-VLAN and remote, without overriding all other DNS on remote devices. Verified end-to-end from a real off-VLAN phone
- **Known open item, tracked in [JaySync-Lab#10](https://github.com/JaySync-Lab/JaySync-Lab/issues/10)**: Home Assistant is unreachable off-VLAN over Tailscale even by direct IP, unlike every other host on the subnet — likely related to its per-VM Proxmox firewall flag, not yet root-caused, parked until on-site
- Evaluated Homepage vs. Dashy for a lab dashboard; decided on Homepage for its live-data service integrations (Pi-hole/Kuma/Proxmox/the *arr apps) over Dashy's stronger visual customization, since it complements the monitoring stack just built rather than duplicating it. Not yet built — see [JaySync-Lab#11](https://github.com/JaySync-Lab/JaySync-Lab/issues/11)
- **Migrated the ecosystem's public-facing domains** from `anujajay.com` to `jaysynclab.com` (purchased/moved to Cloudflare 2026-07-15 — see below), completing [JaySync-Lab#9](https://github.com/JaySync-Lab/JaySync-Lab/issues/9)/[jaysync-lab-site#13](https://github.com/JaySync-Lab/jaysync-lab-site/issues/13):
  - `lab.anujajay.com` → **`jaysynclab.com`** (docs site, this ecosystem's hub)
  - `jslnode.anujajay.com` → **`jslnode.jaysynclab.com`** (playground frontend, Vercel)
  - `api-jslnode.anujajay.com` → **`api-jslnode.jaysynclab.com`** (playground's Cloudflare Tunnel straight to CT 105 — not Vercel-hosted; added as a second `cloudflared` ingress hostname alongside the old one, tunnel restarted with ~2s of interruption, both hostnames verified live afterward)
  - Both old domains **redirect** (308, via Vercel) to their new equivalents rather than being removed outright, so existing bookmarks/links keep working
  - Found and cleaned up two stray `A` records at the `jaysynclab.com` apex — Cloudflare's auto-imported default parking-page placeholders from the moment DNS moved over, confirmed via matching creation timestamps and by querying the IPs directly (`<title>Parking Page</title>`) before removing them
  - Repo-wide convention change alongside this: this repo no longer gets a "direct commits to main for docs" exception — branch-per-task with frequent commits, same as the other repos, going forward

## 2026-07-15

- Purchased `jaysynclab.com` and moved its DNS management to Cloudflare, to give the homelab ecosystem its own domain separate from other personal projects on `anujajay.com`. Migrating the public docs site to it is tracked as a backlogged follow-up, not started yet — see [jaysync-lab-site#13](https://github.com/JaySync-Lab/jaysync-lab-site/issues/13) and [JaySync-Lab#9](https://github.com/JaySync-Lab/JaySync-Lab/issues/9)
- Researched Uptime Kuma vs. Grafana for monitoring: decided they're complementary, not competing — Uptime Kuma stays for up/down synthetic checks + alerting, and a Prometheus + Grafana stack will be added alongside it for resource/trend visibility (CPU/RAM/disk per LXC). Not yet built
- **Fixed remote access over Tailscale** — the tailnet previously could only reach the Proxmox host itself, not the rest of `192.168.1.0/24` (Pi-hole, Uptime Kuma, Home Assistant, the router), because the host was never approved as a full subnet router. Enabled IP forwarding, re-advertised `192.168.1.0/24`, and approved the route in the admin console; verified end-to-end from a real phone on mobile data (off the home VLAN entirely) — Proxmox GUI, Pi-hole, and the router's admin page all reachable by their normal IPs. Full writeup, including deviations from plan, on [`tailscale-routing.mdx`](docs/networking/tailscale-routing.mdx)
  - Created a dedicated non-root `claude-agent` SSH account on the Proxmox host to perform this (and future) infra changes, instead of using the existing root-capable key directly — sudo scoped narrowly to `tailscale`, `sysctl`, and appending to `/etc/sysctl.conf` (`/etc/sudoers.d/claude-agent`)
  - Problem hit: `sudo` wasn't installed on the host at all (it had only ever been managed as `root` directly) — installed it before the scoped account could do anything
  - Problem hit: `/etc/sysctl.conf` didn't exist yet on this host — creating it via `tee -a` was fine, but the original plan had assumed it already existed
  - Problem hit: the sudoers rule initially pointed at `/usr/sbin/tailscale`, guessed by convention — the real binary is at `/usr/bin/tailscale` (and `sysctl` really is at `/usr/sbin/sysctl`), had to confirm actual paths on the host rather than assume them, since sudoers matches the exact resolved path
- Designed a reverse-proxy layer on top of that fix (not yet built): a new Nginx Proxy Manager LXC fronting every service with friendly `*.lab.jaysynclab.com` URLs and a single wildcard Let's Encrypt cert (DNS-01 via Cloudflare, no public DNS records ever published). Documented as a draft page, [`docs/networking/reverse-proxy.mdx`](docs/networking/reverse-proxy.mdx)

## 2026-07-11

- **Automated the site's data sync** — `infrastructure/inventory.yaml` (the host/service inventory driving the site's homepage, `/architecture`, and `/services`) was hand-maintained separately in `jaysync-lab-site`, which is exactly how it silently went stale for CT 105 earlier. Now pulled automatically by the site's `rebuild-from-docs` pipeline alongside `docs/` — verified end-to-end with a real source-side edit that reached production with zero manual site-side steps
- Reconciling the two copies surfaced a real schema gap: the source lacked a `host:` block the site's homepage needs, and had CT 105 on the wrong VMID band. Both fixed in the source; CT 180 (the playground's golden template, not a running service) marked `template: true` so the site shows it transparently — labelled, in the services catalogue and architecture diagram — without miscounting it as "active"
- `validate-and-dispatch.yml` now also triggers on `infrastructure/inventory.yaml` changes, not just `docs/**`, so an inventory-only edit actually notifies the site
- Rewrote all four org READMEs (`JaySync-Lab`, `jaysync-lab-site`, `jaysync-lab-playground`, `.github` profile) for accuracy — `jaysync-lab-site` had none at all; the playground's still said Phase 3 was next when Phase 4 has been live for a while
- `jaysync-lab-playground`: added a feedback form (`/feedback`) — real submissions become labeled GitHub issues (bug / feature-request / feedback / contribution-interest), guarded by a honeypot field and a per-IP rate limit, plus two styled notification emails (an owner alert linking the issue, and a personalized thank-you to the submitter if they left an email) sent via the existing Resend integration, with a shared logo header across all outgoing mail
- Fixed a real, live bug found and root-caused via direct measurement: `.scanline-overlay`'s animated pseudo-element was leaking into the page's scrollable-overflow calculation on two pages missing `overflow-hidden`, causing a periodic scrollbar flicker

## 2026-07-10

- `jaysync-lab-playground` Part 4: live host CPU/RAM stats (`GET /status`, gated on a new narrowly-scoped `Sys.Audit` Proxmox grant), and a mobile on-screen Ctrl/Esc/Tab/arrow toolbar for the terminal — the toolbar passed emulated-viewport testing but didn't actually work on a real iPhone (Safari's dynamic viewport chrome miscalculating `vh`), root-caused and fixed with `position: fixed` + `dvh` units + `env(safe-area-inset-bottom)`, then confirmed on real hardware
- CT 180 golden template retemplated to fix `tmux` mouse mode (`set -g mouse on`) — wheel-scroll inside a session was cycling bash history instead of scrolling terminal output; verified end-to-end with a real mouse-wheel event against a live session
- Round-2 mobile-compatibility pass across both public sites: fixed a discoverability gap on the site's VMID band diagram (intentionally horizontally-scrollable, but no visual cue on touch devices) and a cramped status-row layout on the playground's narrowest supported viewport; added a dismissible "use a computer for the best experience" banner
- `jaysync-lab-site`: fixed the splash screen only playing once per browser session instead of on every load

## 2026-07-07

- **Playground Phase 3 (session controller) complete** — full write-up in `jaysync-lab-playground`'s `implementation-log.md`. Summary:
  - CT 105 repurposed from the old, unused docs-engine experiment into `playground-controller`: an unprivileged LXC, dual-homed (`vmbr0` for LAN, `vmbr_sandbox` for reaching session clones), running a FastAPI app (`POST /sessions`, `WS /ws/{session_id}`) plus a background reaper, deployed as a systemd service with `Restart=on-failure`
  - Proxmox access scoped down: a dedicated `playground-sandbox` resource pool, a purpose-built `playground-ctrl@pve` user with a privilege-separated API token, and a `PlaygroundCtrlRole` role — no `root@pam` or raw shell access involved
  - Golden template updated: CT 180 was found to have ttyd bound to `localhost` only (a correct choice in Phase 2, before the controller's cross-network design existed, but wrong now) — retemplated via a temporary CT 183 to fix the binding, then restored back to VMID 180 once the fix was fully proven against the real host, keeping the original template numbering convention
  - Step 3.8's full end-to-end test against the real host found and fixed three real bugs: a WebSocket relay crash on ttyd's own text-frame handshake, a relay that silently never tore down a session on disconnect (`asyncio.gather()` waiting on both relay directions instead of tearing down on the first to finish), and an LXC `nesting=1` regression that hung every session's shell via a failed `systemd-logind`
  - All six Step 3.8 scenarios (basic session, disallowed commands, timeout cleanup, early disconnect, concurrency cap, zero leftovers) passing against the real host
- Marked the old `production-documentation-engine` docs page as draft and delisted it from the services nav, since CT 105 no longer runs that role — now superseded by a real `playground-controller` page (see below)

## 2026-07-06

- Proxmox host came back online after an unplanned ~3.5-day offline period; root cause undetermined (no crash log found in the prior boot's journal — most consistent with a power event, not a kernel panic or planned shutdown)
- Took a full pre-work backup before resuming any infrastructure changes: `vzdump` of all 5 guests plus a host-config tarball, verified complete before proceeding

## 2026-07-03

- Restructured `/docs` into a Fumadocs-compatible tree: converted all flat `.md` files to `.mdx` with a four-field frontmatter schema (`title`, `description`, `status`, `icon`) and a `meta.json` per folder for navigation
- Added `RULEBOOK.md` (docs-authoring guide) to the repo root
- Isolated secrets: moved `security/lab-credentials.enc.yaml` to `secrets/lab-credentials.enc.yaml` via `git mv` (history preserved); no change needed to `.sops.yaml` since its `path_regex` matches by filename suffix, not folder
- Added `scripts/validate-docs.mjs` and a GitHub Actions workflow (`validate-and-dispatch.yml`) that validates frontmatter/`meta.json` on every push to `docs/**` before notifying `jaysync-lab-site`
- Removed the superseded flat-file docs (`infrastructure/`, `networking/`, `security/`, `services/` READMEs) and a stale planning artifact (`docs/superpowers/`) left over from an earlier Claude Code session
- **Drift found and fixed — dispatch step:** the `curl` call notifying `jaysync-lab-site` reported success even on HTTP error responses, since plain `curl` doesn't treat 4xx/5xx as a failure on its own; added the `-f` flag so the step now fails the workflow correctly when the dispatch actually fails
- Added `workflow_dispatch` to `validate-and-dispatch.yml` so the workflow can be triggered manually from the Actions tab for testing
- `jaysync-lab-site`: added a `rebuild-from-docs.yml` workflow (triggered by the `docs-updated` repository_dispatch event) and a `filter-drafts.mjs` script — it pulls `docs/` from this repo, strips any page marked `status: draft`, runs a pre-flight `npm run build`, and only commits+pushes the synced content if that build succeeds, so the site's existing Vercel auto-deploy can never pick up a broken build
- Verified the full pipeline end-to-end: pushed a real docs edit to this repo's `main`, `jaysync-lab-site` received the dispatch, pulled/filtered/built successfully, committed, and deployed — zero manual steps in between
- The `JaySync-Lab` and `jaysync-lab-site` repositories were transferred into the new `JaySync-Lab` GitHub organization, and `jaysync-lab-site`'s default branch was renamed from `master` to `main`

## 2026-07-02

- Created the `JaySync-Lab` GitHub organization, including a `.github` profile repository (exact creation timestamp isn't git-recorded — this is an account-level action, not a commit; dated from the earliest repo activity confirmed inside the org)
- Created `jaysync-lab-playground`, a sandboxed staging repo for testing phased infrastructure changes before they touch production — see that repo's own `implementation-log.md` for phase-by-phase detail (drift notes, verification steps, etc.)

## 2026-06-19

- Added `CHANGELOG.md` to track all notable lab changes going forward
- Added `infrastructure/proxmox-host.md` documenting Proxmox node identity, software versions, `vmbr0` bridge config, storage pool definitions, and post-install configuration steps

## 2026-06-18

- Corrected SSD (Storage 1) capacity to 512GB in hardware specification
- Corrected storage pool capacities from live Proxmox data extraction (`local` ~94GB, `local-lvm` ~320GB, `vault` ~916GB)
- Updated all hardware and hypervisor documentation from a live Proxmox host extract (Proxmox VE 9.2.3, Kernel 7.0.6-2-pve, QEMU 11.0.0, LXC 7.0.0)

## 2026-04-16

- Added SOPS + Age encryption configuration and live end-to-end testing on the Proxmox node
- Documented Uptime Kuma (CT 101) observability container with custom HTML email alert template and status-page CSS
- Documented Tailscale bare-metal VPN setup and the MagicDNS conflict fix (`--accept-dns=false` + hardcoded resolv.conf)
- Documented Pi-hole (CT 100) DNS container: deployment, upstream resolvers, DHCP broadcast integration
- Documented BIOS pre-installation configuration (VT-x enabled, VT-d enabled, UEFI boot, ACPI power restore)
- Established repository folder structure: `/infrastructure`, `/networking`, `/services`, `/security`, `/templates`
- Added Uptime Kuma alert email template and status-page CSS theme to `/templates`
- Rebuilt repository with clean structure after removing initial scaffold

## Earlier (reconstructed from initial commit — 2026-02-27)

- Initial repository created
