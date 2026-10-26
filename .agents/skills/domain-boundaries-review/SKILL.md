---
name: domain-boundaries-review
description: Analyse du découpage en domaines (bounded contexts) — sémantique DDD et analyse forensique de l'historique git via le serveur MCP Detective. À utiliser quand l'utilisateur demande de revoir les frontières de domaines, le couplage entre domaines ou l'alignement des équipes.
---

# Revue des frontières de domaines

## Étape 1 — Structure

1. Appelle l'outil MCP `detective` → `modules_get` pour lister modules, domaines et couches.
2. Appelle `npx sheriff list` si tu as besoin des tags exacts.

## Étape 2 — Sémantique (DDD)

Pour chaque concept présent dans plusieurs domaines (ex. `Flight` dans ticketing et luggage) :
- même **nom** mais **sens** différent → normal, garder des modèles séparés ;
- même nom ET même sens, avec des règles métier partagées → signal que la frontière est peut-être mal placée.

## Étape 3 — Analyse forensique (Detective)

1. `cache_update` si le cache est absent ou ancien.
2. `changeCoupling_get` : domaines qui changent souvent ensemble sans dépendance directe → couplage logique caché.
3. `teamAlignment_get` (si des équipes sont définies dans `.detective/config.json`) :
   une équipe devrait travailler principalement dans UNE verticale.
4. `hotspots_find` : fichiers complexes ET souvent modifiés.

## Étape 4 — Rapport

- Synthèse : « sain / à surveiller / à restructurer ».
- 3 à 5 recommandations priorisées, chacune avec la donnée qui la justifie.
- Pour un projet existant : proposer une amélioration incrémentale, jamais un big bang.

Ne modifie aucun fichier : ce skill produit uniquement un rapport.
