import { sameTag, SheriffConfig } from '@softarc/sheriff-core';

/**
 * Configuration Sheriff — frontières de modules et règles de dépendances.
 * Doc : https://sheriff.softarc.io/docs/dependency-rules
 *
 * 1) `modules` : on associe des TAGS aux dossiers grâce aux placeholders <...>.
 *    ex. src/app/domains/ticketing/feature-booking
 *        → ['domain:ticketing', 'type:feature']
 * 2) `depRules` : pour chaque tag de l'appelant, la liste des tags qu'il peut
 *    importer. TOUS les tags de l'appelant doivent être satisfaits.
 */
export const config: SheriffConfig = {
  entryFile: 'src/main.ts',
  enableBarrelLess: true,
  modules: {
    'src/app/domains/<domain>': {
      'feature-<feature>': ['domain:<domain>', 'type:feature'],
      'ui-<ui>': ['domain:<domain>', 'type:ui'],
      data: ['domain:<domain>', 'type:data'],
      'util-<util>': ['domain:<domain>', 'type:util'],
      api: ['domain:<domain>', 'type:api'],
    },
  },
  depRules: {
    // Verticales : un domaine n'accède qu'à lui-même, à « shared »,
    // ou à l'API publique (type:api) d'un autre domaine.
    'domain:*': [sameTag, 'domain:shared', 'type:api'],

    // Couches : on ne descend que vers le bas.
    'type:feature': ['type:ui', 'type:data', 'type:util', 'type:api'],
    'type:api': ['type:ui', 'type:data', 'type:util'],
    'type:ui': ['type:data', 'type:util', 'type:api'],
    'type:data': ['type:util', 'type:api'],
    'type:util': [],

    // Le shell (app.ts, app.routes.ts) ne charge que des features.
    root: ['type:feature'],
  },
};
