#!/usr/bin/env node
/**
 * Adaptateur de stop hook — contrat « JSON applicatif » (famille Cursor, Antigravity…).
 *
 * Toujours exit 0 ; le verdict est un document JSON écrit sur STDOUT.
 *   succès → {}
 *   échec  → objet contenant la raison, renvoyée au modèle
 *
 * ⚠️ La structure exacte du JSON varie selon l'agent et ses versions :
 * adapter `toAgentResponse()` à la documentation de l'outil utilisé.
 */
import { readFileSync } from 'node:fs';
import { formatFailures, runChecks } from '../run-checks.mjs';

try {
  readFileSync(0, 'utf8');
} catch {
  /* pas de stdin */
}

function toAgentResponse(reason) {
  // Exemple générique, à adapter (ex. Cursor attend un `followup_message`).
  return { decision: 'block', reason, followup_message: reason };
}

const { ok, failures } = runChecks({ full: false, capture: true });
process.stdout.write(JSON.stringify(ok ? {} : toAgentResponse(formatFailures(failures))));
process.exit(0);
