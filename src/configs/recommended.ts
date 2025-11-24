import customPlugin from '../plugin/index.js';
import { baseConfig } from './base.js';

/**
 * Recommended configuration preset for zayat-eslint-rules
 *
 * Extends the base configuration and enables commonly used custom rules.
 * This preset is suitable for most React/TypeScript projects.
 *
 * Enabled custom rules:
 * - one-component-per-file: Enforces one React component per file
 * - no-empty-catch: Prevents empty catch blocks
 * - no-inline-objects: Prevents inline object creation in JSX props
 * - no-inline-functions: Prevents inline function creation in JSX props
 * - boolean-naming-convention: Enforces boolean variable naming conventions
 * - no-nested-ternary: Prevents nested ternary expressions
 */
export const recommendedConfig = [
	...baseConfig,
	{
		plugins: {
			custom: customPlugin as unknown as Record<string, unknown>,
		},
		rules: {
			// Component rules
			'custom/one-component-per-file': 'error',
			// Error handling rules
			'custom/no-empty-catch': 'error',
			// JSX rules
			'custom/no-inline-objects': 'error',
			'custom/no-inline-functions': 'error',
			// Naming rules
			'custom/boolean-naming-convention': 'error',
			// Readability rules
			'custom/no-nested-ternary': 'error',
		},
	},
];

export default recommendedConfig;

