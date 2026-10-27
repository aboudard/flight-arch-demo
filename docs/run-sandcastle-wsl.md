# Lancer Sandcastle depuis WSL quand le projet vit sous Windows

Ce guide s'applique quand le dépôt de référence est sur le disque Windows
(par exemple `C:\Factory\github\angular-architecture\flight-arch-demo`) et que Docker
tourne dans WSL.

## Principe

```
Windows (dépôt de référence)                         WSL (copie d'exécution)
C:\Factory\...\flight-arch-demo   ── git clone ──►   ~/work/flight-arch-demo
        ▲                                                    │  npm run sandcastle
        └──────────── git push origin afk-demo ◄─────────────┘  (Docker, worktrees)
```

- **Windows** reste l'endroit où vous éditez, relisez et commitez.
- **WSL** héberge une **copie git** dédiée à l'exécution de Sandcastle. Les deux dépôts
  échangent leurs commits par git : le dépôt Windows est le `origin` de la copie WSL.

Pourquoi ne pas lancer Sandcastle directement sur `/mnt/c/...` ?

- **Performances** : Sandcastle crée des worktrees git et les monte dans les conteneurs. Sur
  `/mnt/c` (système de fichiers Windows vu depuis Linux), ces opérations et `npm install` sont
  très lentes.
- **Droits et propriétaires** : les fichiers de `/mnt/c` n'ont pas de vrais propriétaires
  Linux. L'image est construite pour votre UID WSL afin que l'agent écrive des fichiers qui vous
  appartiennent, ce qui ne fonctionne bien que sur le système de fichiers WSL.
- **Binaires natifs** : un `node_modules` installé sous Windows contient des binaires Windows
  (esbuild, rollup…). Sandcastle copie `node_modules` dans chaque worktree : il doit avoir été
  installé **sous Linux**.

---

## Prérequis dans WSL

| Outil | Vérification | Remarque |
|---|---|---|
| Docker | `docker info` affiche une section *Server* | Docker Engine installé dans WSL, ou Docker Desktop avec l'intégration WSL activée pour votre distribution |
| Accès Docker sans sudo | `docker run --rm hello-world` | Sinon : `sudo usermod -aG docker $USER`, puis fermer et rouvrir WSL |
| Node.js 22+ et npm | `node -v` | Installé **dans WSL** (nvm conseillé), pas celui de Windows |
| git | `git --version` | Configurer `user.name` et `user.email` dans WSL |
| Claude Code CLI (facultatif) | `claude --version` | Seulement pour générer le jeton avec `claude setup-token` |

Si `docker info` ne répond pas avec Docker Engine dans WSL, démarrez le service :
`sudo service docker start`.

---

## Étape 0 — Sous Windows : committer

La copie WSL est créée avec `git clone` : **elle ne contient que ce qui est commité**.

```powershell
cd C:\Factory\github\angular-architecture\flight-arch-demo
git status
git add -A
git commit -m "…"
```

Le fichier `.gitattributes` impose des fins de ligne LF. Le Dockerfile et les scripts restent
donc utilisables sous Linux, même si votre git Windows convertit les fichiers en CRLF.

## Étape 1 — Dans WSL : créer la copie d'exécution

Méthode assistée : le script vérifie les prérequis, clone, installe et prépare `.env`.

```bash
bash /mnt/c/Factory/github/angular-architecture/flight-arch-demo/scripts/wsl/setup-wsl-clone.sh \
  /mnt/c/Factory/github/angular-architecture/flight-arch-demo \
  ~/work/flight-arch-demo
```

Méthode manuelle (équivalente) :

```bash
mkdir -p ~/work
git clone /mnt/c/Factory/github/angular-architecture/flight-arch-demo ~/work/flight-arch-demo
cd ~/work/flight-arch-demo
npm ci                                # installe les dépendances Linux et copie les skills
npm run check                         # Sheriff + ESLint + tests d'architecture
cp .sandcastle/.env.example .sandcastle/.env
```

> Le chemin Windows `C:\Factory\...` correspond à `/mnt/c/Factory/...` dans WSL.

## Étape 2 — Identifiants de l'agent

Éditez `~/work/flight-arch-demo/.sandcastle/.env` (ce fichier n'est jamais commité) et
renseignez **l'un** des deux :

- `CLAUDE_CODE_OAUTH_TOKEN=` : jeton obtenu avec `claude setup-token`. La consommation est
  décomptée des **limites de votre abonnement** Claude.
- `ANTHROPIC_API_KEY=` : clé API. La consommation est **facturée à l'usage**.

## Étape 3 — Construire l'image de la sandbox

```bash
cd ~/work/flight-arch-demo
npm run sandcastle:build-image
```

À refaire après chaque modification de `.sandcastle/Dockerfile`. Le premier build télécharge
l'image `node:22-bookworm` et installe Claude Code : comptez quelques minutes.

## Étape 4 — Test de coût sur un seul ticket

Travaillez toujours sur une **branche dédiée** : la phase de fusion écrit dans la branche
courante.

```bash
git switch -c afk-demo
npm run sandcastle:smoke              # ticket 002 uniquement, un seul tour
```

À la fin, un **rapport de consommation** s'affiche par session (planner, implementer,
reviewer, merger). Il est aussi enregistré dans `.sandcastle/logs/usage-report.json`. Les logs
détaillés de chaque agent sont dans `.sandcastle/logs/` :
`tail -f .sandcastle/logs/<branche>-<agent>.log`.

Utilisez ces chiffres pour extrapoler le coût d'un run complet avant de le lancer.

## Étape 5 — Run complet

```bash
npm run sandcastle
```

Avec le backlog de démo : tour 1 = tickets 001 et 002 en parallèle, tour 2 = ticket 003,
tour 3 = plus rien à faire, arrêt.

## Étape 6 — Rapatrier le résultat sous Windows

Dans WSL :

```bash
git log --oneline master..afk-demo    # commits produits par les agents
git push origin afk-demo              # envoie la branche dans le dépôt Windows
```

Sous Windows :

```powershell
git log --oneline afk-demo
git diff master...afk-demo
git switch afk-demo                   # pour lancer l'application et relire
```

> On peut pousser vers le dépôt Windows parce que la branche `afk-demo` n'y est pas extraite.
> Ne poussez pas vers la branche actuellement ouverte sous Windows.

Pour récupérer ensuite dans WSL des modifications faites sous Windows : `git pull` dans la copie
WSL.

---

## Maîtriser la consommation de tokens

Chaque session d'agent relit tout son contexte à chaque tour. Le coût dépend surtout du nombre
de sessions, du nombre de tours et de la taille des sorties de commandes. Réglages disponibles :

| Réglage | Défaut | Variable d'environnement / option |
|---|---|---|
| Modèle du planificateur | `claude-sonnet-4-6` | `SANDCASTLE_PLANNER_MODEL` |
| Modèle de l'implémenteur | `claude-opus-4-8` | `SANDCASTLE_IMPLEMENTER_MODEL` |
| Modèle du relecteur | `claude-sonnet-4-6` | `SANDCASTLE_REVIEWER_MODEL` |
| Modèle de la fusion | `claude-sonnet-4-6` | `SANDCASTLE_MERGER_MODEL` |
| Tours plan → implement → merge | 3 | `SANDCASTLE_MAX_ROUNDS` |
| Relances max de l'implémenteur | 5 | `SANDCASTLE_IMPLEMENTER_MAX_ITERATIONS` |
| Tickets ciblés (un seul tour) | tous | `--only=002,003` |

Exemple :

```bash
SANDCASTLE_IMPLEMENTER_MODEL=claude-sonnet-4-6 npx tsx .sandcastle/main.mts --only=001
```

Autres mesures déjà en place :

- **Vérifications silencieuses** : les agents lancent `npm run check:full:quiet`, qui affiche une
  ligne par étape et les détails seulement pour les étapes en échec (60 dernières lignes).
- **Pas de MCP Detective dans la sandbox** : l'image désactive ce serveur
  (`disabledMcpjsonServers`), car seul le skill de revue des domaines s'en sert, hors boucle AFK.
- **Stop hook borné** : au plus 3 relances consécutives sur échec des vérifications.

---

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `Image 'sandcastle:flight-arch-demo' not found locally` | Image pas construite | `npm run sandcastle:build-image` |
| `Is Docker running?` / `Cannot connect to the Docker daemon` | Démon arrêté | `sudo service docker start`, ou démarrer Docker Desktop |
| `permission denied … docker.sock` | Utilisateur hors du groupe `docker` | `sudo usermod -aG docker $USER`, puis rouvrir WSL |
| `npm install` très lent, erreurs `EPERM` ou `EACCES` | Projet sous `/mnt/c` | Travailler dans `~/work/...` (étape 1) |
| Erreurs esbuild ou rollup « platform mismatch » | `node_modules` installé sous Windows | `rm -rf node_modules && npm ci` dans WSL |
| `/bin/bash^M: bad interpreter` | Fins de ligne CRLF | `.gitattributes` l'évite ; sinon `git add --renormalize .` sous Windows puis recloner |
| `StructuredOutputError` au démarrage | Le planificateur n'a pas produit de `<plan>` valide | Relancer, ou vérifier `.sandcastle/logs/*-planner.log` |
| `! [remote rejected] … branch is currently checked out` | Push vers la branche ouverte sous Windows | Pousser une autre branche (ex. `afk-demo`) |
| Limite d'usage atteinte | Run trop long | Réduire les tickets (`--only`), les modèles ou les relances |

## Nettoyage

```bash
git worktree list                     # worktrees créés par Sandcastle
git worktree prune
git branch --list 'sandcastle/*'      # branches par ticket, à supprimer une fois fusionnées
git branch -D sandcastle/issue-002
docker image rm sandcastle:flight-arch-demo
```
