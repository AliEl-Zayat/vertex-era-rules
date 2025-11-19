import type { Linter } from 'eslint';
import pluginImport from 'eslint-plugin-import';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';

export const importsConfig: Linter.Config = {
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

		// Type imports
		'@typescript-eslint/consistent-type-imports': [
			'error',
			{
				prefer: 'type-imports',
				fixStyle: 'separate-type-imports',
			},
		],

		// Node protocol
		'import/enforce-node-protocol-usage': ['error', 'always'],
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
};
