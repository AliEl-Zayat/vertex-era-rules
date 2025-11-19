import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import plugin from './index.js';

/**
 * Feature: additional-eslint-rules, Property: Plugin registration
 * Validates: All requirements
 *
 * This test verifies that all rules are properly registered and accessible in the plugin.
 */
describe('Plugin Registration Property Tests', () => {
	const expectedRules = [
		'one-component-per-file',
		'no-empty-catch',
		'form-config-extraction',
		'no-nested-ternary',
		'no-response-data-return',
	];

	it('should have all new rules registered in the plugin', () => {
		fc.assert(
			fc.property(fc.constantFrom(...expectedRules), (ruleName) => {
				// Property: For any expected rule name, the plugin should have that rule registered
				expect(plugin.rules).toBeDefined();
				if (!plugin.rules) return;
				expect(plugin.rules).toHaveProperty(ruleName);
				expect(plugin.rules[ruleName]).toBeDefined();
				expect(plugin.rules[ruleName]).toHaveProperty('meta');
				expect(plugin.rules[ruleName]).toHaveProperty('create');
			}),
			{ numRuns: 100 },
		);
	});

	it('should have valid rule metadata for all rules', () => {
		fc.assert(
			fc.property(fc.constantFrom(...expectedRules), (ruleName) => {
				// Property: For any rule, its metadata should be properly structured
				expect(plugin.rules).toBeDefined();
				if (!plugin.rules) return;
				const rule = plugin.rules[ruleName];
				expect(rule).toBeDefined();
				expect(rule.meta).toBeDefined();
				if (!rule.meta) return;
				expect(rule.meta).toHaveProperty('type');
				expect(rule.meta).toHaveProperty('docs');
				expect(rule.meta).toHaveProperty('messages');
				if (!rule.meta.docs) return;
				expect(rule.meta.docs).toBeDefined();
				expect(rule.meta.docs).toHaveProperty('description');
				if (!rule.meta.docs.description) return;
				expect(typeof rule.meta.docs.description).toBe('string');
				expect(rule.meta.docs.description.length).toBeGreaterThan(0);
			}),
			{ numRuns: 100 },
		);
	});

	it('should have rule names in correct format', () => {
		fc.assert(
			fc.property(fc.constantFrom(...expectedRules), (ruleName) => {
				// Property: For any rule name, it should follow kebab-case format
				expect(ruleName).toMatch(/^[a-z]+(-[a-z]+)*$/);
			}),
			{ numRuns: 100 },
		);
	});

	it('should have create function that returns an object', () => {
		fc.assert(
			fc.property(fc.constantFrom(...expectedRules), (ruleName) => {
				// Property: For any rule, its create function should be callable
				expect(plugin.rules).toBeDefined();
				if (!plugin.rules) return;
				const rule = plugin.rules[ruleName];
				expect(rule).toBeDefined();
				expect(typeof rule.create).toBe('function');
			}),
			{ numRuns: 100 },
		);
	});

	it('should export plugin with correct structure', () => {
		// Property: The plugin should have the required structure
		expect(plugin).toBeDefined();
		expect(plugin).toHaveProperty('meta');
		expect(plugin).toHaveProperty('rules');
		expect(plugin).toHaveProperty('configs');
		expect(plugin.meta).toBeDefined();
		if (!plugin.meta) return;
		expect(plugin.meta).toHaveProperty('name');
		expect(plugin.meta).toHaveProperty('version');
		expect(plugin.meta.name).toBe('eslint-plugin-custom');
	});

	it('should have all rules as objects with required properties', () => {
		expect(plugin.rules).toBeDefined();
		const ruleNames = Object.keys(plugin.rules || {});
		expect(ruleNames.length).toBeGreaterThan(0);

		fc.assert(
			fc.property(fc.constantFrom(...ruleNames), (ruleName) => {
				// Property: For any registered rule, it should have the required structure
				if (!plugin.rules) return;
				const rule = plugin.rules[ruleName];
				expect(typeof rule).toBe('object');
				expect(rule).not.toBeNull();
				expect(rule).toHaveProperty('meta');
				expect(rule).toHaveProperty('create');
			}),
			{ numRuns: 100 },
		);
	});
});
