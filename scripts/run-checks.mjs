#!/usr/bin/env node
/**
 * Vérifications déterministes = les « tranches de gruyère » automatiques.
 *
 *   node scripts/run-checks.mjs          → vérifications rapides (stop hook)
 *   node scripts/run-checks.mjs --full   → + tests unitaires + build
 *
 * Utilisable en CLI, en CI, et depuis les adaptateurs de stop hooks.
 */
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const FAST_STEPS = [
  { name: 'Sheriff (frontières de modules)', cmd: 'npx', args: ['sheriff', 'verify'] },
  { name: 'ESLint (+ plugin Sheriff)', cmd: 'npx', args: ['ng', 'lint'] },
  {
    name: 'Tests d\'architecture (ArchUnitTS)',
    cmd: 'npx',
    args: ['vitest', 'run', '--config', 'vitest.arch.config.mts'],
  },
];

export const SLOW_STEPS = [
  { name: 'Tests unitaires', cmd: 'npx', args: ['ng', 'test', '--watch=false'] },
  { name: 'Build', cmd: 'npx', args: ['ng', 'build'] },
];

/**
 * @param {{ full?: boolean, capture?: boolean }} options
 * @returns {{ ok: boolean, failures: { name: string, output: string }[] }}
 */
export function runChecks({ full = false, capture = false } = {}) {
  const steps = full ? [...FAST_STEPS, ...SLOW_STEPS] : FAST_STEPS;
  const failures = [];

  for (const step of steps) {
    if (!capture) console.log(`\n▶ ${step.name}`);
    const result = spawnSync(step.cmd, step.args, {
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

/** Message lisible renvoyé au modèle en cas d'échec. */
export function formatFailures(failures, maxChars = 6000) {
  const text = failures
    .map((f) => `### Échec : ${f.name}\n${f.output}`)
    .join('\n\n');
  return (
    'Les vérifications d\'architecture ont échoué. Corrige le code (sans modifier ' +
    'les règles d\'architecture ni la configuration Sheriff/ArchUnit) puis termine à nouveau.\n\n' +
    (text.length > maxChars ? `${text.slice(0, maxChars)}\n…(tronqué)` : text)
  );
}

// Exécution directe en CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const full = process.argv.includes('--full');
  const { ok, failures } = runChecks({ full });
  console.log(
    ok
      ? '\n✅ Toutes les vérifications passent.'
      : `\n❌ ${failures.length} vérification(s) en échec : ${failures.map((f) => f.name).join(', ')}`,
  );
  process.exit(ok ? 0 : 1);
}
