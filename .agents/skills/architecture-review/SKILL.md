---
name: architecture-review
description: Revue d'une modification ou de tout le code au regard des règles d'architecture du projet (verticales, couches, feature slicing, conventions de nommage). À utiliser quand l'utilisateur demande une revue d'architecture, une code review, ou avant de fusionner une branche.
---

# Revue d'architecture

## Étapes

1. Lis `docs/architecture/boundaries.md` et `docs/architecture/state-management.md`.
2. Identifie le périmètre : `git diff --name-only main...HEAD` (ou tout `src/app` si on te demande une revue globale).
3. Lance les vérifications déterministes : `npm run check`. Rapporte chaque échec tel quel.
4. Vérifie ensuite ce que les outils ne voient pas :
   - **Localité** : un élément utilisé par une seule feature doit rester DANS cette feature.
     Un élément utilisé par plusieurs features d'un même domaine descend dans `data`, `ui-*` ou `util-*`.
   - **Shared** : tout ajout dans `domains/shared` doit être technique et réellement réutilisé
     par plusieurs domaines. Sinon, proposer une API de domaine (`domains/<domaine>/api`).
   - **API de domaine** : n'expose que le strict nécessaire ; tout ajout est un engagement de rétrocompatibilité.
   - **Nommage** : suffixes `-page`/`-search`/`-edit`, `-store`, `-client`, `-coordinator`.
   - **Composants UI** : aucun store, aucun client, aucune connaissance du cas d'usage.
5. Produis un rapport court : ✅ conforme / ⚠️ à discuter / ❌ à corriger, avec fichier et justification.

## Interdits

- Ne jamais modifier `sheriff.config.ts`, `architecture/**` ni `docs/architecture/**`.
- Ne jamais proposer d'assouplir une règle pour faire passer une modification.
