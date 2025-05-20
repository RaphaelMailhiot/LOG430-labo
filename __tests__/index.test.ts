// __tests__/index.test.js

import { execSync } from 'child_process';

describe('Vérification de la sortie de dist/index.js', () => {
  test('doit retourner la chaîne attendue', () => {
    // Exécute index.js
    const output = execSync('node dist/index.js')
    .toString()
    .trim();

    // Regarde le output du fichier
    expect(output).toBe('Hello World!LOG430-labo');
  });
});