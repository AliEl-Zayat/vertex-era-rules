import customPlugin from '../plugin/index.js';
import { recommendedConfig } from './recommended.js';

/**
 * Strict configuration preset for zayat-eslint-rules
 *
 * Extends the recommended configuration and enables ALL custom rules.
 * This preset is for projects requiring maximum code quality and consistency.
 *
 * All custom rules enabled:
 * - one-component-per-file: Enforces one React component per file
 * - no-empty-catch: Prevents empty catch blocks
 * - form-config-extraction: Enforces form configuration extraction
 * - single-svg-per-file: Enforces one SVG per icon file
 * - svg-currentcolor: Enforces currentColor usage in SVG icons
 * - memoized-export: Enforces memoization for icon exports
 * - no-inline-objects: Prevents inline object creation in JSX props
 * - no-inline-functions: Prevents inline function creation in JSX props
 * - boolean-naming-convention: Enforces boolean variable naming conventions
 * - no-nested-ternary: Prevents nested ternary expressions
 * - no-response-data-return: Prevents returning response.data directly from services
 */
export const strictConfig = [
	...recommendedConfig,
	{
		plugins: {
			custom: customPlugin as unknown as Record<string, unknown>,
		},
		rules: {
			// Component rules (already in recommended)
			'custom/one-component-per-file': 'error',
			// Error handling rules (already in recommended)
			'custom/no-empty-catch': 'error',
			// Forms rules (NEW in strict)
			'custom/form-config-extraction': 'error',
			// JSX rules (already in recommended)
			'custom/no-inline-objects': 'error',
			'custom/no-inline-functions': 'error',
			// Naming rules (already in recommended)
			'custom/boolean-naming-convention': 'error',
			// Readability rules (already in recommended)
			'custom/no-nested-ternary': 'error',
			// Services rules (NEW in strict)
			'custom/no-response-data-return': 'error',
		},
	},
	// Icon rules - only apply to icon files
	{
		files: ['**/icons/**/*.{ts,tsx}', '**/icon/**/*.{ts,tsx}', '**/*Icon.{ts,tsx}'],
		plugins: {
			custom: customPlugin as unknown as Record<string, unknown>,
		},
		rules: {
			'custom/single-svg-per-file': 'error',
			'custom/svg-currentcolor': 'error',
			'custom/memoized-export': 'error',
		},
	},
];

export default strictConfig;

