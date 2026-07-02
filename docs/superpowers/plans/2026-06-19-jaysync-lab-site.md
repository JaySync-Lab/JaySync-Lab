# JaySync-Lab Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a live documentation + portfolio website (`jaysync-lab-site`) for the JaySync-Lab homelab, deployed on Vercel, using Next.js (App Router) + Fumadocs + Tailwind CSS, pulling real data from a parsed `inventory.yaml` and `CHANGELOG.md`.

**Architecture:** Content lives in `content/` (copied from the `JaySync-Lab` repo) and is served via Fumadocs for doc pages. Build-time loaders in `src/lib/` parse `inventory.yaml` and `CHANGELOG.md` into typed TypeScript, powering the homepage, services grid, architecture diagram, and changelog timeline. A client-side `StatusBadge` component fetches live status from Uptime Kuma at runtime.

**Tech Stack:** Next.js 15 (App Router), Fumadocs (v14+), Tailwind CSS v4, TypeScript, `js-yaml`, `lucide-react`, Vercel (deployment)

## Global Constraints

- Node.js 20+ required
- No placeholder/lorem content — all rendered text comes from real files in `content/` or `inventory.yaml`
- `NEXT_PUBLIC_UPTIME_KUMA_STATUS_URL` env var controls the live status endpoint (may be empty/undefined — graceful fallback required; return null if unset)
- Windows development environment (`C:\gitProject\`) — use PowerShell syntax for shell commands
- Fumadocs content source: `dir: 'content'` (picks up all subdirectory .md files recursively)
- Tailwind CSS v4 config style — use CSS `@theme` directive in `globals.css`, NOT `tailwind.config.js`
- Commit after every task
- Never import server-side code (`fs`, `path`, `js-yaml`) in client components (files with `'use client'`)
- Route group `(site)` wraps all non-docs pages (homepage, services, architecture, changelog) to share the `Nav` layout without affecting `/docs` which uses Fumadocs' own layout

---

## File Map

```
C:\gitProject\
├── JaySync-Lab\                         ← existing source-of-truth repo
│   └── infrastructure\
│       └── inventory.yaml               ← CREATE in Task 1
│
└── jaysync-lab-site\                    ← CREATE via npx in Task 1
    ├── content\                         ← copied from JaySync-Lab in Task 1
    │   ├── infrastructure\
    │   │   ├── hardware.md
    │   │   ├── proxmox-host.md
    │   │   └── inventory.yaml
    │   ├── networking\tailscale-routing.md
    │   ├── services\
    │   │   ├── pi-hole\README.md
    │   │   ├── uptime-kuma\README.md
    │   │   ├── home-assistant\README.md
    │   │   ├── media-stack\README.md
    │   │   └── production-documentation-engine\README.md
    │   ├── security\README.md
    │   ├── CHANGELOG.md
    │   └── README.md
    ├── src\
    │   ├── app\
    │   │   ├── layout.tsx               ← MODIFY Task 5 (fonts, RootProvider)
    │   │   ├── globals.css              ← MODIFY Task 5 (@theme palette)
    │   │   ├── (site)\
    │   │   │   ├── layout.tsx           ← CREATE Task 5 (Nav wrapper)
    │   │   │   ├── page.tsx             ← CREATE Task 6 (homepage)
    │   │   │   ├── services\page.tsx    ← CREATE Task 7
    │   │   │   ├── architecture\page.tsx ← CREATE Task 8
    │   │   │   └── changelog\page.tsx   ← CREATE Task 9
    │   │   └── docs\
    │   │       ├── layout.tsx           ← CREATE Task 4
    │   │       └── [[...slug]]\page.tsx ← CREATE Task 4
    │   ├── components\
    │   │   ├── Nav.tsx                  ← CREATE Task 5
    │   │   ├── LabDiagram.tsx           ← CREATE Task 6 (SVG topology)
    │   │   ├── VmidRack.tsx             ← CREATE Task 6 (homepage rack strip)
    │   │   ├── ServiceCard.tsx          ← CREATE Task 7
    │   │   ├── VmidBandDiagram.tsx      ← CREATE Task 8
    │   │   ├── Timeline.tsx             ← CREATE Task 9
    │   │   └── StatusBadge.tsx          ← CREATE Task 10
    │   └── lib\
    │       ├── inventory.ts             ← CREATE Task 2
    │       ├── changelog.ts             ← CREATE Task 3
    │       └── source.ts               ← VERIFY/CREATE Task 4
    ├── source.config.ts                 ← MODIFY Task 4
    ├── next.config.ts                   ← VERIFY Task 4
    └── .env.local                       ← CREATE Task 10
```

---

### Task 1: Add inventory.yaml to JaySync-Lab & Scaffold jaysync-lab-site

**Files:**
- Create: `C:\gitProject\JaySync-Lab\infrastructure\inventory.yaml`
- Create: `C:\gitProject\jaysync-lab-site\` (scaffold via npx)
- Create: `C:\gitProject\jaysync-lab-site\content\` (copied from JaySync-Lab)

**Interfaces:**
- Produces: `content/infrastructure/inventory.yaml` — consumed by Task 2
- Produces: `content/CHANGELOG.md` — consumed by Task 3
- Produces: Fumadocs Next.js scaffold — consumed by all subsequent tasks

- [ ] **Step 1: Create infrastructure/inventory.yaml in JaySync-Lab**

Create the file `C:\gitProject\JaySync-Lab\infrastructure\inventory.yaml` with this exact content:

```yaml
hardware:
  - id: zte-router
    name: "ZTE Router"
    ip: "192.168.1.1"
    type: hardware
    role: "Gateway / DHCP Server"
    vmid: null

  - id: proxmox-host
    name: "Proxmox Host"
    ip: "192.168.1.100"
    type: bare-metal
    role: "Hypervisor — Management UI (port 8006)"
    vmid: null
    docs: infrastructure/hardware.md

nodes:
  - vmid: 100
    name: pi-hole
    type: lxc
    ip: "192.168.1.101"
    role: "Local DNS & Network Protection"
    status_name: "Pi-hole"
    docs: services/pi-hole/README.md
    band: core-network

  - vmid: 101
    name: uptime-kuma
    type: lxc
    ip: "192.168.1.102"
    role: "Infrastructure Observability (The Watchman)"
    status_name: "Uptime Kuma"
    docs: services/uptime-kuma/README.md
    band: core-network

  - vmid: 103
    name: home-assistant
    type: vm
    ip: "192.168.1.11"
    role: "Smart Home OS (HAOS)"
    status_name: "Home Assistant"
    docs: services/home-assistant/README.md
    band: specialized-controllers

  - vmid: 104
    name: media-stack
    type: lxc
    ip: "192.168.1.104"
    role: "Docker-based streaming stack (GPU passthrough)"
    status_name: "Media Stack"
    docs: services/media-stack/README.md
    band: media-streaming

  - vmid: 105
    name: production-documentation-engine
    type: lxc
    ip: "192.168.1.105"
    role: "Documentation platform"
    status_name: "Docs Engine"
    docs: services/production-documentation-engine/README.md
    band: automation-utilities
    created: "2026-06-17"

overlay:
  - id: tailscale-proxmox
    name: "Tailscale (Proxmox)"
    ip: "100.87.172.121"
    type: overlay
    role: "Remote access mesh VPN"
    vmid: null
    docs: networking/tailscale-routing.md

vmid_bands:
  - id: core-network
    range: "100-119"
    label: "Core Network Layer"
    purpose: "DNS, reverse proxies, VPN gateways, core firewalls"
    isolation: lxc
  - id: automation-utilities
    range: "120-139"
    label: "Automation & Utilities"
    purpose: "Home Assistant DB backends, analytics nodes, cron pipelines"
    isolation: lxc
  - id: specialized-controllers
    range: "140-159"
    label: "Specialized Core Controllers"
    purpose: "Primary home controllers requiring kernel isolation"
    isolation: qemu-vm
  - id: media-streaming
    range: "160-179"
    label: "Media & Streaming Stacks"
    purpose: "Video streaming servers, media indexers, transcoder controllers"
    isolation: lxc-gpu-passthrough
  - id: sandboxes-testing
    range: "180-199"
    label: "Sandboxes & Testing"
    purpose: "Local AI playgrounds, testing sandboxes, experimental environments"
    isolation: lxc-or-vm
```

- [ ] **Step 2: Commit inventory.yaml to JaySync-Lab**

```powershell
cd C:\gitProject\JaySync-Lab
git add infrastructure/inventory.yaml
git commit -m "feat: add machine-readable inventory.yaml for website data layer"
```

Expected: commit succeeds.

- [ ] **Step 3: Scaffold jaysync-lab-site with Fumadocs**

```powershell
cd C:\gitProject
npx create-fumadocs-app@latest jaysync-lab-site
```

When prompted: select Next.js, TypeScript yes, Tailwind CSS yes, accept defaults for everything else. If the CLI asks for a content directory, keep the default (`content/docs`) — we'll change it in Task 4.

Expected: `C:\gitProject\jaysync-lab-site\` created with `src/`, `content/`, `package.json`, `source.config.ts`, `next.config.ts`.

- [ ] **Step 4: Install additional dependencies**

```powershell
cd C:\gitProject\jaysync-lab-site
npm install js-yaml lucide-react
npm install -D @types/js-yaml
```

Expected: `node_modules\js-yaml` present.

- [ ] **Step 5: Copy content from JaySync-Lab**

```powershell
cd C:\gitProject\jaysync-lab-site

# Remove default Fumadocs sample content
Remove-Item -Recurse -Force content\docs -ErrorAction SilentlyContinue

# Copy real content directories
Copy-Item -Recurse -Force "..\JaySync-Lab\infrastructure" "content\"
Copy-Item -Recurse -Force "..\JaySync-Lab\networking" "content\"
Copy-Item -Recurse -Force "..\JaySync-Lab\services" "content\"
Copy-Item -Recurse -Force "..\JaySync-Lab\security" "content\"
Copy-Item -Recurse -Force "..\JaySync-Lab\templates" "content\"
Copy-Item -Force "..\JaySync-Lab\CHANGELOG.md" "content\"
Copy-Item -Force "..\JaySync-Lab\README.md" "content\"
```

- [ ] **Step 6: Verify content tree**

```powershell
Get-ChildItem -Recurse content -File | Select-Object -ExpandProperty FullName
```

Expected output includes:
```
...\content\infrastructure\hardware.md
...\content\infrastructure\inventory.yaml
...\content\services\pi-hole\README.md
...\content\CHANGELOG.md
```

- [ ] **Step 7: Initialize git and commit scaffold**

```powershell
git init
git add .
git commit -m "chore: scaffold fumadocs site with real content from JaySync-Lab"
```

---

### Task 2: Data Layer — Inventory Loader

**Files:**
- Create: `src/lib/inventory.ts`

**Interfaces:**
- Consumes: `content/infrastructure/inventory.yaml` (server-side filesystem only)
- Produces:
  - `HardwareNode`, `ServiceNode`, `OverlayNode`, `VmidBand`, `Inventory` interfaces (exported)
  - `getInventory(): Inventory`
  - `getNodes(): ServiceNode[]`
  - `getBands(): VmidBand[]`

- [ ] **Step 1: Create src/lib/inventory.ts**

```typescript
// src/lib/inventory.ts
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export interface HardwareNode {
  id: string;
  name: string;
  ip: string;
  type: string;
  role: string;
  vmid: null;
  docs?: string;
}

export interface ServiceNode {
  vmid: number;
  name: string;
  type: 'lxc' | 'vm';
  ip: string;
  role: string;
  status_name: string;
  docs: string;
  band: string;
  created?: string;
}

export interface OverlayNode {
  id: string;
  name: string;
  ip: string;
  type: 'overlay';
  role: string;
  vmid: null;
  docs: string;
}

export interface VmidBand {
  id: string;
  range: string;
  label: string;
  purpose: string;
  isolation: string;
}

export interface Inventory {
  hardware: HardwareNode[];
  nodes: ServiceNode[];
  overlay: OverlayNode[];
  vmid_bands: VmidBand[];
}

export function getInventory(): Inventory {
  const filePath = path.join(process.cwd(), 'content', 'infrastructure', 'inventory.yaml');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(raw) as Inventory;
}

export function getNodes(): ServiceNode[] {
  return getInventory().nodes;
}

export function getBands(): VmidBand[] {
  return getInventory().vmid_bands;
}
```

- [ ] **Step 2: Verify types compile**

```powershell
npx tsc --noEmit
```

Expected: no errors. If `Cannot find module 'js-yaml'`, run `npm install -D @types/js-yaml`.

- [ ] **Step 3: Smoke test the loader in dev server**

In the existing scaffold homepage (`src/app/page.tsx`), temporarily add:

```typescript
import { getInventory } from '@/lib/inventory';
// Inside the page component (it must be async or server component):
const inv = getInventory();
console.log('INVENTORY CHECK — Nodes:', inv.nodes.length, 'Bands:', inv.vmid_bands.length);
```

```powershell
npm run dev
```

Check the terminal running `npm run dev`. Expected server-side log:
```
INVENTORY CHECK — Nodes: 5 Bands: 5
```

Remove the `console.log` line after confirming output.

- [ ] **Step 4: Commit**

```powershell
git add src/lib/inventory.ts
git commit -m "feat: build-time inventory.yaml loader with TypeScript types"
```

---

### Task 3: Data Layer — Changelog Loader

**Files:**
- Create: `src/lib/changelog.ts`

**Interfaces:**
- Consumes: `content/CHANGELOG.md` (server-side filesystem only)
- Produces:
  - `ChangelogEntry` interface (exported): `{ date: string | null; label: string; entries: string[] }`
  - `getChangelog(): ChangelogEntry[]` — sorted most-recent-first, `date: null` group always last

- [ ] **Step 1: Create src/lib/changelog.ts**

```typescript
// src/lib/changelog.ts
import fs from 'fs';
import path from 'path';

export interface ChangelogEntry {
  date: string | null;
  label: string;
  entries: string[];
}

export function getChangelog(): ChangelogEntry[] {
  const filePath = path.join(process.cwd(), 'content', 'CHANGELOG.md');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split('\n');

  const groups: ChangelogEntry[] = [];
  let current: ChangelogEntry | null = null;

  for (const line of lines) {
    const dated = line.match(/^## (\d{4}-\d{2}-\d{2})$/);
    const earlier = line.match(/^## Earlier/i);
    const bullet = line.match(/^- (.+)/);

    if (dated) {
      if (current) groups.push(current);
      current = { date: dated[1], label: dated[1], entries: [] };
    } else if (earlier) {
      if (current) groups.push(current);
      current = { date: null, label: 'Earlier (reconstructed)', entries: [] };
    } else if (bullet && current) {
      current.entries.push(bullet[1].trim());
    }
  }

  if (current) groups.push(current);

  return groups.sort((a, b) => {
    if (a.date === null) return 1;
    if (b.date === null) return -1;
    return b.date.localeCompare(a.date);
  });
}
```

- [ ] **Step 2: Verify types compile**

```powershell
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Smoke test the changelog loader**

Temporarily in `src/app/page.tsx`:

```typescript
import { getChangelog } from '@/lib/changelog';
const cl = getChangelog();
console.log('CHANGELOG CHECK:', cl.map(g => `${g.label}: ${g.entries.length} entries`).join(', '));
```

Run `npm run dev`. Expected server-side console:
```
CHANGELOG CHECK: 2026-06-19: 2 entries, 2026-06-18: 3 entries, 2026-04-16: 8 entries, Earlier (reconstructed): 1 entries
```

Remove the `console.log` after confirming.

- [ ] **Step 4: Commit**

```powershell
git add src/lib/changelog.ts
git commit -m "feat: build-time CHANGELOG.md parser returning sorted ChangelogEntry[]"
```

---

### Task 4: Fumadocs Content Wiring & Docs Route

**Files:**
- Modify: `source.config.ts` — point Fumadocs at `content/` root (not `content/docs`)
- Verify/Modify: `next.config.ts` — ensure `createMDX` wrapper present
- Verify/Create: `src/lib/source.ts` — Fumadocs source loader export
- Create: `src/app/docs/layout.tsx` — Fumadocs sidebar layout
- Create: `src/app/docs/[[...slug]]/page.tsx` — render individual doc pages

**Interfaces:**
- Consumes: all `.md` files under `content/`
- Produces: `/docs/*` routes with sidebar nav, search, and Fumadocs typography

- [ ] **Step 1: Update source.config.ts**

Replace the entire file with:

```typescript
// source.config.ts
import { defineDocs, defineConfig } from 'fumadocs-mdx/config';

export const { docs, meta } = defineDocs({
  dir: 'content',
});

export default defineConfig({
  mdxOptions: {},
});
```

- [ ] **Step 2: Verify next.config.ts has createMDX**

Read `next.config.ts`. If it already wraps with `createMDX`, leave it. If not, replace with:

```typescript
// next.config.ts
import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

const nextConfig = {
  reactStrictMode: true,
};

export default withMDX(nextConfig);
```

- [ ] **Step 3: Verify or create src/lib/source.ts**

Read `src/lib/source.ts`. If the Fumadocs scaffold created it and it exports `source`, leave it unchanged. If it references `content/docs` instead of `content`, or if the file doesn't exist, write:

```typescript
// src/lib/source.ts
import { loader } from 'fumadocs-core/source';
import { createMDXSource } from 'fumadocs-mdx';
import { docs, meta } from '../../source.config';

export const source = loader({
  baseUrl: '/docs',
  source: createMDXSource(docs, meta),
});
```

- [ ] **Step 4: Create src/app/docs/layout.tsx**

```typescript
// src/app/docs/layout.tsx
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import type { ReactNode } from 'react';
import { source } from '@/lib/source';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout tree={source.pageTree} nav={{ title: 'JaySync-Lab' }}>
      {children}
    </DocsLayout>
  );
}
```

- [ ] **Step 5: Create src/app/docs/[[...slug]]/page.tsx**

```typescript
// src/app/docs/[[...slug]]/page.tsx
import { notFound } from 'next/navigation';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
import { source } from '@/lib/source';
import defaultMdxComponents from 'fumadocs-ui/mdx';

interface Props {
  params: Promise<{ slug?: string[] }>;
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={defaultMdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  return { title: `${page.data.title} — JaySync-Lab` };
}
```

- [ ] **Step 6: Run dev server and verify docs route**

```powershell
npm run dev
```

Navigate to `http://localhost:3000/docs`. Expected:
- Fumadocs sidebar appears with sections: infrastructure, networking, services, security
- Click "hardware" (from infrastructure/) — the content from `content/infrastructure/hardware.md` renders with Fumadocs typography, table of contents on the right

If you see a blank page or 404, check the terminal for errors from the MDX source loader.

- [ ] **Step 7: Commit**

```powershell
git add source.config.ts next.config.ts src/app/docs src/lib/source.ts
git commit -m "feat: fumadocs wired to serve all content/ subdirs as /docs/* pages"
```

---

### Task 5: Design System

**Files:**
- Modify: `src/app/globals.css` — `@theme` block with palette and font vars
- Modify: `src/app/layout.tsx` — load Inter and JetBrains Mono via `next/font`, apply font variables
- Create: `src/app/(site)/layout.tsx` — route group layout wrapping Nav + main
- Create: `src/components/Nav.tsx` — sticky top navigation bar

**Design rationale (documented before any UI code):**

Palette — chosen for homelab/ops subject:
- Base `#020617` (Tailwind `slate-950`): genuinely dark but not pure OLED black. Avoids the "hacker aesthetic" pure-black trap.
- Multiple semantic colors mirror actual hardware LED semantics: signal-blue (`#38BDF8`) for links/interactive; health-green (`#22C55E`) for up-status; alert-red (`#EF4444`) for down-status; amber (`#F59E0B`) for metric highlights. This directly maps to what you'd see on a router's port LEDs and Uptime Kuma's dashboard.
- Rejected "near-black + single neon accent" because it can't carry semantic weight across three distinct states (up/down/loading) without becoming confusing.
- Rejected cream/serif because the subject is infrastructure ops, not editorial content.

Typography:
- `Inter` for UI text — clean, neutral, reads as engineering not marketing
- `JetBrains Mono` for ALL data values: IPs (`192.168.1.101`), VMIDs (`CT 100`), storage capacities — not just code blocks. Monospace applied wherever numeric/address data appears inline.
- Rejected display serifs (Playfair, Lora) as unsuitable for ops dashboards
- Rejected IBM Plex Mono for headings — adds unnecessary visual complexity; Inter alone is clean enough

Signature visual element — **VMID Rack Column**: a vertical strip mapping VMIDs 100-199 to colored zones by band, with active service slots highlighted at their actual VMID offsets. This is derived directly from the VMID banding scheme specific to this lab. It cannot come from a template.

Self-critique: The dark palette + monospace data values is common in ops tooling. What makes it NOT generic: (1) the VMID rack is unique to this infrastructure, (2) multiple semantic colors instead of single neon, (3) hero copy uses real numbers from inventory ("5 containers. 16GB RAM.") not marketing language, (4) the network topology diagram is an actual SVG, not an icon grid.

- [ ] **Step 1: Update src/app/layout.tsx with fonts and base styles**

```typescript
// src/app/layout.tsx
import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata = {
  title: 'JaySync-Lab',
  description: 'HP ProDesk 400 G3 running Proxmox VE — homelab infrastructure documentation',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="bg-[#020617] text-[#cbd5e1] antialiased min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Define @theme palette in globals.css**

Prepend this block to `src/app/globals.css` (keep any existing Fumadocs imports after it):

```css
@import "tailwindcss";
@import "fumadocs-ui/style.css";

@theme {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-mono), ui-monospace, "Courier New", monospace;

  --color-lab-bg:      #020617;
  --color-lab-surface: #0f172a;
  --color-lab-card:    #1e293b;
  --color-lab-border:  #334155;
  --color-lab-text:    #cbd5e1;
  --color-lab-muted:   #64748b;
  --color-lab-signal:  #38bdf8;
  --color-lab-up:      #22c55e;
  --color-lab-down:    #ef4444;
  --color-lab-amber:   #f59e0b;

  --color-band-core:        #3b82f6;
  --color-band-automation:  #a855f7;
  --color-band-controllers: #f59e0b;
  --color-band-media:       #22c55e;
  --color-band-sandbox:     #475569;
}
```

If Tailwind v4 is not in use (check `package.json` for `tailwindcss` version), and v3 is installed instead, create a `tailwind.config.ts` file and skip the `@theme` approach:

```typescript
// tailwind.config.ts (only if Tailwind v3)
import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        lab: {
          bg: '#020617', surface: '#0f172a', card: '#1e293b',
          border: '#334155', text: '#cbd5e1', muted: '#64748b',
          signal: '#38bdf8', up: '#22c55e', down: '#ef4444', amber: '#f59e0b',
        },
        band: {
          core: '#3b82f6', automation: '#a855f7', controllers: '#f59e0b',
          media: '#22c55e', sandbox: '#475569',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui'],
        mono: ['var(--font-mono)', 'ui-monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
```

- [ ] **Step 3: Create src/components/Nav.tsx**

```typescript
// src/components/Nav.tsx
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/docs', label: 'Docs' },
  { href: '/services', label: 'Services' },
  { href: '/architecture', label: 'Architecture' },
  { href: '/changelog', label: 'Changelog' },
];

export function Nav() {
  return (
    <header className="border-b border-[#334155] bg-[#0f172a]/80 backdrop-blur-sm sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm text-[#38bdf8] font-semibold tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded"
        >
          jaysync-lab<span className="text-[#64748b]">:~$</span>
        </Link>
        <ul className="flex gap-5 overflow-x-auto">
          {NAV_LINKS.map((l) => (
            <li key={l.href} className="shrink-0">
              <Link
                href={l.href}
                className="text-sm text-[#64748b] hover:text-[#cbd5e1] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded px-1"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Create src/app/(site)/layout.tsx**

```typescript
// src/app/(site)/layout.tsx
import type { ReactNode } from 'react';
import { Nav } from '@/components/Nav';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
    </>
  );
}
```

- [ ] **Step 5: Move scaffold homepage into (site) group**

If `src/app/page.tsx` exists from the Fumadocs scaffold, delete it — the `(site)/page.tsx` created in Task 6 will replace it:

```powershell
Remove-Item -Force src\app\page.tsx -ErrorAction SilentlyContinue
```

- [ ] **Step 6: Verify nav renders**

```powershell
npm run dev
```

Navigate to `http://localhost:3000`. Expected: sticky header with `jaysync-lab:~$` wordmark (blue) and Docs/Services/Architecture/Changelog links (muted grey, hover to white). No page content yet (homepage created in Task 6).

- [ ] **Step 7: Commit**

```powershell
git add src/app/globals.css src/app/layout.tsx src/app/(site)/layout.tsx src/components/Nav.tsx
git commit -m "feat: design system — dark palette, Inter + JetBrains Mono, sticky nav"
```

---

### Task 6: Homepage

**Files:**
- Create: `src/components/LabDiagram.tsx` — SVG network topology
- Create: `src/components/VmidRack.tsx` — compact VMID allocation strip
- Create: `src/app/(site)/page.tsx` — homepage

**Interfaces:**
- Consumes: `getInventory()` from `@/lib/inventory`
- Produces: `/` route

- [ ] **Step 1: Create src/components/LabDiagram.tsx**

```typescript
// src/components/LabDiagram.tsx
import type { ServiceNode } from '@/lib/inventory';

interface Props {
  nodes: ServiceNode[];
}

export function LabDiagram({ nodes }: Props) {
  const svgH = 60 + nodes.length * 52;

  return (
    <svg
      viewBox={`0 0 340 ${svgH}`}
      className="w-full max-w-sm"
      aria-label="JaySync-Lab network topology: ZTE Router connects to Proxmox host, which runs 5 containers"
      role="img"
    >
      <defs>
        <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill="#334155" />
        </marker>
      </defs>

      {/* Router */}
      <rect x="8" y={svgH / 2 - 22} width="82" height="44" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
      <text x="49" y={svgH / 2 - 6} textAnchor="middle" fill="#94a3b8" fontSize="8" fontFamily="monospace">ZTE Router</text>
      <text x="49" y={svgH / 2 + 8} textAnchor="middle" fill="#38bdf8" fontSize="7" fontFamily="monospace">192.168.1.1</text>

      {/* Router → Proxmox */}
      <line x1="90" y1={svgH / 2} x2="138" y2={svgH / 2} stroke="#334155" strokeWidth="1.5" markerEnd="url(#arr)" />

      {/* Proxmox */}
      <rect x="140" y={svgH / 2 - 28} width="82" height="56" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="1.5" />
      <text x="181" y={svgH / 2 - 10} textAnchor="middle" fill="#93c5fd" fontSize="8" fontFamily="monospace" fontWeight="600">Proxmox VE</text>
      <text x="181" y={svgH / 2 + 3} textAnchor="middle" fill="#64748b" fontSize="6.5" fontFamily="monospace">192.168.1.100</text>
      <text x="181" y={svgH / 2 + 15} textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="monospace">i5-6500 · 16GB</text>

      {/* Proxmox → Services */}
      {nodes.map((node, i) => {
        const ty = 30 + i * 52;
        return (
          <line key={node.vmid} x1="222" y1={svgH / 2} x2="256" y2={ty + 14} stroke="#1e293b" strokeWidth="1" markerEnd="url(#arr)" />
        );
      })}

      {/* Service nodes */}
      {nodes.map((node, i) => {
        const ty = 8 + i * 52;
        return (
          <g key={node.vmid}>
            <rect x="256" y={ty} width="76" height="30" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="1" />
            <text x="294" y={ty + 12} textAnchor="middle" fill="#cbd5e1" fontSize="7" fontFamily="monospace">{node.name}</text>
            <text x="294" y={ty + 23} textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontFamily="monospace">
              {node.type === 'vm' ? 'VM' : 'CT'} {node.vmid}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
```

- [ ] **Step 2: Create src/components/VmidRack.tsx**

```typescript
// src/components/VmidRack.tsx
import type { ServiceNode, VmidBand } from '@/lib/inventory';

interface Props {
  nodes: ServiceNode[];
  bands: VmidBand[];
}

const BAND_COLORS: Record<string, string> = {
  'core-network':            '#3b82f6',
  'automation-utilities':    '#a855f7',
  'specialized-controllers': '#f59e0b',
  'media-streaming':         '#22c55e',
  'sandboxes-testing':       '#475569',
};

function parseRange(range: string): [number, number] {
  const [s, e] = range.split('-').map(Number);
  return [s, e];
}

export function VmidRack({ nodes, bands }: Props) {
  const SCALE = 3;
  const HEIGHT = 100 * SCALE;

  return (
    <div className="flex gap-4 items-start overflow-x-auto">
      {/* VMID axis labels */}
      <div className="relative shrink-0 font-mono text-[9px] text-[#475569]" style={{ width: '24px', height: HEIGHT }}>
        {[100, 120, 140, 160, 180, 199].map((v) => (
          <span key={v} className="absolute right-0" style={{ top: (v - 100) * SCALE - 5 }}>{v}</span>
        ))}
      </div>

      {/* Color column */}
      <div className="relative shrink-0" style={{ width: '20px', height: HEIGHT }}>
        {bands.map((band) => {
          const [s, e] = parseRange(band.range);
          return (
            <div
              key={band.id}
              className="absolute w-full opacity-25 rounded-sm"
              style={{ top: (s - 100) * SCALE, height: (e - s + 1) * SCALE, backgroundColor: BAND_COLORS[band.id] }}
            />
          );
        })}
        {nodes.map((node) => (
          <div
            key={node.vmid}
            className="absolute w-full rounded-sm"
            style={{
              top: (node.vmid - 100) * SCALE,
              height: SCALE + 2,
              backgroundColor: BAND_COLORS[node.band] ?? '#475569',
            }}
            title={`CT ${node.vmid}: ${node.name}`}
          />
        ))}
      </div>

      {/* Labels */}
      <div className="relative shrink-0 font-mono" style={{ height: HEIGHT, minWidth: '220px' }}>
        {bands.map((band) => {
          const [s, e] = parseRange(band.range);
          const mid = ((s + e) / 2 - 100) * SCALE;
          return (
            <span
              key={band.id}
              className="absolute text-[9px] leading-none"
              style={{ top: mid - 4, color: BAND_COLORS[band.id] ?? '#475569', opacity: 0.6 }}
            >
              {band.label}
            </span>
          );
        })}
        {nodes.map((node) => (
          <span
            key={node.vmid}
            className="absolute text-[9px] leading-none text-[#94a3b8]"
            style={{ top: (node.vmid - 100) * SCALE - 1 }}
          >
            <span style={{ color: BAND_COLORS[node.band] }}>▸</span>{' '}
            {node.name}{' '}
            <span className="text-[#475569]">{node.ip}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create src/app/(site)/page.tsx**

```typescript
// src/app/(site)/page.tsx
import Link from 'next/link';
import { getInventory } from '@/lib/inventory';
import { LabDiagram } from '@/components/LabDiagram';
import { VmidRack } from '@/components/VmidRack';

export const metadata = {
  title: 'JaySync-Lab — Homelab Infrastructure',
};

export default function HomePage() {
  const { hardware, nodes, vmid_bands } = getInventory();
  const proxmox = hardware.find((h) => h.id === 'proxmox-host');

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-24">
        <div>
          <p className="font-mono text-[#38bdf8] text-xs uppercase tracking-widest mb-4">
            HP ProDesk 400 G3 · Proxmox VE 9.2 · {proxmox?.ip}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#e2e8f0] leading-tight mb-6">
            {nodes.length} containers.
            <br />
            <span className="text-[#38bdf8]">16GB RAM.</span>
            <br />
            1 homelab.
          </h1>
          <p className="text-[#64748b] text-base leading-relaxed mb-8 max-w-md">
            An Intel i5-6500 running Pi-hole, Home Assistant, GPU-passthrough
            media streaming, and this documentation engine — all accessible
            over Tailscale.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link
              href="/services"
              className="px-5 py-2.5 bg-[#38bdf8] text-[#020617] text-sm font-semibold rounded hover:bg-[#7dd3fc] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
            >
              View Services
            </Link>
            <Link
              href="/docs"
              className="px-5 py-2.5 border border-[#334155] text-[#cbd5e1] text-sm rounded hover:border-[#38bdf8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8]"
            >
              Browse Docs
            </Link>
          </div>
        </div>

        <div className="overflow-hidden">
          <LabDiagram nodes={nodes} />
        </div>
      </div>

      {/* Stat bar */}
      <div className="border-t border-[#1e293b] pt-12 mb-24 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Containers', value: String(nodes.length), unit: 'LXC + VM' },
          { label: 'RAM', value: '16', unit: 'GB DDR4' },
          { label: 'SSD', value: '512', unit: 'GB fast tier' },
          { label: 'Vault', value: '1TB', unit: 'HDD slow tier' },
        ].map((s) => (
          <div key={s.label} className="border border-[#1e293b] bg-[#0f172a] rounded-lg p-4">
            <p className="font-mono text-[#475569] text-[10px] uppercase tracking-wider mb-2">{s.label}</p>
            <p className="font-mono text-[#f59e0b] text-2xl font-bold">{s.value}</p>
            <p className="text-[#475569] text-xs mt-1">{s.unit}</p>
          </div>
        ))}
      </div>

      {/* VMID Rack */}
      <div className="border-t border-[#1e293b] pt-12">
        <p className="font-mono text-[#475569] text-[10px] uppercase tracking-widest mb-6">
          VMID Allocation · 100–199
        </p>
        <VmidRack nodes={nodes} bands={vmid_bands} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify homepage in browser**

Navigate to `http://localhost:3000`. Confirm:
- Sticky nav present
- Hero heading shows "5 containers. / 16GB RAM. / 1 homelab." with blue "16GB RAM."
- SVG diagram: Router → Proxmox → 5 service boxes visible
- Stat bar: 4 cards with amber monospace numbers
- VMID rack strip with labeled bands and service markers

- [ ] **Step 5: Commit**

```powershell
git add src/app/(site)/page.tsx src/components/LabDiagram.tsx src/components/VmidRack.tsx
git commit -m "feat: homepage — network diagram, stat bar, VMID rack"
```

---

### Task 7: Services Page

**Files:**
- Create: `src/components/ServiceCard.tsx`
- Create: `src/app/(site)/services/page.tsx`

**Interfaces:**
- Consumes: `getNodes(): ServiceNode[]` from `@/lib/inventory`
- Produces: `/services` route — grid of cards, each linking to its docs page

- [ ] **Step 1: Create src/components/ServiceCard.tsx**

```typescript
// src/components/ServiceCard.tsx
import Link from 'next/link';
import type { ServiceNode } from '@/lib/inventory';

interface Props {
  node: ServiceNode;
}

function docPath(node: ServiceNode): string {
  return `/docs/${node.docs.replace(/\/README\.md$/, '').replace(/\.md$/, '')}`;
}

export function ServiceCard({ node }: Props) {
  return (
    <article className="border border-[#1e293b] bg-[#0f172a] rounded-lg p-5 hover:border-[#334155] transition-colors flex flex-col gap-3 group">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[10px] text-[#475569] uppercase tracking-wider mb-1">
            {node.type === 'vm' ? 'VM' : 'CT'} {node.vmid}
          </p>
          <h3 className="text-[#e2e8f0] font-semibold text-base capitalize leading-snug">
            {node.name.replace(/-/g, ' ')}
          </h3>
        </div>
        {/* StatusBadge slot — wired in Task 10 */}
        <div data-status-slot={node.status_name} />
      </div>

      <p className="text-[#64748b] text-sm leading-relaxed flex-1">{node.role}</p>

      <p className="font-mono text-[11px] text-[#38bdf8]">{node.ip}</p>

      <Link
        href={docPath(node)}
        className="text-xs text-[#475569] group-hover:text-[#38bdf8] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded mt-1"
      >
        View docs →
      </Link>
    </article>
  );
}
```

- [ ] **Step 2: Create src/app/(site)/services/page.tsx**

```typescript
// src/app/(site)/services/page.tsx
import { getNodes } from '@/lib/inventory';
import { ServiceCard } from '@/components/ServiceCard';

export const metadata = { title: 'Services — JaySync-Lab' };

export default function ServicesPage() {
  const nodes = getNodes();

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="font-mono text-[#38bdf8] text-[10px] uppercase tracking-widest mb-3">
          {nodes.length} active containers
        </p>
        <h1 className="text-3xl font-bold text-[#e2e8f0]">Services</h1>
        <p className="text-[#64748b] mt-3 max-w-lg text-sm leading-relaxed">
          All containers and VMs running on the Proxmox host. Each is monitored
          by Uptime Kuma and has dedicated documentation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nodes.map((node) => (
          <ServiceCard key={node.vmid} node={node} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Verify services page**

Navigate to `http://localhost:3000/services`. Expected: 5 cards in a 1/2/3-column grid (responsive). Each shows VMID, name, role, IP, and "View docs →" link. Click a link — should navigate to the correct docs page.

- [ ] **Step 4: Commit**

```powershell
git add src/components/ServiceCard.tsx src/app/(site)/services/page.tsx
git commit -m "feat: services page — inventory-driven card grid with doc links"
```

---

### Task 8: Architecture Page

**Files:**
- Create: `src/components/VmidBandDiagram.tsx`
- Create: `src/app/(site)/architecture/page.tsx`

**Interfaces:**
- Consumes: `getInventory()` — uses `nodes`, `vmid_bands`, `hardware`, `overlay`
- Produces: `/architecture` route

- [ ] **Step 1: Create src/components/VmidBandDiagram.tsx**

```typescript
// src/components/VmidBandDiagram.tsx
import type { ServiceNode, VmidBand } from '@/lib/inventory';

interface Props {
  nodes: ServiceNode[];
  bands: VmidBand[];
}

const BAND_COLORS: Record<string, { bg: string; border: string; text: string; dim: string }> = {
  'core-network':            { bg: '#0c1a3d', border: '#3b82f6', text: '#93c5fd', dim: '#1e3a5f' },
  'automation-utilities':    { bg: '#1a0f2e', border: '#a855f7', text: '#d8b4fe', dim: '#2e1a47' },
  'specialized-controllers': { bg: '#2c1500', border: '#f59e0b', text: '#fcd34d', dim: '#451a03' },
  'media-streaming':         { bg: '#031a0f', border: '#22c55e', text: '#86efac', dim: '#052e16' },
  'sandboxes-testing':       { bg: '#0f172a', border: '#475569', text: '#94a3b8', dim: '#1e293b' },
};

function parseRange(r: string): [number, number] {
  const [s, e] = r.split('-').map(Number);
  return [s, e];
}

export function VmidBandDiagram({ nodes, bands }: Props) {
  const PX = 4;

  return (
    <div className="flex gap-6 font-mono text-xs min-w-[480px]">
      {/* VMID axis */}
      <div className="flex flex-col shrink-0 text-[#475569] text-[10px] text-right" style={{ paddingTop: 0 }}>
        {bands.map((band) => {
          const [s, e] = parseRange(band.range);
          return (
            <div key={band.id} style={{ height: (e - s + 1) * PX }} className="flex items-start justify-end pr-1">
              {s}
            </div>
          );
        })}
        <div className="text-[10px] text-[#475569] pr-1">199</div>
      </div>

      {/* Band blocks with service slots */}
      <div className="flex flex-col shrink-0" style={{ width: '40px' }}>
        {bands.map((band) => {
          const [s, e] = parseRange(band.range);
          const c = BAND_COLORS[band.id] ?? BAND_COLORS['sandboxes-testing'];
          const bandNodes = nodes.filter((n) => n.band === band.id);
          return (
            <div
              key={band.id}
              className="relative"
              style={{
                height: (e - s + 1) * PX,
                backgroundColor: c.bg,
                borderLeft: `3px solid ${c.border}`,
              }}
            >
              {bandNodes.map((node) => (
                <div
                  key={node.vmid}
                  className="absolute left-0 right-0"
                  style={{
                    top: (node.vmid - s) * PX,
                    height: PX,
                    backgroundColor: c.border,
                    opacity: 0.9,
                  }}
                  title={`CT ${node.vmid}: ${node.name}`}
                />
              ))}
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex flex-col flex-1">
        {bands.map((band) => {
          const [s, e] = parseRange(band.range);
          const height = (e - s + 1) * PX;
          const c = BAND_COLORS[band.id] ?? BAND_COLORS['sandboxes-testing'];
          const bandNodes = nodes.filter((n) => n.band === band.id);
          return (
            <div
              key={band.id}
              className="flex flex-col justify-center gap-0.5 pl-3 border-b border-[#1e293b]/50 last:border-0 py-1"
              style={{ minHeight: Math.max(height, 72) }}
            >
              <p className="font-semibold text-xs" style={{ color: c.text }}>{band.label}</p>
              <p className="text-[10px]" style={{ color: c.border }}>
                VMIDs {band.range} · {band.isolation}
              </p>
              <p className="text-[10px] text-[#475569]">{band.purpose}</p>
              {bandNodes.map((node) => (
                <p key={node.vmid} className="text-[10px]" style={{ color: c.border }}>
                  ▸ CT {node.vmid} — {node.name}{' '}
                  <span className="text-[#475569]">({node.ip})</span>
                </p>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create src/app/(site)/architecture/page.tsx**

```typescript
// src/app/(site)/architecture/page.tsx
import { getInventory } from '@/lib/inventory';
import { VmidBandDiagram } from '@/components/VmidBandDiagram';

export const metadata = { title: 'Architecture — JaySync-Lab' };

export default function ArchitecturePage() {
  const { hardware, nodes, overlay, vmid_bands } = getInventory();
  const router   = hardware.find((h) => h.id === 'proxmox-host') ? hardware.find((h) => h.id === 'zte-router') : hardware[0];
  const proxmox  = hardware.find((h) => h.id === 'proxmox-host');
  const tailscale = overlay[0];

  const physicalNodes = [
    { label: router?.name ?? 'Router',    ip: router?.ip,    role: router?.role,    color: '#475569' },
    { label: proxmox?.name ?? 'Proxmox',  ip: proxmox?.ip,   role: proxmox?.role,   color: '#3b82f6' },
    { label: tailscale?.name ?? 'VPN',    ip: tailscale?.ip, role: tailscale?.role, color: '#a855f7' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="font-mono text-[#38bdf8] text-[10px] uppercase tracking-widest mb-3">Infrastructure</p>
        <h1 className="text-3xl font-bold text-[#e2e8f0]">Architecture</h1>
        <p className="text-[#64748b] mt-3 max-w-lg text-sm leading-relaxed">
          VMID bands partition the 100–199 allocation space into functional layers.
          Active containers are shown at their assigned VMID slot.
        </p>
      </div>

      {/* Physical layer */}
      <section className="mb-16">
        <p className="font-mono text-[#475569] text-[10px] uppercase tracking-widest mb-5">Physical Layer</p>
        <div className="flex flex-wrap gap-4">
          {physicalNodes.map((node) => (
            <div
              key={node.label}
              className="border rounded-lg p-4 bg-[#0f172a] font-mono text-xs"
              style={{ borderColor: node.color }}
            >
              <p className="font-semibold text-[#e2e8f0] text-sm mb-1">{node.label}</p>
              <p style={{ color: node.color }}>{node.ip}</p>
              <p className="text-[#475569] mt-1 text-[11px] max-w-[200px]">{node.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VMID band diagram */}
      <section>
        <p className="font-mono text-[#475569] text-[10px] uppercase tracking-widest mb-5">
          VMID Band Allocation — 100 to 199
        </p>
        <div className="overflow-x-auto">
          <VmidBandDiagram nodes={nodes} bands={vmid_bands} />
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Verify architecture page**

Navigate to `http://localhost:3000/architecture`. Expected:
- Three physical layer cards: Router (grey border), Proxmox (blue border), Tailscale (purple border)
- VMID band diagram with 5 colored sections from top (100-119 blue) to bottom (180-199 grey)
- Active service slots highlighted at their VMID within each band

- [ ] **Step 4: Commit**

```powershell
git add src/components/VmidBandDiagram.tsx src/app/(site)/architecture/page.tsx
git commit -m "feat: architecture page with VMID band diagram and physical layer"
```

---

### Task 9: Changelog Page

**Files:**
- Create: `src/components/Timeline.tsx`
- Create: `src/app/(site)/changelog/page.tsx`

**Interfaces:**
- Consumes: `getChangelog(): ChangelogEntry[]` from `@/lib/changelog`
- Produces: `/changelog` route — vertical timeline, most recent first

- [ ] **Step 1: Create src/components/Timeline.tsx**

```typescript
// src/components/Timeline.tsx
import type { ChangelogEntry } from '@/lib/changelog';

interface Props {
  entries: ChangelogEntry[];
}

export function Timeline({ entries }: Props) {
  return (
    <ol className="relative border-l-2 border-[#1e293b] ml-3">
      {entries.map((entry, i) => (
        <li key={entry.label} className="mb-12 ml-8 last:mb-0">
          {/* Timeline dot */}
          <span
            className="absolute flex items-center justify-center w-3 h-3 rounded-full -left-[7px]"
            style={{
              backgroundColor: i === 0 ? '#38bdf8' : '#1e293b',
              border: `2px solid ${i === 0 ? '#38bdf8' : '#334155'}`,
              top: '4px',
            }}
          />

          {/* Date */}
          <time className="block font-mono text-[10px] text-[#475569] uppercase tracking-wider mb-3">
            {entry.label}
          </time>

          {/* Bullet items */}
          <ul className="space-y-2">
            {entry.entries.map((item, j) => (
              <li key={j} className="text-[#cbd5e1] text-sm leading-relaxed flex gap-2 items-start">
                <span className="text-[#38bdf8] shrink-0 mt-0.5 text-xs">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 2: Create src/app/(site)/changelog/page.tsx**

```typescript
// src/app/(site)/changelog/page.tsx
import { getChangelog } from '@/lib/changelog';
import { Timeline } from '@/components/Timeline';

export const metadata = { title: 'Changelog — JaySync-Lab' };

export default function ChangelogPage() {
  const entries = getChangelog();
  const latestDate = entries.find((e) => e.date !== null)?.date;

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="font-mono text-[#38bdf8] text-[10px] uppercase tracking-widest mb-3">
          Last updated {latestDate ?? 'recently'}
        </p>
        <h1 className="text-3xl font-bold text-[#e2e8f0]">Changelog</h1>
        <p className="text-[#64748b] mt-3 text-sm leading-relaxed">
          Infrastructure changes, new containers, and configuration updates.
          Entries before 2026-06-17 are reconstructed from git history.
        </p>
      </div>

      <Timeline entries={entries} />
    </div>
  );
}
```

- [ ] **Step 3: Verify changelog page**

Navigate to `http://localhost:3000/changelog`. Expected:
- Left border timeline, most recent date at top with blue dot
- Each date group: date label in small caps, bullet entries with `▸` prefix
- "Earlier (reconstructed)" group at bottom

- [ ] **Step 4: Commit**

```powershell
git add src/components/Timeline.tsx src/app/(site)/changelog/page.tsx
git commit -m "feat: changelog page with vertical timeline from parsed markdown"
```

---

### Task 10: Live Status Badge

**Files:**
- Create: `src/components/StatusBadge.tsx` — `'use client'` component
- Modify: `src/components/ServiceCard.tsx` — import and render StatusBadge
- Create: `.env.local` — placeholder env var

**Interfaces:**
- Consumes: `process.env.NEXT_PUBLIC_UPTIME_KUMA_STATUS_URL` (string or undefined)
- Consumes: Uptime Kuma public status JSON at `{baseUrl}/api/status-page/default` and `{baseUrl}/api/status-page/heartbeat/default`
- Produces: `<StatusBadge monitorName="Pi-hole" />` — pulsing dot + "Xs ago" or null if env unset

**Uptime Kuma API shape (v1 status-page endpoints):**
```
GET {baseUrl}/api/status-page/default
→ { publicGroupList: [{ monitorList: [{ id: number, name: string }] }] }

GET {baseUrl}/api/status-page/heartbeat/default
→ { heartbeatList: { [monitorId: string]: Array<{ status: 0|1, time: string }> } }
```

- [ ] **Step 1: Create .env.local**

```powershell
# In jaysync-lab-site root
@'
NEXT_PUBLIC_UPTIME_KUMA_STATUS_URL=
'@ | Out-File -Encoding utf8 .env.local
```

Verify `.env.local` is already in `.gitignore` (Fumadocs scaffold adds it). If not:
```powershell
Add-Content .gitignore "`n.env.local"
```

- [ ] **Step 2: Create src/components/StatusBadge.tsx**

```typescript
// src/components/StatusBadge.tsx
'use client';

import { useEffect, useState } from 'react';

type StatusValue = 'up' | 'down' | 'unknown';

interface Props {
  monitorName: string;
}

interface MonitorEntry {
  id: number;
  name: string;
}

interface StatusPageResponse {
  publicGroupList: Array<{ monitorList: MonitorEntry[] }>;
}

interface HeartbeatEntry {
  status: 0 | 1;
  time: string;
}

interface HeartbeatResponse {
  heartbeatList: Record<string, HeartbeatEntry[]>;
}

async function fetchMonitorStatus(
  baseUrl: string,
  monitorName: string,
): Promise<{ status: StatusValue; checkedAt: Date | null }> {
  try {
    const [pageRes, hbRes] = await Promise.all([
      fetch(`${baseUrl}/api/status-page/default`),
      fetch(`${baseUrl}/api/status-page/heartbeat/default`),
    ]);
    if (!pageRes.ok || !hbRes.ok) return { status: 'unknown', checkedAt: null };

    const page: StatusPageResponse = await pageRes.json();
    const hb: HeartbeatResponse = await hbRes.json();

    let monitorId: number | null = null;
    for (const group of page.publicGroupList) {
      const match = group.monitorList.find((m) => m.name === monitorName);
      if (match) { monitorId = match.id; break; }
    }
    if (monitorId === null) return { status: 'unknown', checkedAt: null };

    const beats = hb.heartbeatList[String(monitorId)];
    if (!beats || beats.length === 0) return { status: 'unknown', checkedAt: null };

    const latest = beats[beats.length - 1];
    return {
      status: latest.status === 1 ? 'up' : 'down',
      checkedAt: new Date(latest.time),
    };
  } catch {
    return { status: 'unknown', checkedAt: null };
  }
}

function timeAgo(date: Date): string {
  const secs = Math.floor((Date.now() - date.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

const DOT: Record<StatusValue, { color: string; pulse: boolean; label: string }> = {
  up:      { color: '#22c55e', pulse: false, label: 'up' },
  down:    { color: '#ef4444', pulse: true,  label: 'down' },
  unknown: { color: '#475569', pulse: false, label: 'unknown' },
};

export function StatusBadge({ monitorName }: Props) {
  const [status, setStatus] = useState<StatusValue>('unknown');
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_UPTIME_KUMA_STATUS_URL;

  useEffect(() => {
    if (!baseUrl) { setLoading(false); return; }
    fetchMonitorStatus(baseUrl, monitorName).then(({ status: s, checkedAt: t }) => {
      setStatus(s);
      setCheckedAt(t);
      setLoading(false);
    });
  }, [baseUrl, monitorName]);

  if (!baseUrl) return null;

  const dot = DOT[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px]"
      aria-label={`Status: ${dot.label}`}
      title={`${monitorName}: ${dot.label}${checkedAt ? ` · checked ${timeAgo(checkedAt)}` : ''}`}
    >
      {loading ? (
        <span className="w-2 h-2 rounded-full bg-[#334155] motion-safe:animate-pulse" />
      ) : (
        <span
          className={dot.pulse ? 'w-2 h-2 rounded-full motion-safe:animate-ping' : 'w-2 h-2 rounded-full'}
          style={{ backgroundColor: dot.color }}
        />
      )}
      <span className="text-[#475569]">
        {loading ? '…' : checkedAt ? timeAgo(checkedAt) : dot.label}
      </span>
    </span>
  );
}
```

- [ ] **Step 3: Wire StatusBadge into ServiceCard.tsx**

Edit `src/components/ServiceCard.tsx`. Add import at the top:

```typescript
import { StatusBadge } from './StatusBadge';
```

Replace `<div data-status-slot={node.status_name} />` with:

```typescript
<StatusBadge monitorName={node.status_name} />
```

- [ ] **Step 4: Verify graceful no-URL behavior**

With `NEXT_PUBLIC_UPTIME_KUMA_STATUS_URL=` (empty) in `.env.local`, navigate to `http://localhost:3000/services`. Expected: service cards render normally with no status dots (StatusBadge returns null when env var is unset). No console errors.

- [ ] **Step 5: Verify reduced-motion compliance**

In browser DevTools → Rendering → Emulate CSS media feature → `prefers-reduced-motion: reduce`. Navigate to `/services`. If a real Uptime Kuma URL is set, the dot should appear without animation. The `motion-safe:` prefix ensures animations only run when the user hasn't requested reduced motion.

- [ ] **Step 6: Commit**

```powershell
git add src/components/StatusBadge.tsx src/components/ServiceCard.tsx .env.local .gitignore
git commit -m "feat: live StatusBadge with Uptime Kuma integration, motion-safe animations"
```

---

### Task 11: Mobile Responsive & Accessibility Pass

**Files:**
- Modify: `src/app/(site)/architecture/page.tsx` — overflow-x-auto wrapper
- Verify: `src/app/(site)/page.tsx` — grid already `grid-cols-1 lg:grid-cols-2`
- Verify: `src/components/Nav.tsx` — already has `overflow-x-auto`
- Final: run build, fix any TypeScript errors

**Interfaces:**
- No new exports — polish and verification only

- [ ] **Step 1: Verify homepage is single-column on mobile**

Open browser DevTools, set viewport to 375px wide. Confirm:
- Hero is single column (diagram below text)
- Stat bar is 2-column (already `grid-cols-2`)
- VMID rack scrolls horizontally

If diagram overflows at 375px, add `overflow-x-hidden` to its container div in `page.tsx`.

- [ ] **Step 2: Verify keyboard navigation across all pages**

On each of `/`, `/services`, `/architecture`, `/changelog`: press Tab to cycle through all interactive elements. Each must show a visible focus ring (blue outline). Check:
- Nav wordmark link
- Nav Docs/Services/Architecture/Changelog links
- Hero "View Services" button
- Hero "Browse Docs" button
- Service card "View docs →" links

If any element is missing a ring, add `focus:outline-none focus-visible:ring-2 focus-visible:ring-[#38bdf8] rounded` to it.

- [ ] **Step 3: Run final build**

```powershell
npm run build
```

Expected: build completes with exit code 0. Any TypeScript error is a blocker — fix it before proceeding. Warnings about missing MDX frontmatter `title` fields are acceptable.

- [ ] **Step 4: Fix any build errors**

Common issues and fixes:
- `Cannot find module '@/lib/source'` → check `src/lib/source.ts` exists and exports `source`
- `Type error: Property 'body' does not exist on type` → add `page.data.body` type assertion or check Fumadocs version compat
- `TS2739: ... missing properties` → verify interface fields match inventory.yaml actual field names

- [ ] **Step 5: Commit**

```powershell
git add -A
git commit -m "chore: mobile responsive and accessibility pass, build verified"
```

---

## Self-Review Against Spec

**Spec coverage:**

| Requirement | Task |
|---|---|
| `inventory.yaml` created in JaySync-Lab | Task 1 |
| Build-time inventory loader, typed TS interfaces | Task 2 |
| Build-time changelog parser, dated groups, sorted | Task 3 |
| Fumadocs serves all `content/` .md files with sidebar | Task 4 |
| Homepage: real data, concrete/specific, not generic hero | Task 6 |
| Homepage: network topology diagram (Router→Proxmox→services) | Task 6 |
| Services page: grid from `nodes[]`, vmid/type/ip/role/docs link | Task 7 |
| Architecture page: VMID band diagram, colored zones 100-199 | Task 8 |
| Architecture page: hardware + overlay nodes shown | Task 8 |
| Changelog page: vertical timeline, most recent first | Task 9 |
| `StatusBadge`: fetch Uptime Kuma, match by `status_name` | Task 10 |
| `StatusBadge`: pulsing dot + "checked Xs ago" | Task 10 |
| `StatusBadge`: never crash, graceful failure | Task 10 |
| `StatusBadge`: loading state | Task 10 |
| Mobile responsive | Task 11 |
| Keyboard focus states on all interactive elements | Task 11 |
| `prefers-reduced-motion` respected | Task 10 Step 2, Task 11 Step 2 |
| Design: not generic, homelab-specific, self-critiqued | Task 5 |
| Design: VMID rack as signature visual element | Task 6 |
| Individual doc pages with search and sidebar | Task 4 |

**Placeholder scan:** No TBD, TODO, or "similar to Task N" patterns. All code blocks contain complete implementations. ✓

**Type consistency:**
- `ServiceNode.band` (string) → used as key in `BAND_COLORS` Record — ✓
- `VmidBand.range` (string "100-119") → parsed by `parseRange()` in both `VmidRack` and `VmidBandDiagram` — ✓
- `getChangelog(): ChangelogEntry[]` → `Timeline` receives `entries: ChangelogEntry[]` — ✓
- `StatusBadge` prop `monitorName: string` → `ServiceCard` passes `node.status_name` (string) — ✓
- `source.getPage(slug)` → standard Fumadocs API, matches `loader()` return type — ✓
- `LabDiagram` receives `nodes: ServiceNode[]` → `getInventory().nodes` — ✓

**Gaps addressed:**
- `inventory.yaml` missing from JaySync-Lab → created in Task 1 Step 1 ✓
- Default scaffold `src/app/page.tsx` conflicts with `(site)/page.tsx` → deleted in Task 5 Step 5 ✓
- Fumadocs `src/lib/source.ts` may differ between scaffold versions → Task 4 Step 3 says verify and replace if needed ✓
- Tailwind v3 vs v4 uncertainty → Task 5 Step 2 includes both paths ✓
