import type { Linter } from 'eslint';

export const namingConfig: Linter.Config = {
	files: ['**/*.{ts,tsx}'],
	rules: {
		'@typescript-eslint/naming-convention': [
			'error',
			{
				selector: 'typeAlias',
				format: ['PascalCase'],
				custom: {
					regex: '^T[A-Z]',
					match: true,
				},
			},
			{
				selector: 'interface',
				format: ['PascalCase'],
				custom: {
					regex: '^I[A-Z]',
					match: true,
				},
			},
			{
				selector: 'variable',
				format: ['camelCase', 'UPPER_CASE', 'PascalCase', 'snake_case'],
				leadingUnderscore: 'allow',
				filter: {
					regex: '^k[A-Z]',
					match: false,
				},
			},
			{
				selector: 'function',
				format: ['camelCase', 'PascalCase'],
				leadingUnderscore: 'allow',
			},
			{
				selector: 'parameter',
				format: ['camelCase'],
				leadingUnderscore: 'allow',
			},
		],
	},
};
