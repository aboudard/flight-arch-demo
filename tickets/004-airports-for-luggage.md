---
id: 004
title: Afficher le nom complet de l'aéroport dans la liste des bagages
status: draft
depends_on: 003
---

## Story

En tant qu'agent bagages, je veux voir le nom complet des aéroports de chaque bagage.

## Scope

- Le domaine `luggage` a besoin des données d'aéroports du domaine `ticketing`.

## Critères d'acceptation

- [ ] La liste des bagages affiche « Paris-CDG → Vienne-VIE ».
- [ ] `npm run check:full` passe.

## Décisions

_(à affiner : API du domaine ticketing ou shared ? → lancer « refine ticket 004 »)_
