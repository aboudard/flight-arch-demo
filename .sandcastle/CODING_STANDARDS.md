# Coding Standards

Le reviewer charge ce fichier pendant la revue (via @.sandcastle/CODING_STANDARDS.md).

## Architecture

- Respecter `docs/architecture/boundaries.md` (verticales, couches, localité, API de domaine).
- Respecter `docs/architecture/state-management.md` (suffixes -page/-search/-edit, -store, -client, -coordinator).
- Ne rien ajouter à `domains/shared` sans décision explicite consignée dans le ticket.
- Ne jamais modifier `sheriff.config.ts`, `architecture/**`, `docs/architecture/**`.

## Style

- Angular moderne : standalone, signals, `input()`/`output()`, control flow natif (`@if`, `@for`).
- `inject()` plutôt que l'injection par constructeur.
- Commenter le pourquoi, pas le quoi.

## Tests

- Chaque critère d'acceptation testable est couvert par un test unitaire.
- `npm run check:full:quiet` doit passer.
