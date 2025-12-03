import eslint from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import type { Linter } from 'eslint';

import { namingConfig } from './naming.js';
import { reduxConfig } from './redux.js';
import { getPrettierConfigForESLint } from '../utils/prettier-detector.js';

/**
 * Base configuration preset for zayat-eslint-rules
 *
 * Includes:
 * - Core ESLint recommended rules
 * - TypeScript recommended, stylistic, and strict rules
 * - Import management and sorting
 * - Prettier integration (auto-detects existing config)
 * - TypeScript naming conventions (Type prefix: T, Interface prefix: I)
 * - Redux typed hooks enforcement (useAppSelector, useAppDispatch)
 * - eslint-config-prettier to prevent conflicts
 *
 * NOTE: Does NOT enforce interface vs type preference
 *
 * This preset does NOT include any custom rules.
 * Use 'recommended' or 'strict' presets to enable custom rules.
 */
export const baseConfig: Linter.Config[] = [
	// ESLint and TypeScript base configs
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...tseslint.configs.stylistic,
	...tseslint.configs.strict,
	// TypeScript configuration
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			ecmaVersion: 2022,
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
		rules: {
			// Non-type-aware rules (safe to use without project config)
			'@typescript-eslint/consistent-generic-constructors': 'error',
			'@typescript-eslint/array-type': 'error',
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/ban-tslint-comment': 'error',
			// Disable base rules in favor of TS versions
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': 'off',
			// Type imports
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
					fixStyle: 'separate-type-imports',
				},
			],
		},
	},
	// JavaScript configuration
	{
		files: ['**/*.{js,jsx}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			ecmaVersion: 2022,
			sourceType: 'module',
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
	},
	// Import management
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		plugins: {
			'import': pluginImport,
			'simple-import-sort': simpleImportSortPlugin,
			'unused-imports': unusedImportsPlugin,
		},
		rules: {
			// Unused imports & variables
			'unused-imports/no-unused-imports': 'error',
			'unused-imports/no-unused-vars': [
				'error',
				{
					vars: 'all',
					varsIgnorePattern: '^(_|k)',
					args: 'after-used',
					argsIgnorePattern: '^(_|k)',
				},
			],
			// Import sorting
			'import/order': 'off',
			'simple-import-sort/imports': [
				'error',
				{
					groups: [
						['^react$', '^react-dom$', '^react', '^@?\\w'],
						[
							'^@(?:assets|constants|types|lib|hooks|store|services|pages|components|ui|forms|contexts|providers)(?:/.*)?$',
							'^@/',
						],
						['^\\u0000'],
						['^\\.\\.(?!/?$)', '^\\./(?=.*/)(?!/?$)', '^\\./?$'],
						['^.+\\.s?css$', '^.+\\.(?:svg|png|jpe?g|gif|ico|ttf|woff2?)$'],
					],
				},
			],
			'simple-import-sort/exports': 'error',
		},
		settings: {
			'import/internal-regex':
				'^@(?:assets|constants|types|lib|hooks|store|services|pages|components|ui|forms|contexts|providers)(?:/.*)?$',
			'import/resolver': {
				typescript: {
					project: './tsconfig.json',
				},
			},
		},
	},
	// Prettier integration (auto-detects existing config)
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		plugins: {
			prettier: prettierPlugin,
		},
		rules: {
			'prettier/prettier': ['error', getPrettierConfigForESLint()],
		},
	},
	// React configuration
	{
		files: ['**/*.{js,jsx,ts,tsx}'],
		rules: {
			'react/react-in-jsx-scope': 'off',
			'no-console': 'error',
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
	// TypeScript naming conventions (type prefix: T, interface prefix: I)
	namingConfig,
	// Redux typed hooks enforcement
	reduxConfig,
	// eslint-config-prettier - MUST be last to override conflicting rules
	eslintConfigPrettier,
];

export default baseConfig;









