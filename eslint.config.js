const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  {
    files: ['cartridges/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        // SFCC globals
        dw: 'readonly',
        request: 'readonly',
        response: 'readonly',
        session: 'readonly',
        customer: 'readonly',
        // Node globals
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-unneeded-ternary': 'error',
      'prefer-template': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  eslintConfigPrettier,
];
