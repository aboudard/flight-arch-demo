# Gestion d'état

> Règles vérifiées par `architecture/conventions.arch.spec.ts` (ArchUnitTS).

## Nommage des fichiers (porteur de sens)

| Suffixe                        | Rôle                                                     |
|--------------------------------|----------------------------------------------------------|
| `-page`, `-search`, `-edit`    | composant **smart** (connaît le cas d'usage)             |
| `-store`                       | NgRx **Signal Store**                                    |
| `-client`                      | **accès aux données** (HTTP…)                            |
| `-coordinator`                 | orchestre **plusieurs stores** pour un cas d'usage       |
| autre (`-card`, `-badge`…)     | composant **dumb** / utilitaire                          |

## Règles d'accès

1. **Seuls les stores** accèdent aux clients.
2. **Seuls les composants smart et les coordinators** accèdent aux stores.
3. **Un store n'accède jamais à un autre store** (risque de cycles et d'incohérences).
   Si un cas d'usage a besoin de plusieurs stores → créer un `*-coordinator`.
4. Pas de dépendance circulaire.

Conséquence : renommer un `*-coordinator` en `*-store` est **interdit** s'il injecte des stores.

## NgRx Signal Store — usage dans ce projet

- `signalStore(withState, withComputed, withMethods, withHooks)` depuis `@ngrx/signals`.
- Mises à jour via `patchState` uniquement.
- Appels asynchrones avec `rxMethod` (`@ngrx/signals/rxjs-interop`).
- Store global à une feature : `{ providedIn: 'root' }`.
  Store lié à un écran : fourni dans `providers` du composant smart.
