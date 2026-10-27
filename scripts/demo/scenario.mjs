#!/usr/bin/env node
/**
 * Introduit (puis annule) des violations volontaires pour la démo.
 *
 *   node scripts/demo/scenario.mjs break-domain   ticketing importe luggage (Sheriff)
 *   node scripts/demo/scenario.mjs break-api      luggage contourne l'API publique de ticketing (Sheriff)
 *   node scripts/demo/scenario.mjs break-layer    un composant UI injecte un store (Sheriff + ArchUnit)
 *   node scripts/demo/scenario.mjs break-naming   coordinator renommé en store (ArchUnit)
 *   node scripts/demo/scenario.mjs reset          restaure les fichiers d'origine
 */
import { cpSync, existsSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';

const BACKUP = '.demo-backup';
const SRC = 'src/app';
const T = `${SRC}/domains/ticketing`;

function backup() {
  if (!existsSync(BACKUP)) cpSync(SRC, BACKUP, { recursive: true });
}

function edit(file, from, to) {
  const content = readFileSync(file, 'utf8');
  if (!content.includes(from)) throw new Error(`Motif introuvable dans ${file}`);
  writeFileSync(file, content.replace(from, to));
  console.log(`✏️  ${file}`);
}

const scenarios = {
  'break-domain'() {
    const file = `${T}/feature-booking/flight-search/flight-search.ts`;
    edit(
      file,
      "import { FlightStore } from '../flight-store';",
      "import { FlightStore } from '../flight-store';\n" +
        "// ❌ Violation : le domaine ticketing accède directement au domaine luggage\n" +
        "import { Luggage } from '../../../luggage/data/luggage';",
    );
    edit(
      file,
      'protected readonly store = inject(FlightStore);',
      'protected readonly store = inject(FlightStore);\n  protected readonly lastLuggage: Luggage | null = null;',
    );
  },
  'break-api'() {
    // Même fonction, même comportement : seul le chemin d'import change.
    // Sheriff refuse car luggage atteint un dossier interne de ticketing (type:util)
    // au lieu de passer par son API publique (type:api).
    edit(
      `${SRC}/domains/luggage/feature-luggage/luggage-list-page.ts`,
      "import { formatRoute } from '../../ticketing/api/ticketing-api';",
      "// ❌ Violation : contourne l'API publique du domaine ticketing\n" +
        "import { formatRoute } from '../../ticketing/util-format/format-route';",
    );
  },
  'break-layer'() {
    const file = `${T}/ui-flight/flight-card.ts`;
    edit(
      file,
      "import { Component, input, model } from '@angular/core';",
      "import { Component, inject, input, model } from '@angular/core';\n" +
        "// ❌ Violation : un composant UI (dumb) dépend d'une feature et d'un store\n" +
        "import { FlightStore } from '../feature-booking/flight-store';",
    );
    edit(
      file,
      'readonly item = input.required<Flight>();',
      'readonly item = input.required<Flight>();\n  protected readonly store = inject(FlightStore);',
    );
  },
  'break-naming'() {
    const dir = `${T}/feature-booking/booking-summary`;
    renameSync(`${dir}/booking-summary-coordinator.ts`, `${dir}/booking-summary-store.ts`);
    console.log(`🔀 ${dir}/booking-summary-coordinator.ts → booking-summary-store.ts`);
    edit(`${dir}/booking-summary-page.ts`, "'./booking-summary-coordinator'", "'./booking-summary-store'");
  },
  reset() {
    if (!existsSync(BACKUP)) {
      console.log('Rien à restaurer.');
      return;
    }
    rmSync(SRC, { recursive: true, force: true });
    cpSync(BACKUP, SRC, { recursive: true });
    rmSync(BACKUP, { recursive: true, force: true });
    console.log('♻️  Fichiers d\'origine restaurés.');
  },
};

const name = process.argv[2];
if (!scenarios[name]) {
  console.error(`Scénario inconnu. Choix : ${Object.keys(scenarios).join(', ')}`);
  process.exit(1);
}
if (name !== 'reset') backup();
scenarios[name]();
