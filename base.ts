/**
 * Base ESLint configuration export
 * 
 * This is a convenience re-export from the root level for easier imports.
 * 
 * Usage:
 * ```typescript
 * import baseConfig from 'zayat-eslint-rules/base';
 * 
 * export default [
 *   ...baseConfig,
 *   // Your custom rules here
 * ];
 * ```
 */

export { baseConfig, baseConfig as default } from './dist/configs/base.js';

