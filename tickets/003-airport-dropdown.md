---
id: 003
title: Choisir les aéroports via une liste déroulante dans la recherche
status: ready
depends_on: 001
---

## Story

En tant que voyageur, je veux choisir départ et arrivée parmi les aéroports gérés.

## Scope

- Réutiliser les données d'aéroports du ticket 001 dans `flight-search`.
- Appliquer le principe de localité : si le client des aéroports sert à deux features,
  le descendre dans `ticketing/data`.

## Critères d'acceptation

- [ ] Les champs « De » et « À » sont des listes déroulantes.
- [ ] La liste reflète les aéroports gérés (ajout/suppression).
- [ ] `npm run check:full` passe.

## Décisions

_(rempli par le skill refine-ticket)_
