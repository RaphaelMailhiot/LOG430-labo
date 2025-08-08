// .eslintrc.js à la racine du projet
module.exports = {
  root: true,
  env: {
    browser: true,
    node:    true,
    es2021:  true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json'],  // nécessaire pour TS
    sourceType: 'module',
    ecmaVersion: 2021,
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'prettier'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',        // règles TS de base
    'plugin:import/recommended',                   // bonnes pratiques d’imports
    'plugin:import/typescript',                    // support TS pour import
    'prettier'                                     // désactive les règles ESLint en conflit avec Prettier
  ],
  settings: {
    'import/resolver': {
      typescript: {},                              // <root>/tsconfig.json
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      parser: 'espree',                            // parser JS par défaut
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off'
      }
    }
  ],
  rules: {
    // Prettier
    'prettier/prettier':            'error',

    // Style général
    'semi':                         ['error', 'always'],
    'quotes':                       ['error', 'single', { avoidEscape: true }],

    // Best practices
    'no-console':                   'warn',
    'import/order':                 ['error', {
      'groups': [['builtin','external','internal']],
      'alphabetize': { order: 'asc', caseInsensitive: true }
    }],

    // TS-specific
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], 
  }
}
