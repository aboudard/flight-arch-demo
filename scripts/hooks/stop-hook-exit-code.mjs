#!/usr/bin/env node
/**
 * Adaptateur de stop hook — contrat « code de sortie » (Claude Code, Codex).
 *
 *   succès → exit 0
 *   échec  → exit 2 + message sur STDERR (renvoyé au modèle, qui reprend la main)
 *
 * Garde-fou anti-boucle infinie : au-delà de MAX_ATTEMPTS échecs consécutifs,
 * on laisse l'agent s'arrêter et on signale le problème à l'humain.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { formatFailures, runChecks } from '../run-checks.mjs';

const MAX_ATTEMPTS = 3;
const COUNTER_DIR = 'node_modules/.cache/stop-hook';
const COUNTER_FILE = `${COUNTER_DIR}/attempts`;

// Le payload JSON envoyé par l'agent sur stdin n'est pas nécessaire ici,
// mais on le consomme pour ne pas bloquer le pipe.
try {
  readFileSync(0, 'utf8');
} catch {
  /* pas de stdin */
}

const { ok, failures } = runChecks({ full: false, capture: true });

if (ok) {
  rmSync(COUNTER_FILE, { force: true });
  process.exit(0);
}

const attempts = existsSync(COUNTER_FILE) ? Number(readFileSync(COUNTER_FILE, 'utf8')) + 1 : 1;
mkdirSync(COUNTER_DIR, { recursive: true });
writeFileSync(COUNTER_FILE, String(attempts));

if (attempts > MAX_ATTEMPTS) {
  rmSync(COUNTER_FILE, { force: true });
  console.error(
    `Les vérifications échouent encore après ${MAX_ATTEMPTS} tentatives : ` +
      'arrêt de la boucle, intervention humaine requise.',
  );
  process.exit(0);
}

console.error(formatFailures(failures));
process.exit(2);
