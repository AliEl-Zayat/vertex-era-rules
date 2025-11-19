// Custom ESLint Plugin Entry Point
import type { ESLint } from 'eslint';

import componentRules from './rules/component/eslint-plugin-component-rules.js';
import errorHandlingRules from './rules/error-handling/eslint-plugin-error-handling-rules.js';
import formsRules from './rules/forms/eslint-plugin-forms-rules.js';
import iconRules from './rules/icon/eslint-plugin-icon-rules.js';
import jsxRules from './rules/jsx/eslint-plugin-jsx-rules.js';
import namingRules from './rules/naming/eslint-plugin-naming-rules.js';
import readabilityRules from './rules/readability/eslint-plugin-readability-rules.js';
import servicesRules from './rules/services/eslint-plugin-services-rules.js';

// Rules will be imported here as they are implemented
const rules: Record<string, any> = {
	// Component rules
	'one-component-per-file': componentRules['one-component-per-file'],

	// Error handling rules
	'no-empty-catch': errorHandlingRules['no-empty-catch'],

	// Forms rules
	'form-config-extraction': formsRules['form-config-extraction'],

	// Icon rules
	'single-svg-per-file': iconRules['single-svg-per-file'],
	'svg-currentcolor': iconRules['svg-currentcolor'],
	'memoized-export': iconRules['memoized-export'],

	// JSX rules
	'no-inline-objects': jsxRules['no-inline-objects'],
	'no-inline-functions': jsxRules['no-inline-functions'],

	// Naming rules
	'boolean-naming-convention': namingRules['boolean-naming-convention'],

	// Readability rules
	'no-nested-ternary': readabilityRules['no-nested-ternary'],

	// Services rules
	'no-response-data-return': servicesRules['no-response-data-return'],
};

const plugin: ESLint.Plugin = {
	meta: {
		name: 'eslint-plugin-custom',
		version: '1.0.0',
	},
	rules,
	configs: {
		recommended: {
			rules: {
				'custom/one-component-per-file': 'error',
				'custom/single-svg-per-file': 'error',
				'custom/svg-currentcolor': 'error',
				'custom/memoized-export': 'error',
				'custom/no-inline-objects': 'error',
				'custom/no-inline-functions': 'error',
				'custom/boolean-naming-convention': 'error',
			},
		},
	},
};

// eslint-disable-next-line custom/memoized-export -- This is an ESLint plugin, not a React component
export default plugin;
