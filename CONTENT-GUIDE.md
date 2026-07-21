# CONTENT-GUIDE.md — What a Service Page Must Cover

This file is the editorial companion to [`RULEBOOK.md`](RULEBOOK.md).
`RULEBOOK.md` covers publishing *mechanics* — frontmatter, `meta.json`,
the draft/published gate. This file covers *depth*: what a page actually
has to say to be complete, so a new service page doesn't quietly end up
thin the way several already had (`pi-hole.mdx`, `uptime-kuma.mdx`,
`home-assistant.mdx`, and `media-stack.mdx` were all rewritten from
resource-spec-plus-one-paragraph pages to this standard on 2026-07-21).

## The Four Categories

Every service/infrastructure page must cover all four. If one genuinely
doesn't apply, say so explicitly (e.g. media-stack's "External
Dependencies: None." section) — a reader should be able to tell the
category was considered, not skipped by accident.

This applies to pages documenting a specific running service or piece of
infrastructure — not to `docs/ecosystem/`'s architecture/topic overviews
(e.g. "Site Architecture", "Domain & DNS Architecture"), which explain how
several pieces fit together rather than describe one deployable thing, and
follow their own topic-appropriate structure instead.

### 1. Full resource + config specs

CPU/RAM/disk/network allocation, container/VM flags that matter (e.g.
`nesting=1` for Docker-in-LXC, GPU passthrough config), and the exact
provisioning method if it's non-obvious (Helper Script vs. hand-built,
clone-from-template, etc.).

### 2. Every external dependency, named

Every Cloudflare Tunnel hostname, Cloudflare Access policy, email service,
DNS record, and API token/account this service actually uses — by name and
scope only. **Never a secret value.** `RULEBOOK.md` §10's rule is absolute:
nothing under `/docs` ever references anything under `/secrets`, encrypted
or not. "Uses a dedicated `pve-exporter@pve` API token with the
`ExporterAuditRole` (read-only)" is correct; the token's actual value is
not, ever.

### 3. Operational details

Backup/update strategy (including "none configured" if that's the honest
answer — don't invent one), autostart/boot-order behavior, known
gotchas or incidents specific to this service (especially ones that
*recurred* — say so plainly, like Home Assistant's `trusted_proxies`
config disappearing twice), and how to check its health/logs.

### 4. Access & security model

Exactly how it's reached — LAN IP, reverse-proxy hostname, Tailscale
split-DNS, public Cloudflare Tunnel — and what credentials/accounts
control access to it. If something is deliberately *not* reachable a
certain way (media-stack has no reverse-proxy entry, on purpose), state
that plainly too — it reads very differently from an oversight once it's
written down as a decision.

## Worked Example

[`proxmox-host.mdx`](docs/infrastructure/proxmox-host.mdx) and
[`playground-controller.mdx`](docs/services/playground-controller.mdx) are
the reference model — both already hit this standard before this guide was
written. Match their depth and tone, not their exact section headers;
the four categories matter, not the literal words used to introduce them.
