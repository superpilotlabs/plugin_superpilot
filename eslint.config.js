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
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Rhino engine compatibility - disallow ES6+ features
      'object-shorthand': ['error', 'never'],
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TemplateLiteral',
          message: 'Template literals are not supported by Rhino. Use string concatenation instead.',
        },
        {
          selector: "CallExpression[callee.property.name='startsWith']",
          message: "String.prototype.startsWith is not supported by Rhino. Use indexOf() === 0 instead.",
        },
        {
          selector: "CallExpression[callee.property.name='endsWith']",
          message: "String.prototype.endsWith is not supported by Rhino. Use slice() or indexOf() instead.",
        },
      ],
    },
  },
  eslintConfigPrettier,
];
