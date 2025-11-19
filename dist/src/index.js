/**
 * @vertex-era-rules
 *
 * Comprehensive ESLint plugin with custom rules for React/TypeScript projects
 *
 * @example
 * ```typescript
 * import vertexEraRules from '@vertex-era-rules';
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
export const configs = plugin.configs;
export const rules = plugin.rules;
//# sourceMappingURL=index.js.map