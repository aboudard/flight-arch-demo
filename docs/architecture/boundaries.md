# Frontières et structure

> Ces règles sont appliquées automatiquement par Sheriff (`sheriff.config.ts`) et par les
> tests ArchUnitTS (`architecture/`). Ne jamais les modifier sans décision humaine.

## 1. Verticales (domaines)

```
src/app/domains/
├── ticketing/   réservation, billets          (domaine métier principal)
├── luggage/     bagages                        (domaine métier)
└── shared/      technique réutilisable         (traité comme un domaine par Sheriff)
```

- Un domaine n'accède **qu'à lui-même**, à `shared`, ou à l'**API publique** d'un autre domaine
  (`domains/<domaine>/api/`).
- `shared` reste petit et **technique**. Pas de logique métier dans `shared`.
- Pour la raison de ce choix, voir `docs/adr/0001-verticales-et-feature-slicing.md`.

## 2. Couches (dans chaque domaine)

| Dossier       | Tag Sheriff    | Contenu                                               | Peut importer          |
|---------------|----------------|-------------------------------------------------------|------------------------|
| `feature-*`   | `type:feature` | composants smart, stores locaux, coordinators          | ui, data, util, api    |
| `ui-*`        | `type:ui`      | composants « dumb » réutilisables                      | data (modèles), util   |
| `data`        | `type:data`    | clients (`-client`) et modèles partagés par plusieurs features | util          |
| `util-*`      | `type:util`    | fonctions utilitaires pures                            | rien                   |
| `api`         | `type:api`     | réexports choisis pour les autres domaines             | ui, data, util         |

On ne « remonte » jamais : une couche n'importe que des couches inférieures.

## 3. Principe de localité (feature slicing)

**Aussi local que possible, aussi global que nécessaire.**

- Un store, un client ou un composant utilisé par **une seule** feature reste **dans** cette feature.
- Dès qu'une **deuxième** feature du même domaine en a besoin → le descendre dans `data`, `ui-*`
  ou `util-*` du domaine (refactoring attendu, pas une exception).
- Si un **autre domaine** en a besoin → deux options, à **soumettre à l'utilisateur** :
  1. l'exposer via `domains/<domaine>/api/` (recommandé pour ce qui est spécifique au métier) ;
  2. le déplacer dans `shared` (uniquement si c'est technique et générique).
- **Toujours demander l'accord explicite de l'utilisateur avant d'ajouter quelque chose à `shared`.**

## 4. API de domaine

- Un fichier (`api/<domaine>-api.ts`) qui **réexporte** un petit nombre d'éléments choisis.
- Tout ce qui est exposé doit rester **rétrocompatible** : exposer le moins possible.

## 5. Conventions de nommage

Voir `docs/architecture/state-management.md` (section Nommage).
