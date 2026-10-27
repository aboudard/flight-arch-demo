// Parallel Planner with Review — boucle AFK (template Sandcastle, adapté au projet)
//
//   Phase 1 (Plan)             : un agent lit les tickets `ready`, construit le graphe de
//                                dépendances et renvoie un <plan> JSON des tickets débloqués.
//   Phase 2 (Implement+Review) : pour chaque ticket, une sandbox Docker + un worktree/branche.
//                                L'implémenteur travaille, puis un relecteur (nouvelle session)
//                                revoit le diff dans la même sandbox.
//   Phase 3 (Merge)            : un agent fusionne les branches qui ont produit des commits.
//
// Usage (depuis WSL / Linux / macOS, Docker requis) :
//   npm run sandcastle                 → boucle complète
//   npm run sandcastle:smoke           → un seul tour, ticket 002 uniquement (test de coût)
//   npx tsx .sandcastle/main.mts --only=001,002
//
// Maîtrise des tokens (voir docs/run-sandcastle-wsl.md) :
//   - plafonds d'itérations bas (MAX_ROUNDS, IMPLEMENTER_MAX_ITERATIONS) ;
//   - un modèle par rôle, surchargeable par variables d'environnement ;
//   - rapport de consommation par session en fin de run (.sandcastle/logs/usage-report.json).

import * as sandcastle from "@ai-hero/sandcastle";
import { docker } from "@ai-hero/sandcastle/sandboxes/docker";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";

const planSchema = z.object({
  issues: z.array(
    z.object({ id: z.string(), title: z.string(), branch: z.string() }),
  ),
});

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Modèles par rôle. L'implémentation est la phase qui bénéficie le plus d'un
// modèle fort ; planification, relecture et fusion sont des tâches plus courtes.
// Surcharge possible : SANDCASTLE_IMPLEMENTER_MODEL=... npm run sandcastle
const MODELS = {
  planner: process.env.SANDCASTLE_PLANNER_MODEL ?? "claude-sonnet-4-6",
  implementer: process.env.SANDCASTLE_IMPLEMENTER_MODEL ?? "claude-opus-4-8",
  reviewer: process.env.SANDCASTLE_REVIEWER_MODEL ?? "claude-sonnet-4-6",
  merger: process.env.SANDCASTLE_MERGER_MODEL ?? "claude-sonnet-4-6",
};

// Nombre maximal de tours plan → implement → merge.
// 3 suffisent pour le backlog de démo (001+002, puis 003, puis arrêt).
const MAX_ROUNDS = Number(process.env.SANDCASTLE_MAX_ROUNDS ?? 3);

// Une « itération » = un NOUVEAU lancement de l'agent, qui relit tout son contexte.
// Normalement 1 ou 2 suffisent ; le template proposait 100, ce qui expose à une
// consommation très élevée si l'agent n'émet jamais <promise>COMPLETE</promise>.
const IMPLEMENTER_MAX_ITERATIONS = Number(
  process.env.SANDCASTLE_IMPLEMENTER_MAX_ITERATIONS ?? 5,
);

// --only=002,003 : ne traiter que ces tickets, et un seul tour (test de coût).
const onlyArg = process.argv.find((a) => a.startsWith("--only="));
const ONLY = onlyArg ? onlyArg.slice("--only=".length).split(",").map((s) => s.trim()) : null;

const hooks = {
  sandbox: { onSandboxReady: [{ command: "npm install --no-audit --no-fund" }] },
};

const copyToWorktree = ["node_modules"];

// ---------------------------------------------------------------------------
// Rapport de consommation
// ---------------------------------------------------------------------------

type Usage = { input: number; cacheWrite: number; cacheRead: number; output: number };
type UsageEntry = Usage & { session: string; iterations: number };
const usageReport: UsageEntry[] = [];

// Additionne l'usage de chaque message assistant du fichier de session Claude
// (JSONL capturé sur l'hôte). Les messages répétés (même id) ne comptent qu'une fois.
function sumSessionUsage(file: string | undefined): Usage {
  const total: Usage = { input: 0, cacheWrite: 0, cacheRead: 0, output: 0 };
  if (!file || !existsSync(file)) return total;
  const seen = new Set<string>();
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    let entry: any;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const message = entry?.message;
    const usage = message?.usage;
    if (entry?.type !== "assistant" || !usage) continue;
    const id = message.id ?? entry.uuid;
    if (id && seen.has(id)) continue;
    if (id) seen.add(id);
    total.input += usage.input_tokens ?? 0;
    total.cacheWrite += usage.cache_creation_input_tokens ?? 0;
    total.cacheRead += usage.cache_read_input_tokens ?? 0;
    total.output += usage.output_tokens ?? 0;
  }
  return total;
}

function recordUsage(
  session: string,
  result: { iterations: { sessionFilePath?: string }[] },
): void {
  const entry: UsageEntry = {
    session,
    iterations: result.iterations.length,
    input: 0,
    cacheWrite: 0,
    cacheRead: 0,
    output: 0,
  };
  for (const iteration of result.iterations) {
    const u = sumSessionUsage(iteration.sessionFilePath);
    entry.input += u.input;
    entry.cacheWrite += u.cacheWrite;
    entry.cacheRead += u.cacheRead;
    entry.output += u.output;
  }
  usageReport.push(entry);
}

function printUsageReport(): void {
  if (usageReport.length === 0) return;
  const fmt = (n: number) => n.toLocaleString("fr-FR");
  console.log("\n=== Consommation de tokens par session ===");
  console.table(
    usageReport.map((e) => ({
      session: e.session,
      iterations: e.iterations,
      input: fmt(e.input),
      "cache write": fmt(e.cacheWrite),
      "cache read": fmt(e.cacheRead),
      output: fmt(e.output),
    })),
  );
  const totals = usageReport.reduce(
    (acc, e) => ({
      input: acc.input + e.input,
      cacheWrite: acc.cacheWrite + e.cacheWrite,
      cacheRead: acc.cacheRead + e.cacheRead,
      output: acc.output + e.output,
    }),
    { input: 0, cacheWrite: 0, cacheRead: 0, output: 0 },
  );
  console.log(
    `Total : ${fmt(totals.input + totals.cacheWrite + totals.cacheRead)} tokens en entrée ` +
      `(dont ${fmt(totals.cacheRead)} lus depuis le cache), ${fmt(totals.output)} en sortie.`,
  );
  mkdirSync(".sandcastle/logs", { recursive: true });
  writeFileSync(
    ".sandcastle/logs/usage-report.json",
    JSON.stringify({ models: MODELS, sessions: usageReport, totals }, null, 2),
  );
  console.log("Détail : .sandcastle/logs/usage-report.json");
}

// ---------------------------------------------------------------------------
// Boucle principale
// ---------------------------------------------------------------------------

console.log("Modèles :", MODELS);
if (ONLY) console.log(`Mode ciblé : tickets ${ONLY.join(", ")} uniquement, un seul tour.`);

try {
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    console.log(`\n=== Tour ${round}/${MAX_ROUNDS} ===\n`);

    // Phase 1 : plan
    const plan = await sandcastle.run({
      hooks,
      sandbox: docker(),
      name: "planner",
      maxIterations: 1,
      agent: sandcastle.claudeCode(MODELS.planner),
      promptFile: "./.sandcastle/plan-prompt.md",
      output: sandcastle.Output.object({ tag: "plan", schema: planSchema }),
    });
    recordUsage(`planner (tour ${round})`, plan);

    const issues = ONLY
      ? plan.output.issues.filter((i) => ONLY.includes(i.id))
      : plan.output.issues;

    if (issues.length === 0) {
      console.log("Aucun ticket débloqué à traiter. Fin.");
      break;
    }

    console.log(`${issues.length} ticket(s) à traiter en parallèle :`);
    for (const issue of issues) {
      console.log(`  ${issue.id}: ${issue.title} → ${issue.branch}`);
    }

    // Phase 2 : implémentation + relecture
    const settled = await Promise.allSettled(
      issues.map(async (issue) => {
        const sandbox = await sandcastle.createSandbox({
          branch: issue.branch,
          sandbox: docker(),
          hooks,
          copyToWorktree,
        });

        try {
          const implement = await sandbox.run({
            name: "implementer",
            maxIterations: IMPLEMENTER_MAX_ITERATIONS,
            agent: sandcastle.claudeCode(MODELS.implementer),
            promptFile: "./.sandcastle/implement-prompt.md",
            promptArgs: {
              TASK_ID: issue.id,
              ISSUE_TITLE: issue.title,
              BRANCH: issue.branch,
            },
          });
          recordUsage(`implementer ${issue.id}`, implement);

          if (implement.commits.length > 0) {
            const review = await sandbox.run({
              name: "reviewer",
              maxIterations: 1,
              agent: sandcastle.claudeCode(MODELS.reviewer),
              promptFile: "./.sandcastle/review-prompt.md",
              promptArgs: { BRANCH: issue.branch },
            });
            recordUsage(`reviewer ${issue.id}`, review);

            return { ...review, commits: [...implement.commits, ...review.commits] };
          }

          return implement;
        } finally {
          await sandbox.close();
        }
      }),
    );

    for (const [i, outcome] of settled.entries()) {
      if (outcome.status === "rejected") {
        console.error(`  ✗ ${issues[i]!.id} (${issues[i]!.branch}) a échoué : ${outcome.reason}`);
      }
    }

    const completedIssues = settled
      .map((outcome, i) => ({ outcome, issue: issues[i]! }))
      .filter((e) => e.outcome.status === "fulfilled" && e.outcome.value.commits.length > 0)
      .map((e) => e.issue);
    const completedBranches = completedIssues.map((i) => i.branch);

    console.log(`\n${completedBranches.length} branche(s) avec des commits :`);
    for (const branch of completedBranches) console.log(`  ${branch}`);

    if (completedBranches.length > 0) {
      // Phase 3 : fusion
      const merge = await sandcastle.run({
        hooks,
        sandbox: docker(),
        name: "merger",
        maxIterations: 1,
        agent: sandcastle.claudeCode(MODELS.merger),
        promptFile: "./.sandcastle/merge-prompt.md",
        promptArgs: {
          BRANCHES: completedBranches.map((b) => `- ${b}`).join("\n"),
          ISSUES: completedIssues.map((i) => `- ${i.id}: ${i.title}`).join("\n"),
        },
      });
      recordUsage(`merger (tour ${round})`, merge);
      console.log("\nBranches fusionnées.");
    } else {
      console.log("Aucun commit produit : rien à fusionner.");
    }

    if (ONLY) break;
  }
} finally {
  printUsageReport();
}

console.log("\nTerminé.");
