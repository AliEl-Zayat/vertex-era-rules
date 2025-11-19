import type { Linter } from 'eslint';
/**
 * Type-aware configuration for TypeScript projects
 *
 * This config enables TypeScript rules that require type information.
 * It requires parserOptions.project to be configured.
 *
 * Usage:
 * ```javascript
 * import vertexEraRules from '@vertex-era/eslint-rules';
 *
 * export default [
 *   ...vertexEraRules.configs.recommended,
 *   ...vertexEraRules.configs.typeAware,
 *   {
 *     languageOptions: {
 *       parserOptions: {
 *         project: './tsconfig.json',
 *       },
 *     },
 *   },
 * ];
 * ```
 */
export declare const typeAwareConfig: Linter.Config[];
//# sourceMappingURL=type-aware.d.ts.map