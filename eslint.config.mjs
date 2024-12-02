import globals from 'globals';
import react from 'eslint-plugin-react';
import love from 'eslint-config-love';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['src/components/ThemeRegistry'],
  },
  love,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      react,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      'react/prop-types': 'off',
      complexity: 'off',
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [0, 1],
        },
      ],
      '@typescript-eslint/prefer-destructuring': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
    },
  },
  eslintConfigPrettier,
];
