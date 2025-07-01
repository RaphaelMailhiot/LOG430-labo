// eslint.config.cjs
const tsParser     = require('@typescript-eslint/parser');
const tsPlugin     = require('@typescript-eslint/eslint-plugin');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  // 0) Exclusions
  { ignores: ['node_modules/**', 'dist/**'] },

  // 1) JS / JSX
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      import: importPlugin,
    },
    rules: {
      // Style
      semi:        ['error', 'always'],
      quotes:      ['error', 'single', { avoidEscape: true }],
      // Import ordering
      'import/order': ['error', {
        groups: [['builtin','external','internal']],
        alphabetize: { order: 'asc', caseInsensitive: true },
      }],
    },
  },

  // 2) TS / TSX
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import:               importPlugin,
    },
    rules: {
      // Style (core + TS)
      semi:                                ['error', 'always'],
      quotes:                              ['error', 'single', { avoidEscape: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import/order':                      ['error', {
        groups: [['builtin','external','internal']],
        alphabetize: { order: 'asc', caseInsensitive: true },
      }],
    },
  },
];
