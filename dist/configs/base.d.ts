import type { Linter } from 'eslint';
/**
 * Base configuration preset for @vertex-era-rules
 *
 * Includes:
 * - Core ESLint recommended rules
 * - TypeScript recommended, stylistic, and strict rules
 * - Import management and sorting
 * - Prettier integration
 * - TypeScript naming conventions (Type prefix: T, Interface prefix: I)
 * - Redux typed hooks enforcement (useAppSelector, useAppDispatch)
 *
 * This preset does NOT include any custom rules.
 * Use 'recommended' or 'strict' presets to enable custom rules.
 */
export declare const baseConfig: Linter.Config[];
//# sourceMappingURL=base.d.ts.map