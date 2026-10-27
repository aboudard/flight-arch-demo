# Lancer Sandcastle depuis WSL, avec le dépôt sur GitHub

Ce guide s'applique quand on travaille au quotidien sous Windows
(par exemple dans `C:\Factory\github\angular-architecture\flight-arch-demo`), que le dépôt de
référence est sur **GitHub**, et que Docker tourne dans WSL.

> Dans les commandes ci-dessous, remplacez `<compte>/<depot>` par votre dépôt GitHub
> (ex. `alainboudard/flight-arch-demo`). La branche principale s'appelle `main`.

## Principe

```
                         GitHub (dépôt de référence)
                     github.com/<compte>/<depot>.git
                    ▲   │                       ▲   │
       git push     │   │ git pull    git push  │   │ git clone / git pull
                    │   ▼                       │   ▼
   Windows (édition, relecture)          WSL (exécution de Sandcastle)
   C:\Factory\...\flight-arch-demo        ~/work/flight-arch-demo
                                          npm run sandcastle (Docker, worktrees)
```

- **Windows** reste l'endroit où vous éditez, relisez et commitez.
- **WSL** héberge un **second clone** du même dépôt GitHub, dédié à l'exécution de Sandcastle.
- Les deux clones échangent leurs commits **via GitHub** : poussez d'un côté, tirez de l'autre.
  Les branches produites par les agents (ex. `afk-demo`) peuvent être relues sous forme de
  **pull request**.

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
| Accès GitHub en écriture | `git ls-remote https://github.com/<compte>/<depot>.git` | Voir « Authentification GitHub dans WSL » ci-dessous |
| Claude Code CLI (facultatif) | `claude --version` | Seulement pour générer le jeton avec `claude setup-token` |

Si `docker info` ne répond pas avec Docker Engine dans WSL, démarrez le service :
`sudo service docker start`.

---

## Mise en place initiale (une seule fois) — publier le projet sur GitHub

### 1. Créer le dépôt sur GitHub

Sur github.com : **New repository**, choisir un nom et la visibilité (privé conseillé).
Ne cochez **ni README, ni .gitignore, ni licence** : le dépôt doit être **vide** pour accueillir
l'historique existant.

### 2. Sous Windows : remplacer l'ancien `origin` et pousser

Le dépôt local a un `origin` qui pointe vers un chemin qui n'existe pas sur votre machine
(c'est le dépôt d'origine de l'archive). On le remplace par GitHub :

```powershell
cd C:\Factory\github\angular-architecture\flight-arch-demo
git status                                   # tout doit être commité
git branch -M main                           # renomme master en main (convention GitHub)
git remote set-url origin https://github.com/<compte>/<depot>.git
git push -u origin main
```

L'authentification passe par **Git Credential Manager**, installé avec Git for Windows : une
fenêtre de connexion GitHub s'ouvre au premier push.

> 💡 Les anciens commits ont pour auteur « Flight Arch Demo <demo@example.com> ». Ce n'est
> pas bloquant ; vos prochains commits porteront votre identité git.

### 3. Vérifier que rien de sensible n'est publié

Les fichiers locaux sont déjà ignorés par `.gitignore` : `.sandcastle/.env` (jetons),
`.sandcastle/logs/`, `.sandcastle/worktrees/`, `.claude/skills/` (copie générée),
`node_modules/`, `.demo-backup`. Vérifiez avant le premier push :

```powershell
git ls-files | Select-String "\.env$"      # ne doit rien afficher
```

---

## Authentification GitHub dans WSL

Le clone WSL doit pouvoir **pousser** les branches produites par Sandcastle. Choisissez une option :

- **Réutiliser Git Credential Manager de Windows** (le plus simple si Git for Windows est installé) :

  ```bash
  git config --global credential.helper "/mnt/c/Program\ Files/Git/mingw64/bin/git-credential-manager.exe"
  ```

- **GitHub CLI dans WSL** : `gh auth login`, puis `gh auth setup-git`.
- **Clé SSH** propre à WSL, ajoutée dans GitHub (*Settings → SSH and GPG keys*). Clonez alors
  avec l'URL `git@github.com:<compte>/<depot>.git`.

---

## Étape 1 — Dans WSL : créer le clone d'exécution

Méthode assistée : le script vérifie les prérequis, clone depuis GitHub, installe et prépare
`.env`. Si le clone existe déjà, il le met à jour (`git pull`).

```bash
bash /mnt/c/Factory/github/angular-architecture/flight-arch-demo/scripts/wsl/setup-wsl-clone.sh \
  https://github.com/<compte>/<depot>.git \
  ~/work/flight-arch-demo
```

Méthode manuelle (équivalente) :

```bash
mkdir -p ~/work
git clone https://github.com/<compte>/<depot>.git ~/work/flight-arch-demo
cd ~/work/flight-arch-demo
npm ci                                # installe les dépendances Linux et copie les skills
npm run check                         # Sheriff + ESLint + tests d'architecture
cp .sandcastle/.env.example .sandcastle/.env
```

> Le clone WSL ne contient que ce qui a été **poussé sur GitHub**. Avant chaque session :
> `git push` sous Windows, puis `git pull` dans WSL.

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

## Étape 6 — Publier et relire le résultat

Dans WSL :

```bash
git log --oneline main..afk-demo      # commits produits par les agents
git push -u origin afk-demo           # publie la branche sur GitHub
```

Ensuite, au choix :

- **Sur GitHub** : ouvrir une **pull request** `afk-demo → main` et relire le diff. C'est le plus
  confortable pour relire du code produit par des agents.
- **Sous Windows**, pour lancer l'application et tester :

  ```powershell
  git fetch origin
  git switch afk-demo                 # crée la branche locale qui suit origin/afk-demo
  npm install
  npm start
  ```

Après fusion de la PR, mettez à jour les deux clones : `git switch main && git pull` sous Windows
et dans WSL.

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
| `Authentication failed` / `Permission denied (publickey)` au push depuis WSL | Pas d'identifiants GitHub dans WSL | Voir « Authentification GitHub dans WSL » |
| `! [rejected] … (fetch first)` | GitHub contient des commits absents du clone | `git pull --rebase`, puis pousser à nouveau |
| Le clone WSL ne voit pas une modification faite sous Windows | Pas encore poussée | `git push` sous Windows, puis `git pull` dans WSL |
| Limite d'usage atteinte | Run trop long | Réduire les tickets (`--only`), les modèles ou les relances |

## Nettoyage

```bash
git worktree list                     # worktrees créés par Sandcastle
git worktree prune
git branch --list 'sandcastle/*'      # branches par ticket, à supprimer une fois fusionnées
git branch -D sandcastle/issue-002
git push origin --delete afk-demo   # une fois la PR fusionnée
docker image rm sandcastle:flight-arch-demo
```
