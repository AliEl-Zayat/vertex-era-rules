import type { Linter } from 'eslint';
import prettierPlugin from 'eslint-plugin-prettier';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - prettier config is outside the eslint-rules project
import prettierConfigurations from '../prettier.config';

export const prettierConfig: Linter.Config = {
	files: ['**/*.{js,jsx,ts,tsx}'],
	plugins: {
		prettier: prettierPlugin,
	},
	rules: {
		'prettier/prettier': ['error', prettierConfigurations],
	},
};
