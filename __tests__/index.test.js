// __tests__/index.test.js

const { execSync } = require('child_process');

describe('Vérification de la sortie de src/index.js', () => {
  test('doit retourner la chaîne attendue', () => {
    // Exécute index.js
    const output = execSync('node src/index.js')
      .toString()
      .trim();

    // Regarde le output du fichier
    expect(output).toBe('Hello World!\nLOG430-labo');
  });
});