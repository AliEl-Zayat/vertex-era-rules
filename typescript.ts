import type { Linter } from 'eslint';
import globals from 'globals';

export const typescriptConfig: Linter.Config = {
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
			project: [
				'./tsconfig.app.json',
				'./tsconfig.node.json',
				'./eslint-rules/tsconfig.json',
			],
		},
	},
	rules: {
		// Type-aware rules requiring parserOptions.project
		'@typescript-eslint/prefer-optional-chain': 'error',
		'@typescript-eslint/non-nullable-type-assertion-style': 'error',
		'@typescript-eslint/prefer-string-starts-ends-with': 'error',
		'@typescript-eslint/prefer-find': 'error',
		'@typescript-eslint/prefer-includes': 'error',
		'@typescript-eslint/consistent-generic-constructors': 'error',
		'@typescript-eslint/array-type': 'error',
		'@typescript-eslint/no-unsafe-argument': 'error',
		'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/no-non-null-assertion': 'warn',
		'@typescript-eslint/ban-tslint-comment': 'error',

		// Disable base rules in favor of TS versions
		'no-unused-vars': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
	},
};
