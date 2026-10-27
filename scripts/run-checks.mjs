#!/usr/bin/env node
/**
 * Vérifications déterministes = les « tranches de gruyère » automatiques.
 *
 *   node scripts/run-checks.mjs            → vérifications rapides (stop hook)
 *   node scripts/run-checks.mjs --full     → + tests unitaires + build
 *   node scripts/run-checks.mjs --quiet    → une ligne par étape, sortie détaillée
 *                                            uniquement pour les étapes en échec
 *                                            (économise des tokens quand un agent l'exécute)
 *
 * Utilisable en CLI, en CI, et depuis les adaptateurs de stop hooks.
 *
 * Les commandes elles-mêmes sont définies UNE SEULE FOIS, dans les scripts npm de
 * package.json. Ce fichier ne fait qu'orchestrer ces scripts et ajoute ce qu'une
 * simple chaîne `a && b && c` ne sait pas faire :
 *   - exécuter TOUTES les étapes, même après un échec (rapport complet en un seul tour) ;
 *   - capturer la sortie et produire un message court pour l'agent (--quiet, stop hooks).
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

/** Chaque étape = un script npm de package.json. */
export const FAST_STEPS = [
  { name: 'Sheriff (frontières de modules)', script: 'sheriff:verify' },
  { name: 'ESLint (+ plugin Sheriff)', script: 'lint' },
  { name: 'Tests d\'architecture (ArchUnitTS)', script: 'test:arch' },
];

export const SLOW_STEPS = [
  { name: 'Tests unitaires', script: 'test' },
  { name: 'Build', script: 'build' },
];

/**
 * @param {{ full?: boolean, capture?: boolean }} options
 * @returns {{ ok: boolean, failures: { name: string, output: string }[] }}
 */
export function runChecks({ full = false, capture = false } = {}) {
  const steps = full ? [...FAST_STEPS, ...SLOW_STEPS] : FAST_STEPS;
  const failures = [];

  for (const step of steps) {
    if (!capture) console.log(`\n▶ ${step.name}  (npm run ${step.script})`);
    // --silent : masque l'en-tête « > flight-arch-demo@0.0.0 … » de npm.
    const result = spawnSync('npm', ['run', '--silent', step.script], {
      encoding: 'utf8',
      stdio: capture ? 'pipe' : 'inherit',
      env: { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1', CI: 'true' },
      shell: process.platform === 'win32',
    });
    if (result.status !== 0) {
      failures.push({
        name: step.name,
        output: capture ? `${result.stdout ?? ''}\n${result.stderr ?? ''}`.trim() : '',
      });
    }
  }
  return { ok: failures.length === 0, failures };
}

/** Garde les dernières lignes : les erreurs et résumés sont en fin de sortie. */
export function tail(text, maxLines = 60) {
  const lines = text.split('\n');
  return lines.length > maxLines
    ? `…(${lines.length - maxLines} lignes masquées)\n${lines.slice(-maxLines).join('\n')}`
    : text;
}

/** Message lisible renvoyé au modèle en cas d'échec (volontairement court). */
export function formatFailures(failures, maxLines = 60) {
  const text = failures
    .map((f) => `### Échec : ${f.name}\n${tail(f.output, maxLines)}`)
    .join('\n\n');
  return (
    'Les vérifications d\'architecture ont échoué. Corrige le code (sans modifier ' +
    'les règles d\'architecture ni la configuration Sheriff/ArchUnit) puis termine à nouveau.\n\n' +
    text
  );
}

// Exécution directe en CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const full = process.argv.includes('--full');
  const quiet = process.argv.includes('--quiet');
  const { ok, failures } = runChecks({ full, capture: quiet });

  if (quiet) {
    const steps = full ? [...FAST_STEPS, ...SLOW_STEPS] : FAST_STEPS;
    for (const step of steps) {
      const failed = failures.some((f) => f.name === step.name);
      console.log(`${failed ? '✗' : '✓'} ${step.name}`);
    }
    if (!ok) console.log(`\n${formatFailures(failures)}`);
  }

  console.log(
    ok
      ? '\n✅ Toutes les vérifications passent.'
      : `\n❌ ${failures.length} vérification(s) en échec : ${failures.map((f) => f.name).join(', ')}`,
  );
  process.exit(ok ? 0 : 1);
}
