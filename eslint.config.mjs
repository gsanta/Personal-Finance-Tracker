import js from "@eslint/js";
import globals from "globals";
import tseslint from '@typescript-eslint/eslint-plugin';
import { defineConfig } from "eslint/config";
import prettierPlugin from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import tsParser from '@typescript-eslint/parser';

export default defineConfig([
  {
    name: 'TypeScript and React files',
    plugins: {
      tseslint: tseslint,
      prettier: prettierPlugin,
      react: react,
      '@typescript-eslint': tseslint,
    },
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: true,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
          trailingComma: 'all',
          tabWidth: 2,
          semi: true,
          printWidth: 120,
        },
      ],
    }
  }
]);
