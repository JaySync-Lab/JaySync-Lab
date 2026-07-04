# Changelog

All notable changes to the JaySync-Lab configuration and documentation are recorded here. Dates reflect when changes were committed to the repository.

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
