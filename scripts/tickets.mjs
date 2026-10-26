#!/usr/bin/env node
/**
 * Mini « issue tracker » basé sur le dossier tickets/ (pour Sandcastle).
 *
 *   node scripts/tickets.mjs list         → tickets `status: ready` en JSON
 *   node scripts/tickets.mjs view <ID>    → contenu d'un ticket
 *   node scripts/tickets.mjs close <ID>   → passe le ticket en `status: done`
 *
 * Format d'un ticket : front matter (id, title, status, depends_on) + markdown.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const DIR = 'tickets';

function load() {
  return readdirSync(DIR)
    .filter((f) => /^\d+.*\.md$/.test(f))
    .map((file) => {
      const raw = readFileSync(`${DIR}/${file}`, 'utf8');
      const [, front = '', body = ''] = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/) ?? [];
      const meta = Object.fromEntries(
        front.split('\n').map((l) => {
          const i = l.indexOf(':');
          return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
        }),
      );
      return { file, raw, id: meta.id, title: meta.title, status: meta.status, depends_on: meta.depends_on ?? '', body: body.trim() };
    });
}

function find(id) {
  const t = load().find((x) => x.id === id);
  if (!t) {
    console.error(`Ticket ${id} introuvable`);
    process.exit(1);
  }
  return t;
}

const [cmd, id] = process.argv.slice(2);
switch (cmd) {
  case 'list':
    console.log(
      JSON.stringify(
        load()
          .filter((t) => t.status === 'ready')
          .map(({ id, title, depends_on, body }) => ({ id, title, depends_on, body })),
        null,
        2,
      ),
    );
    break;
  case 'view':
    console.log(find(id).raw);
    break;
  case 'close': {
    const t = find(id);
    writeFileSync(`${DIR}/${t.file}`, t.raw.replace(/^status:.*$/m, 'status: done'));
    console.log(`Ticket ${id} fermé.`);
    break;
  }
  default:
    console.error('Usage : tickets.mjs list | view <ID> | close <ID>');
    process.exit(1);
}
