import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default tseslint.config(
  // Paths ESLint should never look at.
  {
    ignores: [
      'dist',
      'dev-dist',
      'coverage',
      'node_modules',
      'graphify-out',
      'supabase',
      '*.config.js',
      '*.config.ts',
    ],
  },

  // Base JS + TypeScript recommended rules for app source.
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      globals: { ...globals.browser },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Conservative React hook rules only. The full react-hooks v6 "recommended"
      // set enables experimental React-Compiler rules that flag many long-standing
      // patterns in this codebase; those are noise for CI, not real bugs.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Legacy debt: the codebase intentionally uses `any` in several data-boundary
      // spots. Keep these visible as warnings rather than hard failures so CI stays
      // green while the typed-Supabase migration (#2) removes them incrementally.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow intentionally-unused args/vars when prefixed with underscore.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Surface as warnings for now; the typed-Supabase pass will clean these up.
      'no-useless-assignment': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
    },
  },

  // Test files: relax a couple of rules that are noisy in tests.
  {
    files: ['src/**/*.{test,spec}.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
)
