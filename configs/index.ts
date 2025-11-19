/**
 * Configuration presets for @vertex-era-rules
 *
 * Available presets:
 * - base: Core TypeScript, import, and Prettier rules (no custom rules)
 * - recommended: Base + commonly used custom rules (suitable for most projects)
 * - strict: Recommended + all custom rules enabled (maximum code quality)
 */

export { baseConfig } from './base.js';
export { recommendedConfig } from './recommended.js';
export { strictConfig } from './strict.js';
