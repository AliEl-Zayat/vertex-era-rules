import type { Linter } from 'eslint';
/**
 * Strict configuration preset for @vertex-era-rules
 *
 * Extends the recommended configuration and enables ALL custom rules.
 * This preset is for projects requiring maximum code quality and consistency.
 *
 * All custom rules enabled:
 * - one-component-per-file: Enforces one React component per file
 * - no-empty-catch: Prevents empty catch blocks
 * - form-config-extraction: Enforces form configuration extraction
 * - single-svg-per-file: Enforces one SVG per icon file
 * - svg-currentcolor: Enforces currentColor usage in SVG icons
 * - memoized-export: Enforces memoization for icon exports
 * - no-inline-objects: Prevents inline object creation in JSX props
 * - no-inline-functions: Prevents inline function creation in JSX props
 * - boolean-naming-convention: Enforces boolean variable naming conventions
 * - no-nested-ternary: Prevents nested ternary expressions
 * - no-response-data-return: Prevents returning response.data directly from services
 */
export declare const strictConfig: Linter.Config[];
//# sourceMappingURL=strict.d.ts.map