#!/usr/bin/env bash
# Crée dans WSL une copie d'exécution du projet pour Sandcastle.
#
#   bash setup-wsl-clone.sh <dépôt Windows vu depuis WSL> [dossier cible]
#   bash setup-wsl-clone.sh /mnt/c/Factory/github/angular-architecture/flight-arch-demo ~/work/flight-arch-demo
#
# Voir docs/run-sandcastle-wsl.md
set -euo pipefail

SOURCE="${1:?Usage : setup-wsl-clone.sh <dépôt Windows, ex. /mnt/c/...> [dossier cible]}"
TARGET="${2:-$HOME/work/$(basename "$SOURCE")}"

ok()   { printf '  \033[32m✓\033[0m %s\n' "$1"; }
fail() { printf '  \033[31m✗\033[0m %s\n' "$1"; exit 1; }

echo "Vérification des prérequis"
[[ "$SOURCE" == /mnt/* ]] || echo "  (info) la source n'est pas sous /mnt : OK si c'est voulu"
[[ "$TARGET" != /mnt/* ]] || fail "La cible doit être dans le système de fichiers WSL (ex. ~/work), pas sous /mnt"
git -C "$SOURCE" rev-parse --is-inside-work-tree >/dev/null 2>&1 || fail "$SOURCE n'est pas un dépôt git"
command -v git >/dev/null || fail "git absent"
command -v node >/dev/null || fail "Node.js absent dans WSL (installer Node 22, ex. via nvm)"
[[ "$(command -v node)" != /mnt/* ]] || fail "Le node utilisé est celui de Windows ($(command -v node)) : installer Node dans WSL"
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
(( NODE_MAJOR >= 22 )) || fail "Node $NODE_MAJOR détecté, 22+ requis"
ok "git, Node $(node -v)"
command -v docker >/dev/null || fail "docker absent dans WSL"
docker info >/dev/null 2>&1 || fail "Docker ne répond pas (sudo service docker start, ou démarrer Docker Desktop ; groupe docker ?)"
ok "Docker joignable"

if [[ -n "$(git -C "$SOURCE" status --porcelain)" ]]; then
  echo "  (attention) des modifications NON commitées existent sous Windows : elles ne seront pas copiées."
fi

if [[ -d "$TARGET/.git" ]]; then
  echo "La copie existe déjà : mise à jour"
  git -C "$TARGET" pull --ff-only
else
  echo "Clonage vers $TARGET"
  mkdir -p "$(dirname "$TARGET")"
  git clone "$SOURCE" "$TARGET"
fi
ok "Copie prête"

cd "$TARGET"
git config user.name  >/dev/null || echo "  (info) pensez à : git config --global user.name \"…\" && git config --global user.email \"…\""

echo "Installation des dépendances (Linux)"
npm ci --no-audit --no-fund
ok "npm ci"

if [[ ! -f .sandcastle/.env ]]; then
  cp .sandcastle/.env.example .sandcastle/.env
  ok ".sandcastle/.env créé : renseigner CLAUDE_CODE_OAUTH_TOKEN ou ANTHROPIC_API_KEY"
fi

cat <<NEXT

Étapes suivantes (dans $TARGET) :
  1. Éditer .sandcastle/.env (jeton Claude ou clé API)
  2. npm run check
  3. npm run sandcastle:build-image
  4. git switch -c afk-demo && npm run sandcastle:smoke
  5. git push origin afk-demo   # rapatrier la branche sous Windows
NEXT
