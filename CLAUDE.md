# CLAUDE.md — JaySync-Lab

**Read this first if you're starting a fresh session here.** This repo is the
hub of a 4-repo ecosystem — if you only read one file across all of them,
read this one.

## What this is

A personal homelab (Proxmox VE, one repurposed HP ProDesk) documented and
built in the open. This specific repo is the **single source of truth**:
every doc page and the machine-readable infrastructure inventory live here.
Nothing downstream is ever hand-edited — it's all pulled from here
automatically.

## The ecosystem (4 repos, all under the `JaySync-Lab` GitHub org)

| Repo | What it is | Live | You are here? |
|:-----|:-----------|:-----|:--|
| **JaySync-Lab** | Docs + inventory — source of truth | — | ✅ |
| [jaysync-lab-site](https://github.com/JaySync-Lab/jaysync-lab-site) | Next.js + Fumadocs site that publishes this repo's content | [lab.anujajay.com](https://lab.anujajay.com) | |
| [jaysync-lab-playground](https://github.com/JaySync-Lab/jaysync-lab-playground) | Disposable in-browser Linux terminal sessions | [jslnode.anujajay.com](https://jslnode.anujajay.com) | |
| [.github](https://github.com/JaySync-Lab/.github) | Org profile README | — | |

**Current version: `v1.0.0`** on all four (tagged, released — see each repo's
GitHub Releases page). Open/paused work is tracked on
`jaysync-lab-playground`'s **`v1.1 — Future work`** milestone (issues #17,
#21, #23 — none of it is scheduled, just parked).

## How the pipeline actually works

```
push to docs/** or infrastructure/inventory.yaml on this repo's main
  → validate-and-dispatch.yml validates frontmatter/meta.json (docs)
  → notifies jaysync-lab-site via repository_dispatch
  → site's rebuild-from-docs.yml pulls BOTH docs/ AND infrastructure/inventory.yaml
  → pre-flight `npm run build` — if it fails, nothing is committed, site stays as-is
  → commits the synced content, Vercel auto-deploys
```

You never touch `jaysync-lab-site` directly to change what it shows. Edit
here, push, done. This is a genuinely load-bearing fact: `inventory.yaml`
used to be hand-duplicated in the site repo and silently went stale (see the
2026-07-11 changelog entry) — that class of bug is now structurally
impossible, not just fixed once.

## Key files, in the order you'd actually want them

1. **[`RULEBOOK.md`](RULEBOOK.md)** — how to author docs, how the
   `template:` inventory flag works, the whole publishing contract
2. **[`MAINTENANCE.md`](MAINTENANCE.md)** — directory legend, IP allocation
   map, update procedures
3. **[`CHANGELOG.md`](CHANGELOG.md)** — terse, technical, dated. What
   actually happened, newest first
4. **[`docs/changelog.mdx`](docs/changelog.mdx)** — the same history,
   reader-facing prose, live at [lab.anujajay.com/docs/changelog](https://lab.anujajay.com/docs/changelog)
5. **[`infrastructure/inventory.yaml`](infrastructure/inventory.yaml)** —
   the actual structured data (hosts, services, VMID bands). Has a header
   comment stating it's a source of truth — read that before editing

## Conventions established across this whole ecosystem (all 3 code repos)

- **Branch → PR → merge**, one focused change per PR. This repo is the one
  exception that sometimes pushes small doc fixes direct to `main` (its own
  RULEBOOK describes this as the norm for docs), but the other two repos use
  PRs for everything.
- **Real end-to-end verification before claiming something works.** Not
  "the code looks right" — actual curl/Playwright/API calls against the
  real deployed system. This project has a documented history of bugs that
  passed code review but failed on real hardware/real browsers (e.g. the
  mobile Ctrl toolbar working in emulation but not on a real iPhone,
  root-caused and fixed — see the playground's implementation-log.md).
- **Least-privilege credentials, always.** Every token in this ecosystem is
  scoped to the single repo/permission it needs, and new tokens get their
  exact scope shown for explicit sign-off before creation — never assumed.
- **Vercel preview deployments sit behind SSO/auth protection** that blocks
  automated testing. The established pattern when that blocks pre-merge
  verification: merge first (once code review / build / typecheck are
  clean), then verify against production immediately after, with explicit
  user awareness that's what's happening.
- **Test artifacts get cleaned up**, not left as noise — test GitHub issues
  closed with an explanatory comment, test rate-limit keys cleared, etc.

## Knowledge graph

A graphify knowledge graph of this ecosystem lives in
[`graphify-out/`](graphify-out/) (merged across all 3 code repos — see
`graphify-out/graph.json` and `graphify-out/GRAPH_REPORT.md`). If you're
trying to understand how a specific piece connects to another, try
`graphify query "<question>"` before re-exploring the codebase from
scratch.
