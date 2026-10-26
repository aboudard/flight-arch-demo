# ADR 0001 — Verticales par domaine + feature slicing

- **Statut** : accepté
- **Date** : 2026-10-26

## Contexte

L'application grossit et plusieurs personnes (et agents IA) y contribuent. La charge cognitive
et le risque d'effets de bord augmentent quand « tout dépend de tout ».

## Décision

1. Découper en **verticales** (domaines métier) à faible couplage.
2. Dans chaque domaine, organiser en **features autonomes** (feature slicing) pour la localité,
   avec des couches `ui` / `data` / `util` partagées au sein du domaine uniquement quand nécessaire.
3. Faire respecter ces règles de manière **déterministe** (Sheriff, ArchUnitTS, stop hooks)
   plutôt que de compter uniquement sur les consignes données aux agents.

## Alternatives écartées

- **Couches seules (sans feature slicing)** : structure claire mais éparpille une feature
  dans plusieurs dossiers (mauvaise localité).
- **Micro frontends par domaine** : isolation maximale, mais coût d'infrastructure
  disproportionné pour cette taille d'application.

## Conséquences

- Il faut un **état d'esprit de refactoring** : descendre un élément d'un niveau dès qu'une
  seconde feature en a besoin.
- `shared` doit être surveillé pour ne pas devenir un fourre-tout.
