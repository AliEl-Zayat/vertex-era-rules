import { describe, expect, it } from 'vitest';

import { baseConfig, recommendedConfig, strictConfig } from './index.js';

describe('Configuration Presets', () => {
	describe('baseConfig', () => {
		it('should export an array of config objects', () => {
			expect(Array.isArray(baseConfig)).toBe(true);
			expect(baseConfig.length).toBeGreaterThan(0);
		});

		it('should not include custom rules', () => {
			const allRules = baseConfig.flatMap((config) => Object.keys(config.rules || {}));
			const customRules = allRules.filter((rule) => rule.startsWith('custom/'));
			expect(customRules).toHaveLength(0);
		});

		it('should include TypeScript rules', () => {
			const allRules = baseConfig.flatMap((config) => Object.keys(config.rules || {}));
			const tsRules = allRules.filter((rule) => rule.startsWith('@typescript-eslint/'));
			expect(tsRules.length).toBeGreaterThan(0);
		});

		it('should include import rules', () => {
			const allRules = baseConfig.flatMap((config) => Object.keys(config.rules || {}));
			const importRules = allRules.filter(
				(rule) => rule.startsWith('import/') || rule.startsWith('simple-import-sort/'),
			);
			expect(importRules.length).toBeGreaterThan(0);
		});

		it('should include prettier rules', () => {
			const allRules = baseConfig.flatMap((config) => Object.keys(config.rules || {}));
			const prettierRules = allRules.filter((rule) => rule.startsWith('prettier/'));
			expect(prettierRules.length).toBeGreaterThan(0);
		});
	});

	describe('recommendedConfig', () => {
		it('should export an array of config objects', () => {
			expect(Array.isArray(recommendedConfig)).toBe(true);
			expect(recommendedConfig.length).toBeGreaterThan(0);
		});

		it('should include base config', () => {
			// Recommended should have more configs than just the custom rules config
			expect(recommendedConfig.length).toBeGreaterThanOrEqual(baseConfig.length);
		});

		it('should include commonly used custom rules', () => {
			const allRules = recommendedConfig.flatMap((config) => Object.keys(config.rules || {}));
			const customRules = allRules.filter((rule) => rule.startsWith('custom/'));

			// Check for specific recommended rules
			expect(customRules).toContain('custom/one-component-per-file');
			expect(customRules).toContain('custom/no-empty-catch');
			expect(customRules).toContain('custom/no-inline-objects');
			expect(customRules).toContain('custom/no-inline-functions');
			expect(customRules).toContain('custom/boolean-naming-convention');
			expect(customRules).toContain('custom/no-nested-ternary');
		});

		it('should not include all custom rules', () => {
			const allRules = recommendedConfig.flatMap((config) => Object.keys(config.rules || {}));
			const customRules = allRules.filter((rule) => rule.startsWith('custom/'));

			// Should not include icon-specific rules in recommended
			expect(customRules).not.toContain('custom/single-svg-per-file');
			expect(customRules).not.toContain('custom/svg-currentcolor');
			expect(customRules).not.toContain('custom/memoized-export');
		});
	});

	describe('strictConfig', () => {
		it('should export an array of config objects', () => {
			expect(Array.isArray(strictConfig)).toBe(true);
			expect(strictConfig.length).toBeGreaterThan(0);
		});

		it('should include recommended config', () => {
			// Strict should have at least as many configs as recommended
			expect(strictConfig.length).toBeGreaterThanOrEqual(recommendedConfig.length);
		});

		it('should include all custom rules', () => {
			const allRules = strictConfig.flatMap((config) => Object.keys(config.rules || {}));
			const customRules = allRules.filter((rule) => rule.startsWith('custom/'));

			// Check for all 12 custom rules
			expect(customRules).toContain('custom/one-component-per-file');
			expect(customRules).toContain('custom/no-empty-catch');
			expect(customRules).toContain('custom/form-config-extraction');
			expect(customRules).toContain('custom/single-svg-per-file');
			expect(customRules).toContain('custom/svg-currentcolor');
			expect(customRules).toContain('custom/memoized-export');
			expect(customRules).toContain('custom/no-inline-objects');
			expect(customRules).toContain('custom/no-inline-functions');
			expect(customRules).toContain('custom/boolean-naming-convention');
			expect(customRules).toContain('custom/no-nested-ternary');
			expect(customRules).toContain('custom/no-response-data-return');
		});

		it('should set all custom rules to error level', () => {
			const lastConfig = strictConfig[strictConfig.length - 1];
			const customRules = Object.entries(lastConfig.rules || {}).filter(([rule]) =>
				rule.startsWith('custom/'),
			);

			customRules.forEach(([_rule, config]) => {
				expect(config).toBe('error');
			});
		});
	});

	describe('Config hierarchy', () => {
		it('should have base < recommended < strict in terms of rule count', () => {
			const baseRules = baseConfig.flatMap((config) => Object.keys(config.rules || {}));
			const recommendedRules = recommendedConfig.flatMap((config) =>
				Object.keys(config.rules || {}),
			);
			const strictRules = strictConfig.flatMap((config) => Object.keys(config.rules || {}));

			expect(recommendedRules.length).toBeGreaterThan(baseRules.length);
			expect(strictRules.length).toBeGreaterThan(recommendedRules.length);
		});
	});
});
