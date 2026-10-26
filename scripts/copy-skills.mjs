#!/usr/bin/env node
/**
 * Copie les skills du dossier canonique `.agents/skills` (standard multi-agents)
 * vers `.claude/skills` (emplacement lu par Claude Code).
 * Copie plutôt que liens symboliques : plus robuste sous Windows / Git Bash.
 * Lancé automatiquement par `npm install` (script « prepare »).
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from 'node:fs';

const SOURCE = '.agents/skills';
const TARGET = '.claude/skills';

if (!existsSync(SOURCE)) process.exit(0);
mkdirSync(TARGET, { recursive: true });
for (const skill of readdirSync(SOURCE)) {
  cpSync(`${SOURCE}/${skill}`, `${TARGET}/${skill}`, { recursive: true });
}
console.log(`Skills copiés : ${readdirSync(SOURCE).join(', ')} → ${TARGET}`);
