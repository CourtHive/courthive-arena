import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import sonarjs from 'eslint-plugin-sonarjs';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      sonarjs,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      ...sonarjs.configs.recommended.rules,
      'sonarjs/cognitive-complexity': ['warn', 30],

      'sonarjs/void-use': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/todo-tag': 'off',
      'sonarjs/no-commented-code': 'off',
      'sonarjs/no-alphabetical-sort': 'off',
      'sonarjs/prefer-regexp-exec': 'off',
      'sonarjs/argument-type': 'off',
    },
  },
];
