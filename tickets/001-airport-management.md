---
id: 001
title: Gérer la liste des aéroports
status: ready
depends_on:
---

## Story

En tant qu'agent de réservation, je veux gérer (lister, ajouter, supprimer) les aéroports
desservis, afin de proposer uniquement des destinations valides.

## Scope

- Nouvelle feature `feature-airports` dans le domaine `ticketing`, écran `airport-edit`.
- Données en mémoire (pas de backend), comme les autres clients.
- Hors scope : persistance, droits d'accès.

## Critères d'acceptation

- [ ] La route `/airports` affiche la liste des aéroports.
- [ ] On peut ajouter un aéroport (code IATA de 3 lettres obligatoire).
- [ ] On peut supprimer un aéroport.
- [ ] `npm run check:full` passe.

## Décisions

_(rempli par le skill refine-ticket)_
