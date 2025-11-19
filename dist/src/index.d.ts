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
export default plugin;
export { plugin };
export declare const configs: Record<string, import("node_modules/@eslint/core/dist/cjs/types.cjs").LegacyConfigObject<import("node_modules/@eslint/core/dist/cjs/types.cjs").RulesConfig, import("node_modules/@eslint/core/dist/cjs/types.cjs").RulesConfig> | import("node_modules/@eslint/core/dist/cjs/types.cjs").ConfigObject<import("node_modules/@eslint/core/dist/cjs/types.cjs").RulesConfig> | import("node_modules/@eslint/core/dist/cjs/types.cjs").ConfigObject<import("node_modules/@eslint/core/dist/cjs/types.cjs").RulesConfig>[]> | undefined;
export declare const rules: Record<string, import("node_modules/@eslint/core/dist/cjs/types.cjs").RuleDefinition<import("node_modules/@eslint/core/dist/cjs/types.cjs").RuleDefinitionTypeOptions>> | undefined;
export type { ESLint } from 'eslint';
//# sourceMappingURL=index.d.ts.map