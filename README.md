# Flight Arch Demo — une architecture Angular « prête pour l'IA »

Projet de démonstration inspiré du webinar de **Manfred Steyer** (Angular Architects) sur le
développement assisté par IA **sans dégrader l'architecture**.

> Les agents IA sont optimisés pour **produire du code**, pas pour **respecter votre architecture**.
> Une grande force sans plan est inutile (cf. les 3 000 policiers de *The Dark Knight Rises*).
> On leur donne donc : des **règles** découvertes à la demande, des **vérifications déterministes**,
> des **garde-fous** automatiques et du **contexte ciblé**.

| Thème | Ce que montre la démo | Outils |
|---|---|---|
| 1. Définir l'architecture | Verticales par domaine, couches, feature slicing, conventions de nommage | Structure de dossiers, NgRx Signal Store |
| 2. Décrire l'architecture pour l'IA | `AGENTS.md` court + documents chargés à la demande (*progressive disclosure*) | `AGENTS.md`, `docs/` |
| 3. Faire respecter l'architecture | Violations détectées dans l'IDE, en CLI et en CI | **Sheriff**, **ArchUnitTS**, ESLint |
| 4. Garde-fous pour l'agent | Le *stop hook* relance l'agent tant que les vérifications échouent | Hook Claude Code + `npm run check` |
| 5. Contexte à la demande | Skills (officiels Angular + maison) et serveurs MCP | `npx skills`, Angular CLI MCP, **Detective** |

---

## Sommaire

1. [Démarrage rapide](#1-démarrage-rapide)
2. [Structure du projet](#2-structure-du-projet)
3. [Définir l'architecture](#3-définir-larchitecture)
4. [Sheriff — frontières et règles de dépendances](#4-sheriff--frontières-et-règles-de-dépendances)
5. [ArchUnitTS — conventions de nommage](#5-archunitts--conventions-de-nommage)
6. [Le modèle du gruyère](#6-le-modèle-du-gruyère)
7. [Stop hooks](#7-stop-hooks)
8. [AGENTS.md et progressive disclosure](#8-agentsmd-et-progressive-disclosure)
9. [Skills](#9-skills)
10. [Serveurs MCP : Angular CLI et Detective](#10-serveurs-mcp--angular-cli-et-detective)
11. [Script de démonstration (≈ 30 min)](#11-script-de-démonstration--30-min)
12. [Appliquer à un projet existant](#12-appliquer-à-un-projet-existant)
13. [Limites et points d'attention](#13-limites-et-points-dattention)
14. [Références](#14-références)

---

## 1. Démarrage rapide

**Prérequis** : Node.js 22+, npm 10+, git. Facultatif : Claude Code (hooks, skills, MCP).

```bash
npm install
npm start            # http://localhost:4200
npm run check        # Sheriff + ESLint + tests d'architecture (≈ 15 s)
npm run check:full   # + tests unitaires + build
```

Versions utilisées : Angular 22.2, NgRx Signals 22, Sheriff 0.20, ArchUnitTS 2.5,
Detective 2.1, Vitest 5.

### Commandes npm

| Commande | Rôle |
|---|---|
| `npm run lint` | ESLint, avec le plugin Sheriff |
| `npm run sheriff:verify` / `sheriff:list` | Sheriff en CLI : vérification, ou liste des modules et de leurs tags |
| `npm run test:arch` | Tests d'architecture (ArchUnitTS + Vitest) |
| `npm test` | Tests unitaires Angular (Vitest) |
| `npm run check` | `sheriff:verify` puis `lint` puis `test:arch` (vérifications rapides, utilisées par le stop hook) |
| `npm run check:full` | `check` puis tests unitaires puis build |
| `npm run detective` | Interface Detective (http://localhost:3334) |
| `npm run detective:demo` | Detective en mode démo (auteurs fictifs pour la vue *team alignment*) |

---

## 2. Structure du projet

```
.
├── AGENTS.md                      # Instructions agents (court, < 100 lignes)
├── CLAUDE.md                      # Pointeur vers AGENTS.md (@AGENTS.md)
├── sheriff.config.ts              # Tags des dossiers + règles de dépendances
├── eslint.config.js               # ESLint + plugin Sheriff
├── vitest.arch.config.mts         # Config Vitest dédiée aux tests d'architecture
├── architecture/
│   └── conventions.arch.spec.ts   # Tests ArchUnitTS (conventions de nommage)
├── docs/
│   ├── architecture/              # Règles détaillées (chargées à la demande)
│   ├── adr/                       # Architecture Decision Records
│   └── domains/                   # Contexte métier par domaine
├── .claude/
│   ├── settings.json              # Stop hook pour Claude Code
│   └── skills/                    # Skills (officiels Angular + maison)
├── .mcp.json                      # Serveurs MCP : angular-cli, detective
├── .detective/config.json         # Configuration de Detective
└── src/app/
    ├── app.ts, app.routes.ts      # Shell : ne charge que des features
    └── domains/
        ├── ticketing/             # Domaine principal
        │   ├── feature-booking/       flight-search, booking-summary, flight-store, passenger-store
        │   ├── feature-my-tickets/    my-tickets-page, ticket-store
        │   ├── ui-flight/             flight-card (dumb)
        │   ├── data/                  flight-client, flight (modèle)
        │   ├── util-format/           format-route
        │   └── api/                   ticketing-api.ts (API publique du domaine)
        ├── luggage/
        │   ├── feature-luggage/       luggage-list-page, luggage-store
        │   └── data/                  luggage-client, luggage
        └── shared/
            ├── ui-design/             status-badge
            └── util-config/           simulated-latency
```

L'application tourne sans backend : les clients renvoient des données en mémoire avec une
latence simulée.

---

## 3. Définir l'architecture

### 3.1 Verticales : « de bonnes clôtures font de bons voisins »

Chaque **domaine** (`ticketing`, `luggage`) est une verticale peu couplée aux autres. Les
bénéfices :

- on modifie un domaine sans casser les autres ;
- une équipe peut se concentrer sur un domaine. La **charge cognitive** baisse, pour les humains
  comme pour la fenêtre de contexte d'un LLM.

`shared` est traité **comme un domaine** par Sheriff, ce qui évite de dupliquer les règles. Il
doit rester **petit et technique**, sinon il devient un fourre-tout.

### 3.2 Couches et feature slicing

| Dossier | Tag | Contenu | Peut importer |
|---|---|---|---|
| `feature-*` | `type:feature` | Composants smart, stores locaux, coordinators | ui, data, util, api |
| `ui-*` | `type:ui` | Composants « dumb » réutilisables | data (modèles), util, api |
| `data` | `type:data` | Clients et modèles partagés par plusieurs features | util, api |
| `util-*` | `type:util` | Fonctions pures | — |
| `api` | `type:api` | Réexports choisis pour les autres domaines | ui, data, util |

**Principe de localité** : *aussi local que possible, aussi global que nécessaire.*

- `flight-store.ts` sert une seule feature : il reste **dans** `feature-booking`.
- `flight-client.ts` sert **deux** features (`booking` et `my-tickets`) : il a été descendu
  dans `ticketing/data`.
- `luggage` a besoin d'éléments de `ticketing` : il passe **uniquement** par
  `ticketing/api/ticketing-api.ts`. C'est une API publique minimale, qui doit rester
  rétrocompatible.

### 3.3 Conventions de nommage porteuses de sens

Angular a abandonné les suffixes `.component` et `.service`, mais recommande de définir **ses
propres conventions, plus riches en sens** :

| Suffixe | Rôle | Exemple |
|---|---|---|
| `-page`, `-search`, `-edit` | Composant smart | `flight-search.ts`, `booking-summary-page.ts` |
| `-store` | NgRx Signal Store | `flight-store.ts` |
| `-client` | Accès aux données | `flight-client.ts` |
| `-coordinator` | Orchestre plusieurs stores | `booking-summary-coordinator.ts` |

### 3.4 NgRx Signal Store

Les stores utilisent `signalStore`, `withState`, `withComputed`, `withMethods`, `withHooks`,
`patchState` et `rxMethod`.

- Un store global à une feature est déclaré avec `{ providedIn: 'root' }` (exemple :
  `FlightStore`).
- Un store lié à un écran est fourni dans les `providers` du composant (exemple : `TicketStore`).
- Ces stores sont des services légers. Quand un cas d'usage en combine plusieurs, on passe par
  un **coordinator** (`BookingSummaryCoordinator`) plutôt que de faire dépendre un store d'un
  autre.

---

## 4. Sheriff — frontières et règles de dépendances

[Sheriff](https://sheriff.softarc.io/) applique des frontières de modules **par dossier** dans
n'importe quel projet TypeScript (Angular CLI ou Nx). Il n'a aucune dépendance et fournit un
plugin ESLint ainsi qu'un CLI.

### Installation (déjà faite)

```bash
npm install -D @softarc/sheriff-core @softarc/eslint-plugin-sheriff
```

### Configuration : [`sheriff.config.ts`](sheriff.config.ts)

```ts
export const config: SheriffConfig = {
  entryFile: 'src/main.ts',
  enableBarrelLess: true,
  modules: {
    'src/app/domains/<domain>': {
      'feature-<feature>': ['domain:<domain>', 'type:feature'],
      'ui-<ui>':           ['domain:<domain>', 'type:ui'],
      data:                ['domain:<domain>', 'type:data'],
      'util-<util>':       ['domain:<domain>', 'type:util'],
      api:                 ['domain:<domain>', 'type:api'],
    },
  },
  depRules: {
    'domain:*': [sameTag, 'domain:shared', 'type:api'],
    'type:feature': ['type:ui', 'type:data', 'type:util', 'type:api'],
    'type:api': ['type:ui', 'type:data', 'type:util'],
    'type:ui': ['type:data', 'type:util', 'type:api'],
    'type:data': ['type:util', 'type:api'],
    'type:util': [],
    root: ['type:feature'],
  },
};
```

Pour lire cette configuration :

- **Placeholders** : `<domain>` est remplacé par le nom réel du dossier. Par exemple,
  `src/app/domains/ticketing/feature-booking` reçoit les tags `domain:ticketing` et
  `type:feature`.
- **`depRules`** : pour chaque tag du module qui importe, la liste des tags qu'il a le droit
  d'importer. Tous les tags de l'appelant doivent être satisfaits.
- **`sameTag`** : un domaine ne peut accéder qu'à lui-même (`domain:ticketing` vers
  `domain:ticketing`).
- **`enableBarrelLess`** : pas besoin de fichier `index.ts` dans chaque module. Seul un
  sous-dossier `internal/` serait encapsulé (barrel-less est le mode recommandé par la doc).
- **`root`** : les fichiers hors modules (`app.ts`, `app.routes.ts`) ne peuvent charger que des
  features.

```bash
npx sheriff list     # modules détectés et leurs tags
npx sheriff verify   # rapport de violations (rapide : chaque fichier n'est lu qu'une fois)
npx sheriff export > graph.json
```

### Intégration ESLint : [`eslint.config.js`](eslint.config.js)

```js
const sheriff = require('@softarc/eslint-plugin-sheriff');
// …
{ files: ['src/**/*.ts'], extends: [sheriff.configs.all] },
```

Les erreurs s'affichent **dans l'IDE pendant la frappe** et avec `npm run lint` :

```
error  module /src/app/domains/ticketing/feature-booking cannot access
/src/app/domains/luggage/data. Tag domain:ticketing has no clearance for
tags domain:luggage, type:data   @softarc/sheriff/dependency-rule
```

> 💡 **Performance** : sur une très grosse base de code, ESLint relit les fichiers à chaque
> frappe. Le CLI `sheriff verify` est bien plus rapide : c'est lui qu'utilise `npm run check`.

### À essayer : contourner l'API publique d'un domaine

C'est la violation la plus simple à comprendre. Le domaine `luggage` affiche le trajet de chaque
bagage avec `formatRoute`, une fonction du domaine `ticketing` qu'il obtient **par l'API
publique** de ce domaine.

1. Dans `src/app/domains/luggage/feature-luggage/luggage-list-page.ts`, remplacer l'import :

   ```ts
   // avant : via l'API publique de ticketing (autorisé)
   import { formatRoute } from '../../ticketing/api/ticketing-api';

   // après : directement dans un dossier interne de ticketing (interdit)
   import { formatRoute } from '../../ticketing/util-format/format-route';
   ```

   C'est la **même fonction** et l'application se comporte exactement pareil : seul le chemin
   change. Sheriff contrôle **où** le code va chercher ses dépendances, pas ce qu'il fait.
2. Observer :
   - dans l'éditeur, la ligne d'import est soulignée en rouge ;
   - `npm run check` : Sheriff et ESLint échouent, les tests d'architecture passent.

   ```
   error  module /src/app/domains/luggage/feature-luggage cannot access
   /src/app/domains/ticketing/util-format. Tag domain:luggage has no clearance
   for tags domain:ticketing, type:util   @softarc/sheriff/dependency-rule
   ```

3. Comprendre : la règle `'domain:*': [sameTag, 'domain:shared', 'type:api']` n'autorise un
   domaine à importer que lui-même, `shared` ou l'**API** d'un autre domaine. Le dossier visé
   porte les tags `domain:ticketing` et `type:util` : aucune de ces conditions n'est remplie.
4. Remettre l'import d'origine : tout redevient vert.

---

## 5. ArchUnitTS — conventions de nommage

[ArchUnitTS](https://lukasniessen.github.io/ArchUnitTS/) (`npm i -D archunit`) est un portage
TypeScript d'ArchUnit, bien connu dans l'écosystème Java. Il permet d'écrire l'architecture sous
forme de **tests unitaires**.

Fichier : [`architecture/conventions.arch.spec.ts`](architecture/conventions.arch.spec.ts),
exécuté avec Vitest via [`vitest.arch.config.mts`](vitest.arch.config.mts)
(`globals: true` est requis par ArchUnitTS).

| Règle | Implémentation |
|---|---|
| Seuls les stores accèdent aux clients | `projectFiles().withName(<ni store ni client>).shouldNot().dependOnFiles().withName(/-client\.ts$/)` |
| Seuls les composants smart et les coordinators accèdent aux stores | même principe avec `/-store\.ts$/` |
| Un store n'importe jamais un autre store | `withName(/-store\.ts$/).should().adhereTo(fichier => !importeUnStore(fichier))` |
| Pas de cycles | `inFolder('src/app/**').should().haveNoCycles()` |

> ℹ️ Pour la règle « store vers store », on utilise `adhereTo` (règle personnalisée) plutôt que
> `dependOnFiles`, car ce dernier signale aussi l'auto-référence d'un fichier.

```bash
npm run test:arch
```

### À essayer : un store qui utilise un autre store

On veut que le store du passager affiche « Alain · 2 vol(s) » et qu'il vide la sélection de vols
quand on réinitialise le passager. Le réflexe est d'injecter `FlightStore` dans `PassengerStore` :

```ts
// src/app/domains/ticketing/feature-booking/passenger-store.ts
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { FlightStore } from './flight-store';

export const PassengerStore = signalStore(
  { providedIn: 'root' },
  withState({ name: '' }),
  withComputed((store, flights = inject(FlightStore)) => ({
    // ❌ Un store lit l'état d'un autre store
    bookingLabel: computed(() => `${store.name()} · ${flights.selectedFlights().length} vol(s)`),
  })),
  withMethods((store, flights = inject(FlightStore)) => ({
    setName(name: string): void {
      patchState(store, { name });
    },
    reset(): void {
      patchState(store, { name: '' });
      // ❌ Un store pilote un autre store
      flights.clearSelection();
    },
  })),
);
```

Avec `npm run check:full`, **seul ArchUnit échoue**. Sheriff ne voit rien, car les deux fichiers
sont dans le même module, et le build passe, car le code est techniquement correct :

```
× un store ne doit jamais dépendre d'un autre store (utiliser un coordinator)
  File: src/app/domains/ticketing/feature-booking/passenger-store.ts
  Rule: Un store ne doit pas importer un autre store : créer un *-coordinator
```

Si l'on fait aussi dépendre `FlightStore` de `PassengerStore`, la règle « pas de cycles »
échoue à son tour (`passenger-store.ts → flight-store.ts → passenger-store.ts`), et le build
aussi : TypeScript ne sait plus typer deux stores qui se référencent mutuellement.

**Solution conforme** : la logique qui combine plusieurs stores va dans un **coordinator**, comme
`booking-summary-coordinator.ts`.

---

## 6. Le modèle du gruyère

Métaphore empruntée à l'ingénierie de la sécurité : chaque tranche a des trous, mais pas aux
mêmes endroits.

1. **Les règles et le prompt** (`AGENTS.md`, `docs/`) : indispensables, mais l'agent peut les
   ignorer, surtout quand sa fenêtre de contexte est chargée.
2. **Sheriff** : frontières de domaines et de couches.
3. **ArchUnitTS** : conventions de nommage et règles d'accès.
4. **Tests unitaires et build**.

Les deux exemples « À essayer » montrent la complémentarité des tranches :

| Violation | Sheriff | ArchUnitTS |
|---|---|---|
| `luggage` contourne l'API publique de `ticketing` (section 4) | ❌ détecté | ✅ ne voit rien |
| Un store utilise un autre store (section 5) | ✅ ne voit rien | ❌ détecté |

`npm run check` enchaîne les tranches automatiques avec `&&` : `sheriff:verify`, puis `lint`,
puis `test:arch`. La chaîne s'arrête à la première étape en échec.

---

## 7. Stop hooks

Un **stop hook** est une commande que l'agent exécute **quand il pense avoir terminé**. Si les
vérifications échouent, le message d'erreur est renvoyé au modèle, qui doit refaire un tour.

Chaque agent a sa propre configuration et son propre contrat de retour :

| Agent | Succès | Échec |
|---|---|---|
| Claude Code, Codex | exit 0 | exit **2** + message sur **stderr** |
| Cursor, Antigravity… | exit 0 + `{}` sur stdout | exit 0 + **JSON** avec la raison |

### Claude Code : [`.claude/settings.json`](.claude/settings.json)

Le hook réutilise simplement `npm run check` :

```json
{
  "hooks": {
    "Stop": [
      { "hooks": [{ "type": "command", "command": "npm run --silent check 1>&2 || exit 2", "timeout": 180 }] }
    ]
  }
}
```

- `1>&2` envoie la sortie des vérifications sur **stderr** : c'est ce texte que Claude Code
  renvoie au modèle.
- `|| exit 2` transforme n'importe quel échec en code **2**, qui signifie « tu n'as pas
  terminé, corrige ».

Pour tester le contrat à la main (Git Bash ou WSL), après avoir introduit une violation :

```bash
bash -c 'npm run --silent check 1>&2 || exit 2'; echo "exit=$?"   # → rapport d'erreur, exit=2
```

---

## 8. AGENTS.md et progressive disclosure

La fenêtre de contexte est limitée. Même quand elle est immense en théorie, plus on la remplit,
moins le modèle repère ce qui compte (les informations « au milieu » sont moins bien prises en
compte). On applique donc la **progressive disclosure** : `AGENTS.md` ne contient que des
**déclencheurs** et des **pointeurs**.

```markdown
- Avant d'ajouter ou de déplacer un composant, un client ou un helper :
  lis `docs/architecture/boundaries.md`.
- Avant toute modification touchant à l'état : lis `docs/architecture/state-management.md`.
- Travail dans un domaine précis : lis `docs/domains/<domaine>.md`.
```

Plusieurs niveaux d'indirection sont possibles : `AGENTS.md` → `docs/architecture/boundaries.md`
→ `docs/adr/0001-…md` (le *pourquoi* d'une décision).

**Deux consignes jugées indispensables par l'auteur du webinar** :

1. *« Ne jamais modifier ni proposer de modifier les règles d'architecture. »* Sans cette phrase,
   l'agent est tenté d'assouplir la règle pour faire passer son code.
2. *« Demander l'accord explicite de l'utilisateur avant d'ajouter quoi que ce soit à
   `shared`. »* Sans elle, tout finit peu à peu dans `shared`.

`AGENTS.md` (format multi-agents) contient aussi les bonnes pratiques Angular générées par
`ng new`. `CLAUDE.md` se contente de l'importer (`@AGENTS.md`), ce qui garantit que Claude Code le
charge.

---

## 9. Skills

Un **skill** est un fichier `SKILL.md` avec un en-tête (`name`, `description`) :

1. l'agent ne lit que la **description** pour savoir que le skill existe ;
2. il charge le contenu complet seulement si la tâche s'y prête.

C'est aussi de la progressive disclosure.

| Skill | Origine | Rôle |
|---|---|---|
| `angular-developer` | Officiel Angular | Angular moderne (signals, control flow…), indépendamment de la date d'entraînement du modèle |
| `architecture-review` | Maison | Revue au regard des règles du projet, plus `npm run check` |
| `domain-boundaries-review` | Maison | Sémantique DDD et analyse forensique via le MCP Detective |

### Installer ou mettre à jour les skills officiels Angular

```bash
npx skills add https://github.com/angular/skills -s angular-developer -a claude-code -y --copy
```

`npx skills` est une sorte de « npm pour les skills ». La version installée est tracée dans
`skills-lock.json`.

Les skills sont versionnés dans `.claude/skills/`, le dossier lu par Claude Code. D'autres
agents utilisent `.agents/skills/` : `npx skills` sait installer dans l'un, l'autre ou les deux.

> Réflexe recommandé : quand vous installez une bibliothèque (composants, graphiques…),
> vérifiez si elle publie des skills.

---

## 10. Serveurs MCP : Angular CLI et Detective

Le **Model Context Protocol** fournit du contexte et des outils **à la demande** : le serveur
annonce ses capacités, puis l'agent appelle les outils dont il a besoin.

Fichier [`.mcp.json`](.mcp.json) :

```json
{
  "mcpServers": {
    "angular-cli": { "command": "npx", "args": ["-y", "@angular/cli", "mcp"] },
    "detective":   { "command": "npx", "args": ["detective", "--mcp"] }
  }
}
```

### Angular CLI MCP

Il donne accès à la documentation officielle, à des **exemples de référence** (les agents
travaillent très bien par imitation) et aux migrations. Gardez-le configuré même si l'agent sait
lancer `ng` : le CLI seul ne donne accès ni à la documentation ni aux exemples.

### Detective : analyse forensique

[Detective](https://github.com/angular-architects/detective) (`npm i -D @softarc/detective`)
analyse la structure **et l'historique git** :

| Analyse | Ce qu'elle révèle |
|---|---|
| Structure / couplage | Modules, domaines, couches et dépendances entre eux |
| **Change coupling** | Domaines qui **changent ensemble** sans s'importer : couplage logique caché |
| **Team alignment** | Une équipe travaille-t-elle dans une seule verticale ? (nécessite `teams` dans la config) |
| **Hotspots** | Fichiers à la fois complexes et souvent modifiés : risque de bugs élevé |

```bash
npm run detective        # interface web sur http://localhost:3334
npm run detective:demo   # ajoute des auteurs fictifs pour illustrer la vue team alignment
```

Configuration : [`.detective/config.json`](.detective/config.json). Elle contient les `scopes`
(les domaines analysés), les `teams`, les `aliases` (plusieurs identités git pour une même
personne) et un `filter` (exclusion des `*.spec.ts`).

En mode MCP (`--mcp`), Detective expose notamment les outils `modules_get`, `coupling_get`,
`changeCoupling_get`, `teamAlignment_get`, `hotspots_find` et `cache_update`. Le skill
`domain-boundaries-review` les orchestre.

> ℹ️ Ce dépôt de démo n'a que quelques commits : les vues *change coupling* et *hotspots*
> deviennent vraiment parlantes sur un projet réel avec un historique riche.

---

## 11. Script de démonstration (≈ 30 min)

| # | Durée | Action | Message clé |
|---|---|---|---|
| 1 | 3 min | Montrer l'app (`npm start`) puis l'arborescence `src/app/domains` | Verticales, couches, localité (`flight-store` reste dans sa feature, `flight-client` descendu dans `data`) |
| 2 | 3 min | Ouvrir `sheriff.config.ts`, lancer `npx sheriff list` | Tags par placeholders, règles concises |
| 3 | 4 min | Modifier l'import de `luggage-list-page.ts` (section 4, « À essayer »), constater le soulignement rouge dans l'IDE, puis `npm run check` | Même fonction, autre chemin : Sheriff refuse le contournement de l'API |
| 4 | 4 min | Faire utiliser `FlightStore` par `PassengerStore` (section 5, « À essayer »), puis `npm run test:arch` | ArchUnit détecte, Sheriff ne voit rien : le **gruyère**. Montrer le coordinator comme solution |
| 5 | 4 min | Montrer `AGENTS.md` puis `docs/architecture/*`, `.claude/settings.json` et le hook | Progressive disclosure, consignes non négociables, contrat exit 2 / stderr |
| 6 | 4 min | Dans Claude Code : *« Renomme booking-summary-coordinator en booking-summary-store »* | L'agent lit `state-management.md` et **refuse**. Variante : désactiver la consigne pour montrer le stop hook qui le renvoie au travail |
| 7 | 4 min | `npm run detective` (vues coupling, team alignment) ; dans Claude Code : *« Review the domain boundaries »* | Skill et MCP Detective : rapport de revue |

---

## 12. Appliquer à un projet existant

1. **Installer les outils** dans le projet :
   `npm i -D @softarc/sheriff-core @softarc/eslint-plugin-sheriff archunit @softarc/detective`.
2. **Analyser l'existant avec Detective** : `npx detective` (interface web). Les vues
   *coupling*, *change coupling* et *hotspots* montrent où des verticales apporteraient le plus.
   Pour faire faire cette analyse par l'agent, copiez depuis cette démo le skill
   `.claude/skills/domain-boundaries-review/` et l'entrée `detective` de `.mcp.json`.
3. **Adopter Sheriff progressivement** : `npx sheriff init` (étiquetage automatique, sans
   règles), tolérer l'existant avec `noTag` dans les `depRules`, puis resserrer domaine par
   domaine. Jamais de big bang.
4. **Écrire les règles** : un `AGENTS.md` court et des documents détaillés, cohérents avec la
   configuration Sheriff et les tests ArchUnit (inspirez-vous de `docs/` et
   `architecture/` de cette démo).
5. **Automatiser** : `npm run check:full` en CI et `npm run check` en stop hook.

Les couches proposées sont une **règle empirique** : les adapter est possible, à condition que
ce soit une décision délibérée, consignée dans un ADR.

---

## 13. Limites et points d'attention

- **Formats des hooks** : le contrat exit 2 / stderr de Claude Code est utilisé tel quel. Le
  format JSON des autres agents doit être vérifié dans leur documentation. Seule la configuration
  Claude Code est fournie.
- **Boucle infinie** : un stop hook qui échoue toujours relance l'agent à chaque tentative.
  Le hook de démo n'a pas de limite : interrompez l'agent s'il tourne en rond.
- **Le dossier `domains/shared`** doit être surveillé : c'est la principale source de dérive.
  Comme tous les domaines ont le droit d'y accéder, y déplacer du code est le moyen le plus
  simple de contourner une règle Sheriff. Si l'on n'y prend pas garde, la logique métier y migre
  peu à peu, et le découpage en domaines perd son sens. D'où la consigne de `AGENTS.md` : pas
  d'ajout dans `shared` sans accord explicite.

---

## 14. Références

- Webinar : *AI-assisted development without destroying your architecture*, Manfred Steyer
  (Angular Architects)
- Sheriff : https://sheriff.softarc.io/ (voir *Dependency Rules*, *Module Boundaries*, *CLI*)
- ArchUnitTS : https://lukasniessen.github.io/ArchUnitTS/
- Detective : https://github.com/angular-architects/detective
- NgRx Signal Store : https://ngrx.io/guide/signals/signal-store
- Skills officiels Angular : https://angular.dev/ai/agent-skills
