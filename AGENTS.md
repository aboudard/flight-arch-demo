# AGENTS.md

Application Angular de démonstration (réservation de vols) organisée en **verticales (domaines)**
et **feature slicing**. Ce fichier est volontairement court : les détails sont chargés à la demande
(*progressive disclosure*).

## Architecture — À LIRE SELON LA TÂCHE

- **Avant d'ajouter ou de déplacer un composant, un service d'accès aux données ou un helper** :
  lis `docs/architecture/boundaries.md`.
- **Avant toute modification touchant à l'état (stores, coordinators, NgRx Signal Store)** :
  lis `docs/architecture/state-management.md`.
- **Travail dans un domaine précis** : lis `docs/domains/<domaine>.md`
  (`ticketing`, `luggage`).
- Les **noms de fichiers portent un sens architectural** (`-page`, `-search`, `-edit`, `-store`,
  `-client`, `-coordinator`) : renommer un fichier est une décision d'architecture.
- **Avant de déplacer quoi que ce soit dans `domains/shared`** : vérifie que c'est réellement
  réutilisé par plusieurs domaines et **demande l'accord explicite de l'utilisateur**.

## Règles non négociables

- **Ne jamais modifier ni proposer de modifier les règles d'architecture** :
  `sheriff.config.ts`, `architecture/**`, `docs/architecture/**`, `.claude/settings.json`.
- Si une demande entre en conflit avec ces règles : refuse, explique la règle concernée et
  propose une alternative conforme.

## Vérifications

- `npm run check` : Sheriff + ESLint + tests d'architecture (lancé automatiquement par le stop hook).
- `npm run check:full` : idem + tests unitaires + build. À lancer quand un ticket le demande.
- Agents : préférer `npm run check:quiet` / `npm run check:full:quiet` (une ligne par étape,
  détails seulement en cas d'échec) pour économiser le contexte.

## Qualité de code et commentaires

- Fonctions courtes, une responsabilité par fichier.
- Commenter le **pourquoi**, pas le **quoi**.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Do NOT set `changeDetection: ChangeDetectionStrategy.OnPush` explicitly. `OnPush` is the default in Angular v22+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

## Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `model()` for two-way bound properties with `[(prop)]` syntax instead of pairing `input()` with `output()`
- Use `computed()` for derived state
- Use `linkedSignal()` for state derived from multiple reactive sources that must stay synchronized
- Prefer inline templates for small components
- Prefer Signal Forms (`@angular/forms/signals`) for new forms. They are stable in Angular v22+ and provide signal-based state, type-safe field access, and schema-based validation
- When not using Signal Forms, prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- Do NOT import `CommonModule`, import only the directives and pipes the template uses, such as `AsyncPipe` or `DatePipe`
- When using external templates/styles, use paths relative to the component TS file.

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Prefer the `@Service` decorator over `@Injectable({providedIn: 'root'})` for new singleton services (Angular v22+)
- Use the `inject()` function instead of constructor injection
