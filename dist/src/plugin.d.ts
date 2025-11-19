/**
 * Main plugin entry point for @vertex-era/eslint-rules
 *
 * This file exports the ESLint plugin with all custom rules and configurations.
 */
import type { ESLint, Linter } from 'eslint';
type VertexEraPlugin = ESLint.Plugin & {
    configs: {
        base: Linter.Config[];
        recommended: Linter.Config[];
        strict: Linter.Config[];
        typeAware: Linter.Config[];
    };
};
declare const plugin: VertexEraPlugin;
export default plugin;
//# sourceMappingURL=plugin.d.ts.map