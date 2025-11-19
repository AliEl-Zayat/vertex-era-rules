/**
 * @vertex-era/eslint-rules
 *
 * Comprehensive ESLint plugin with custom rules for React/TypeScript projects
 *
 * @example
 * ```typescript
 * import vertexEraRules from '@vertex-era/eslint-rules';
 *
 * export default [
 *   ...vertexEraRules.configs.recommended,
 *   // Your custom overrides
 * ];
 * ```
 */

import type { ESLint, Linter } from 'eslint';
import plugin from './plugin.js';

// Export the plugin as default
export default plugin;

// Named exports for convenience
export { plugin };
export const configs: Record<string, Linter.Config> = plugin.configs;
export const rules: ESLint.Plugin['rules'] = plugin.rules;
