#!/usr/bin/env node
/**
 * validate-docs.mjs
 *
 * Gate One validation for /docs. Runs with plain Node, no dependencies,
 * so this repo doesn't need a package.json / npm install step in CI just
 * to check four frontmatter fields.
 *
 * Checks:
 *  - every .mdx file under docs/ has valid frontmatter with the four
 *    required fields (title, description, status, icon-optional)
 *  - status is exactly "draft" or "published"
 *  - filenames are lowercase-kebab-case
 *  - every folder containing .mdx files has a meta.json next to it
 *
 * Exit code 0 = pass, 1 = fail (with details printed to stderr).
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

const DOCS_ROOT = 'docs';
const REQUIRED_FIELDS = ['title', 'description', 'status'];
const VALID_STATUS = ['draft', 'published'];
const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

let errors = [];

function walk(dir) {
  const entries = readdirSync(dir);
  const mdxFiles = entries.filter((e) => extname(e) === '.mdx');
  const hasSubdirs = entries.some((e) => statSync(join(dir, e)).isDirectory());

  if (mdxFiles.length > 0) {
    const metaPath = join(dir, 'meta.json');
    if (!existsSync(metaPath)) {
      errors.push(`${dir}: contains .mdx files but no meta.json`);
    } else {
      try {
        JSON.parse(readFileSync(metaPath, 'utf-8'));
      } catch (e) {
        errors.push(`${dir}/meta.json: invalid JSON (${e.message})`);
      }
    }
  }

  for (const file of mdxFiles) {
    validateMdx(join(dir, file));
  }

  if (hasSubdirs) {
    for (const entry of entries) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
      }
    }
  }
}

function validateMdx(filePath) {
  const name = basename(filePath, '.mdx');

  if (!KEBAB_CASE.test(name)) {
    errors.push(`${filePath}: filename must be lowercase-kebab-case (got "${name}")`);
  }

  const content = readFileSync(filePath, 'utf-8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!match) {
    errors.push(`${filePath}: missing frontmatter block`);
    return;
  }

  const frontmatter = {};
  for (const line of match[1].split('\n')) {
    const kv = line.replace(/\r$/, '').match(/^(\w+):\s*(.*)$/);
    if (kv) {
      let value = kv[2].trim();
      // strip surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      frontmatter[kv[1]] = value;
    }
  }

  for (const field of REQUIRED_FIELDS) {
    if (!frontmatter[field] || frontmatter[field].length === 0) {
      errors.push(`${filePath}: missing required frontmatter field "${field}"`);
    }
  }

  if (frontmatter.status && !VALID_STATUS.includes(frontmatter.status)) {
    errors.push(
      `${filePath}: invalid status "${frontmatter.status}" — must be "draft" or "published"`
    );
  }
}

if (!existsSync(DOCS_ROOT)) {
  console.error(`Error: "${DOCS_ROOT}" folder not found. Run this from the repo root.`);
  process.exit(1);
}

walk(DOCS_ROOT);

if (errors.length > 0) {
  console.error(`\n❌ Docs validation failed with ${errors.length} error(s):\n`);
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  console.error('');
  process.exit(1);
} else {
  console.log('✅ Docs validation passed — all frontmatter and meta.json files valid.');
  process.exit(0);
}
