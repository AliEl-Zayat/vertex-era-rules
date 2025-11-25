import componentRules from "../rules/component/one-component-per-file.js";
import errorHandlingRules from "../rules/error-handling/no-empty-catch.js";
import formsRules from "../rules/forms/form-config-extraction.js";
import iconRules from "../rules/icon/icon-rules.js";
import jsxRules from "../rules/jsx/jsx-rules.js";
import namingRules from "../rules/naming/boolean-naming-convention.js";
import readabilityRules from "../rules/readability/no-nested-ternary.js";
import servicesRules from "../rules/services/no-response-data-return.js";

/**
 * All custom ESLint rules provided by zayat-eslint-rules.
 *
 * Rules are organized by category:
 * - Component: one-component-per-file
 * - Error handling: no-empty-catch
 * - Forms: form-config-extraction
 * - Icon: single-svg-per-file, svg-currentcolor, memoized-export
 * - JSX: no-inline-objects, no-inline-functions
 * - Naming: boolean-naming-convention
 * - Readability: no-nested-ternary
 * - Services: no-response-data-return
 */
const rules = {
  // Component rules
  "one-component-per-file": componentRules["one-component-per-file"],
  // Error handling rules
  "no-empty-catch": errorHandlingRules["no-empty-catch"],
  // Forms rules
  "form-config-extraction": formsRules["form-config-extraction"],
  // Icon rules
  "single-svg-per-file": iconRules["single-svg-per-file"],
  "svg-currentcolor": iconRules["svg-currentcolor"],
  "memoized-export": iconRules["memoized-export"],
  // JSX rules
  "no-inline-objects": jsxRules["no-inline-objects"],
  "no-inline-functions": jsxRules["no-inline-functions"],
  // Naming rules
  "boolean-naming-convention": namingRules["boolean-naming-convention"],
  // Readability rules
  "no-nested-ternary": readabilityRules["no-nested-ternary"],
  // Services rules
  "no-response-data-return": servicesRules["no-response-data-return"],
};

/**
 * Rule names available in the plugin
 */
export type TRuleName = keyof typeof rules;

/**
 * Rule severity type (compatible with ESLint's Linter types)
 */
type TRuleSeverity = "off" | "warn" | "error" | 0 | 1 | 2;

/**
 * Plugin configuration presets
 */
interface IPluginConfigs {
  recommended: {
    rules: Record<string, TRuleSeverity>;
  };
  strict: {
    rules: Record<string, TRuleSeverity>;
  };
}

/**
 * The zayat-eslint-rules ESLint plugin.
 *
 * Provides custom rules and configuration presets for React/TypeScript projects.
 *
 * Note: We use a custom interface here instead of extending ESLint.Plugin
 * because @typescript-eslint/utils RuleModule types aren't directly compatible
 * with ESLint's native Plugin type definitions. The plugin works correctly
 * at runtime - this is purely a TypeScript typing limitation.
 */
interface IZayatEslintPlugin {
  meta: {
    name: string;
    version: string;
  };
  rules: typeof rules;
  configs: IPluginConfigs;
}

const plugin: IZayatEslintPlugin = {
  meta: {
    name: "zayat-eslint-rules",
    version: "1.1.0",
  },
  rules,
  configs: {
    recommended: {
      rules: {
        "custom/one-component-per-file": "error",
        "custom/no-empty-catch": "error",
        "custom/form-config-extraction": "off",
        "custom/single-svg-per-file": "off",
        "custom/svg-currentcolor": "off",
        "custom/memoized-export": "off",
        "custom/no-inline-objects": "error",
        "custom/no-inline-functions": "error",
        "custom/boolean-naming-convention": "error",
        "custom/no-nested-ternary": "error",
        "custom/no-response-data-return": "off",
      },
    },
    strict: {
      rules: {
        "custom/one-component-per-file": "error",
        "custom/no-empty-catch": "error",
        "custom/form-config-extraction": "error",
        "custom/single-svg-per-file": "error",
        "custom/svg-currentcolor": "error",
        "custom/memoized-export": "error",
        "custom/no-inline-objects": "error",
        "custom/no-inline-functions": "error",
        "custom/boolean-naming-convention": "error",
        "custom/no-nested-ternary": "error",
        "custom/no-response-data-return": "error",
      },
    },
  },
};

export default plugin;
