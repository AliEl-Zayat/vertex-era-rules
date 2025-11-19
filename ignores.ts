import type { Linter } from 'eslint';

export const ignoresConfig: Linter.Config = {
	ignores: [
		'**/node_modules/**',
		'**/dist/**',
		'**/.git/**',
		'**/*.config.*',
		'**/vite.config.*',
		'**/build/**',
		'**/.next/**',
		'**/coverage/**',
		'remove_console.js',
	],
};
