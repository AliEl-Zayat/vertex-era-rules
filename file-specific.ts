import type { Linter } from 'eslint';

export const fileSpecificConfigs: Linter.Config[] = [
	{
		files: ['main.tsx', '**/main.tsx'],
		rules: {
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-var-requires': 'off',
			'@typescript-eslint/consistent-type-imports': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/naming-convention': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'import/no-unused-modules': 'off',
		},
	},
	{
		files: ['eslint-rules/eslint-plugin-custom/**/*.test.ts'],
		rules: {
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/restrict-template-expressions': 'off',
			'@typescript-eslint/no-deprecated': 'off',
			'unused-imports/no-unused-vars': 'off',
			'@typescript-eslint/no-require-imports': 'off',
		},
	},
	{
		files: [
			'eslint-rules/eslint-plugin-custom/**/*.ts',
			'!eslint-rules/eslint-plugin-custom/**/*.test.ts',
		],
		rules: {
			'no-console': 'off',
			'@typescript-eslint/no-unsafe-enum-comparison': 'off',
			'@typescript-eslint/no-unnecessary-condition': 'off',
			'@typescript-eslint/prefer-for-of': 'off',
			'@typescript-eslint/prefer-optional-chain': 'off',
			'custom/memoized-export': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-require-imports': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-return': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/restrict-plus-operands': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn',
		},
	},
];
