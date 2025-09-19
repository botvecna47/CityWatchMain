const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off',
      'no-undef': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-alert': 'warn',
      'no-debugger': 'warn',
      'no-unreachable': 'error',
      'no-unused-expressions': 'warn',
      'no-useless-return': 'warn',
      'prefer-const': 'warn',
      'no-var': 'warn',
      'eqeqeq': 'warn',
      'curly': 'warn'
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly'
      }
    },
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js',
      'prisma/migrations/**'
    ]
  }
];