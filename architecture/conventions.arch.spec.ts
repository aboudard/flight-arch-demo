import { projectFiles } from 'archunit';

/**
 * Tests d'architecture — conventions de nommage (ArchUnitTS).
 * Doc : https://lukasniessen.github.io/ArchUnitTS/
 *
 * Les noms de fichiers portent un sens architectural :
 *   -page / -search / -edit  → composant « smart » (connaît le cas d'usage)
 *   -store                   → NgRx Signal Store
 *   -client                  → accès aux données (HTTP…)
 *   -coordinator             → orchestre plusieurs stores
 * Renommer un fichier est donc une décision d'architecture.
 */

const TS_CONFIG = 'tsconfig.app.json';

const STORE = /-store\.ts$/;
const CLIENT = /-client\.ts$/;

// « Tout sauf … » : lookahead négatif (on ignore aussi les *.spec.ts).
const NOT_STORE_NOR_CLIENT = /^(?!.*\.spec\.ts$)(?!.*-(store|client)\.ts$).*\.ts$/;
const NOT_ALLOWED_TO_USE_STORES =
  /^(?!.*\.spec\.ts$)(?!.*-(page|search|edit|coordinator|store)\.ts$).*\.ts$/;

describe('Conventions de nommage et d\'accès', () => {
  it('seuls les stores peuvent accéder aux clients (data access)', async () => {
    const rule = projectFiles(TS_CONFIG)
      .inFolder('src/app/**')
      .withName(NOT_STORE_NOR_CLIENT)
      .shouldNot()
      .dependOnFiles()
      .withName(CLIENT);
    await expect(rule).toPassAsync();
  });

  it('seuls les composants smart et les coordinators peuvent accéder aux stores', async () => {
    const rule = projectFiles(TS_CONFIG)
      .inFolder('src/app/**')
      .withName(NOT_ALLOWED_TO_USE_STORES)
      .shouldNot()
      .dependOnFiles()
      .withName(STORE);
    await expect(rule).toPassAsync();
  });

  it('un store ne doit jamais dépendre d\'un autre store (utiliser un coordinator)', async () => {
    // dependOnFiles() compte aussi l'auto-référence d'un fichier : on passe
    // donc par une règle personnalisée qui inspecte les imports du store.
    const importsAStore = /from\s+['"][^'"]*-store['"]/;
    const rule = projectFiles(TS_CONFIG)
      .inFolder('src/app/**')
      .withName(STORE)
      .should()
      .adhereTo(
        (file) => !importsAStore.test(file.content),
        'Un store ne doit pas importer un autre store : créer un *-coordinator',
      );
    await expect(rule).toPassAsync();
  });

  it('le code applicatif ne contient pas de dépendances circulaires', async () => {
    const rule = projectFiles(TS_CONFIG).inFolder('src/app/**').should().haveNoCycles();
    await expect(rule).toPassAsync();
  });
});
