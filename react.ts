import type { Linter } from 'eslint';

export const reactConfig: Linter.Config = {
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
};
