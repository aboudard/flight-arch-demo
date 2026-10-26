---
id: 002
title: Filtrer les vols retardés dans la recherche
status: ready
depends_on:
---

## Story

En tant que voyageur, je veux masquer les vols retardés dans la recherche.

## Scope

- Case à cocher « Masquer les vols retardés » dans `flight-search`.
- Le filtre est un état du `flight-store` (computed), pas du composant.

## Critères d'acceptation

- [ ] La case est décochée par défaut.
- [ ] Cochée, les vols `delayed: true` ne sont plus affichés.
- [ ] Un test unitaire couvre le filtre dans le store.
- [ ] `npm run check:full` passe.

## Décisions

_(rempli par le skill refine-ticket)_
