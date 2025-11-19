/**
 * Main plugin entry point for @vertex-era-rules
 *
 * This file exports the ESLint plugin with all custom rules and configurations.
 */
import componentRules from '../eslint-rules/eslint-plugin-custom/rules/component/eslint-plugin-component-rules.js';
import errorHandlingRules from '../eslint-rules/eslint-plugin-custom/rules/error-handling/eslint-plugin-error-handling-rules.js';
import formsRules from '../eslint-rules/eslint-plugin-custom/rules/forms/eslint-plugin-forms-rules.js';
import iconRules from '../eslint-rules/eslint-plugin-custom/rules/icon/eslint-plugin-icon-rules.js';
import jsxRules from '../eslint-rules/eslint-plugin-custom/rules/jsx/eslint-plugin-jsx-rules.js';
import namingRules from '../eslint-rules/eslint-plugin-custom/rules/naming/eslint-plugin-naming-rules.js';
import readabilityRules from '../eslint-rules/eslint-plugin-custom/rules/readability/eslint-plugin-readability-rules.js';
import servicesRules from '../eslint-rules/eslint-plugin-custom/rules/services/eslint-plugin-services-rules.js';
import { baseConfig } from '../eslint-rules/configs/base.js';
import { recommendedConfig } from '../eslint-rules/configs/recommended.js';
import { strictConfig } from '../eslint-rules/configs/strict.js';
// Aggregate all custom rules
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
// Configuration presets
const configs = {
    base: baseConfig,
    recommended: recommendedConfig,
    strict: strictConfig,
};
// Plugin definition
const plugin = {
    meta: {
        name: '@vertex-era-rules',
        version: '1.0.0',
    },
    rules,
    configs,
};
export default plugin;
//# sourceMappingURL=plugin.js.map