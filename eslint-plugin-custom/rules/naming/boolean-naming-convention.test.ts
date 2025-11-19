import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils.js';

import namingRules from './eslint-plugin-naming-rules.js';

describe('boolean-naming-convention', () => {
	const rule = namingRules['boolean-naming-convention'];

	describe('Variable declarations', () => {
		it('should report error for boolean variable without is prefix', () => {
			const code = `const active: boolean = true;`;
			const messages = runRule(rule, code);

			expect(messages.length).toBeGreaterThan(0);
			expect(messages[0].message).toContain('should start with');
		});

		it('should not report error for boolean variable with is prefix', () => {
			const code = `const isActive: boolean = true;`;
			const messages = runRule(rule, code);

			expect(messages.length).toBe(0);
		});

		it('should not report error for non-boolean variables', () => {
			const code = `const active: string = "yes";`;
			const messages = runRule(rule, code);

			expect(messages.length).toBe(0);
		});

		it('should report error for boolean variable with lowercase after is', () => {
			const code = `const isactive: boolean = true;`;
			const messages = runRule(rule, code);

			expect(messages.length).toBeGreaterThan(0);
		});
	});

	describe('Function parameters', () => {
		it('should report error for boolean parameter without is prefix', () => {
			const code = `function test(active: boolean) {}`;
			const messages = runRule(rule, code);

			expect(messages.length).toBeGreaterThan(0);
		});

		it('should not report error for boolean parameter with is prefix', () => {
			const code = `function test(isActive: boolean) {}`;
			const messages = runRule(rule, code);

			expect(messages.length).toBe(0);
		});

		it('should work with arrow functions', () => {
			const code = `const test = (active: boolean) => {};`;
			const messages = runRule(rule, code);

			expect(messages.length).toBeGreaterThan(0);
		});
	});

	describe('Interface/Type properties', () => {
		it('should report error for boolean property without is prefix', () => {
			const code = `interface User { active: boolean; }`;
			const messages = runRule(rule, code);

			expect(messages.length).toBeGreaterThan(0);
		});

		it('should not report error for boolean property with is prefix', () => {
			const code = `interface User { isActive: boolean; }`;
			const messages = runRule(rule, code);

			expect(messages.length).toBe(0);
		});

		it('should work with type aliases', () => {
			const code = `type User = { active: boolean; };`;
			const messages = runRule(rule, code);

			expect(messages.length).toBeGreaterThan(0);
		});
	});
});
