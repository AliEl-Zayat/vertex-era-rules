/**
 * Root-level configs re-exports
 * 
 * This folder provides an alternative import path for configurations.
 * All configs are re-exported from the main src/configs directory.
 * 
 * Usage:
 * ```typescript
 * import { baseConfig, recommendedConfig, strictConfig } from 'zayat-eslint-rules/configs';
 * 
 * export default [
 *   ...recommendedConfig,
 *   // Your custom rules here
 * ];
 * ```
 */

// Re-export all configs from src/configs
export { baseConfig } from '../dist/configs/base.js';
export { recommendedConfig } from '../dist/configs/recommended.js';
export { strictConfig } from '../dist/configs/strict.js';
export { typeAwareConfig } from '../dist/configs/type-aware.js';
export { namingConfig } from '../dist/configs/naming.js';
export { reduxConfig } from '../dist/configs/redux.js';

// Default export with all configs
import { baseConfig } from '../dist/configs/base.js';
import { recommendedConfig } from '../dist/configs/recommended.js';
import { strictConfig } from '../dist/configs/strict.js';
import { typeAwareConfig } from '../dist/configs/type-aware.js';
import { namingConfig } from '../dist/configs/naming.js';
import { reduxConfig } from '../dist/configs/redux.js';

export default {
	base: baseConfig,
	recommended: recommendedConfig,
	strict: strictConfig,
	typeAware: typeAwareConfig,
	naming: namingConfig,
	redux: reduxConfig,
};

