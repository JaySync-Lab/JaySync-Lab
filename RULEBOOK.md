# RULEBOOK.md — Writing Docs for the JaySync-Lab Site

This file is the howto for adding or editing content under `/docs`. It
covers frontmatter, folder structure, the draft/published workflow, and
what happens after you push. It does **not** cover repository navigation
or infrastructure — see [`MAINTENANCE.md`](./MAINTENANCE.md) for that.

If you're reading this after months away from the project: start here,
follow it step by step, and you should be able to add a page without
guessing at anything.

---

## 1. What this repo is and how it connects to the site

`/docs` in this repository is the single source of truth for everything
published on [jaysync-lab-site](https://github.com/JaySync-Lab/jaysync-lab-site).

Every time you push a change under `docs/**` to `main`:

1. A validation check runs automatically (see §7) confirming every changed
   page has correct frontmatter and every folder has a `meta.json`.
2. If validation passes, this repo notifies `jaysync-lab-site` that new
   content is ready.
3. The site pulls a fresh copy of `/docs`, filters out anything marked
   `status: draft`, and rebuilds.
4. If the site's build also succeeds, it deploys. If anything fails at any
   point, the live site is untouched — it just keeps showing the last
   working version.

You never touch the site repo directly to publish a docs change. Editing
`/docs` here and pushing is the entire publishing workflow.

## 2. Folder structure

```
docs/
├── meta.json                  ← top-level section order
├── index.mdx                  ← homepage
├── changelog.mdx
├── infrastructure/
│   ├── meta.json
│   ├── hardware.mdx
│   └── proxmox-host.mdx
├── networking/
│   ├── meta.json
│   └── tailscale-routing.mdx
├── security/
│   ├── meta.json
│   └── index.mdx
└── services/
    ├── meta.json
    ├── pi-hole.mdx
    ├── uptime-kuma.mdx
    ├── home-assistant.mdx
    ├── media-stack.mdx
    └── production-documentation-engine.mdx
```

Each top-level folder under `docs/` is a section in the site's sidebar.
The filename (without `.mdx`) becomes the URL — `services/pi-hole.mdx`
becomes `/docs/services/pi-hole`. You don't set the URL manually anywhere.

## 3. Adding a new page — step by step

1. Decide which section it belongs in (or create a new folder if it's a
   genuinely new section — see §4 if so).
2. Create a new `.mdx` file, name in **lowercase-kebab-case**
   (e.g. `new-service.mdx`, not `NewService.mdx` or `new_service.mdx`).
3. Add frontmatter at the top of the file — see §5 for the exact fields.
4. Write the content in normal Markdown below the frontmatter.
5. Add the new filename (without `.mdx`) to that folder's `meta.json`
   `pages` array, in the order you want it to appear.
6. Commit and push to `main`. That's the whole publishing step.

## 4. Adding a new section (new top-level folder)

1. Create the folder under `docs/`.
2. Add a `meta.json` inside it (see §6 for the format).
3. Add the new folder name to the top-level `docs/meta.json` `pages` array.
4. Add your first page inside it, per §3.

## 5. Frontmatter reference

Every `.mdx` file needs exactly these four fields at the top:

```yaml
---
title: "Page Title"
description: "One sentence describing this page."
status: published
icon: "IconName"
---
```

| Field | Required | Notes |
| :--- | :--- | :--- |
| `title` | Yes | Shown as the page heading and in the sidebar. |
| `description` | Yes | Shown under the title, used for previews/meta tags. |
| `status` | Yes | Either `draft` or `published` — see §7. |
| `icon` | No | Any [Lucide](https://lucide.dev/icons) icon name, e.g. `Server`, `Shield`, `Cpu`. Shown in the sidebar. Omit if you don't want an icon. |

Don't add extra fields beyond these four. If you find yourself wanting to
add one (e.g. `author`, `last_updated`), stop — git already tracks that
information, and every extra field is one more thing to remember and one
more way to fail validation.

## 6. meta.json reference

Every folder that contains `.mdx` files needs a `meta.json` next to them:

```json
{
  "title": "Section Name",
  "pages": ["first-page", "second-page"]
}
```

- `title` — the section name shown in the sidebar.
- `pages` — filenames without `.mdx`, in the order they should appear.
  If a page exists but isn't listed here, it won't show up in navigation.

## 7. The draft → published workflow

Set `status: draft` on any page you're still writing. Draft pages:

- Pass validation and can be committed/pushed safely
- Are **not** included when the site builds — they simply don't appear
  live

This means you can write a page over several sessions, committing
incrementally, without ever accidentally publishing something half-finished.
When it's ready, change `status` to `published` and push — that's the only
step required to make it go live.

## 8. What happens after you push (in plain language)

1. **Gate one (this repo):** a GitHub Action checks every changed page's
   frontmatter and every folder's `meta.json`. If anything is wrong, the
   check fails with a red X on your commit, and nothing happens on the site
   side at all — nothing was even asked to rebuild.
2. **Gate two (the site repo):** if gate one passes, the site is notified
   and pulls a fresh copy of `/docs`, then tries to build. If the build
   fails for any reason, the site simply doesn't deploy — the previous
   working version stays live.

Either way, the live site can never end up broken or showing stale-but-wrong
content. Worst case, it's a few minutes behind while you fix a mistake.

## 9. Common validation failures

| Failure | Cause | Fix |
| :--- | :--- | :--- |
| Missing frontmatter field | One of `title`/`description`/`status` absent | Add the missing field |
| Invalid `status` value | Anything other than exactly `draft` or `published` | Fix the value |
| Filename not kebab-case | Uppercase letters, underscores, or spaces in filename | Rename to `lowercase-kebab-case.mdx` |
| Folder missing `meta.json` | A folder has `.mdx` files but no `meta.json` next to them | Add one, per §6 |

## 10. One rule about secrets

Nothing under `/docs` should ever reference, embed, or link directly to
anything under `/secrets` — encrypted or not. The site's build process is
structurally unable to reach `/secrets` (it only ever fetches `/docs`), and
keeping that boundary clean in the content itself, not just the folder
layout, is what keeps it that way.
