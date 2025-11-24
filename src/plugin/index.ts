import componentRules from '../rules/component/one-component-per-file.js';
import errorHandlingRules from '../rules/error-handling/no-empty-catch.js';
import formsRules from '../rules/forms/form-config-extraction.js';
import iconRules from '../rules/icon/icon-rules.js';
import jsxRules from '../rules/jsx/jsx-rules.js';
import namingRules from '../rules/naming/boolean-naming-convention.js';
import readabilityRules from '../rules/readability/no-nested-ternary.js';
import servicesRules from '../rules/services/no-response-data-return.js';

const rules = {
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

const plugin: {
	meta: { name: string; version: string };
	rules: Record<string, unknown>;
	configs: Record<string, { rules: Record<string, string> }>;
} = {
	meta: {
		name: 'zayat-eslint-rules',
		version: '1.0.0',
	},
	rules,
	configs: {
		recommended: {
			rules: {
				'custom/one-component-per-file': 'error',
				'custom/no-empty-catch': 'error',
				'custom/no-inline-objects': 'error',
				'custom/no-inline-functions': 'error',
				'custom/boolean-naming-convention': 'error',
				'custom/no-nested-ternary': 'error',
			},
		},
		strict: {
			rules: {
				'custom/one-component-per-file': 'error',
				'custom/no-empty-catch': 'error',
				'custom/form-config-extraction': 'error',
				'custom/no-inline-objects': 'error',
				'custom/no-inline-functions': 'error',
				'custom/boolean-naming-convention': 'error',
				'custom/no-nested-ternary': 'error',
				'custom/no-response-data-return': 'error',
			},
		},
	},
};

export default plugin;

