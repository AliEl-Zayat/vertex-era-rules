/**
 * zayat-eslint-rules
 * 
 * Custom ESLint rules and configurations for React/TypeScript projects
 * 
 * Features:
 * - 12 custom ESLint rules for React best practices
 * - Pre-configured ESLint configs (base, recommended, strict, type-aware)
 * - Prettier integration with auto-detection
 * - VS Code settings helper for conflict prevention
 * - TypeScript naming conventions (T prefix for types, I prefix for interfaces)
 * - Redux typed hooks enforcement
 */

// Plugin
export { default as plugin } from './plugin/index.js';

// Configs
export { baseConfig } from './configs/base.js';
export { recommendedConfig } from './configs/recommended.js';
export { strictConfig } from './configs/strict.js';
export { typeAwareConfig } from './configs/type-aware.js';
export { namingConfig } from './configs/naming.js';
export { reduxConfig } from './configs/redux.js';

// Utilities
export {
	detectPrettierConfig,
	createDefaultPrettierConfig,
	getPrettierConfigForESLint,
	DEFAULT_PRETTIER_CONFIG,
} from './utils/prettier-detector.js';

export {
	getRecommendedVSCodeSettings,
	getVSCodeSettingsJSON,
	getVSCodeExtensionsRecommendations,
	getVSCodeExtensionsJSON,
	getConflictPreventionGuide,
	RECOMMENDED_VSCODE_EXTENSIONS,
} from './utils/ide-settings.js';

// Default export for easy usage
import plugin from './plugin/index.js';
import { baseConfig } from './configs/base.js';
import { recommendedConfig } from './configs/recommended.js';
import { strictConfig } from './configs/strict.js';
import { typeAwareConfig } from './configs/type-aware.js';
import { detectPrettierConfig, getPrettierConfigForESLint } from './utils/prettier-detector.js';
import { getRecommendedVSCodeSettings, getVSCodeSettingsJSON } from './utils/ide-settings.js';

interface DefaultExport {
	plugin: typeof plugin;
	configs: {
		base: typeof baseConfig;
		recommended: typeof recommendedConfig;
		strict: typeof strictConfig;
		typeAware: typeof typeAwareConfig;
	};
	utils: {
		detectPrettierConfig: typeof detectPrettierConfig;
		getPrettierConfigForESLint: typeof getPrettierConfigForESLint;
		getRecommendedVSCodeSettings: typeof getRecommendedVSCodeSettings;
		getVSCodeSettingsJSON: typeof getVSCodeSettingsJSON;
	};
}

const defaultExport: DefaultExport = {
	plugin,
	configs: {
		base: baseConfig,
		recommended: recommendedConfig,
		strict: strictConfig,
		typeAware: typeAwareConfig,
	},
	utils: {
		detectPrettierConfig,
		getPrettierConfigForESLint,
		getRecommendedVSCodeSettings,
		getVSCodeSettingsJSON,
	},
};

export default defaultExport;

