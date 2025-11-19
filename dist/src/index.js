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
import plugin from './plugin.js';
// Export the plugin as default
export default plugin;
// Named exports for convenience
export { plugin };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const configs = plugin.configs;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const rules = plugin.rules;
//# sourceMappingURL=index.js.map