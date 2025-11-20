import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import iconRules from './eslint-plugin-icon-rules';

describe('Property Tests: memoized-export', () => {
	it('Property 12: Icon memoization enforcement', () => {
		/**
		 * Feature: comprehensive-rule-verification, Property 12: Icon memoization enforcement
		 * For any icon component export, if the export is not wrapped with memoization,
		 * the memoized-export rule should detect a violation.
		 * Validates: Requirements 2.4
		 */

		// Generator for component names (PascalCase)
		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Icon';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'I' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		fc.assert(
			fc.property(componentNameGen, (componentName) => {
				// Build code with unmemoized export
				const code = `
const ${componentName} = () => <svg><path /></svg>;
export default ${componentName};
`;

				// Run the rule
				const messages = runRule(iconRules['memoized-export'], code);

				// Should report an error
				expect(messages.length).toBeGreaterThan(0);
				expect(messages[0].message).toContain('memo');

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 12 (valid): Memoized exports should pass', () => {
		/**
		 * Feature: comprehensive-rule-verification, Property 12: Icon memoization enforcement
		 * For any icon component export wrapped with memo, the rule should not report violations.
		 * Validates: Requirements 2.4
		 */

		// Generator for component names (PascalCase)
		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Icon';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'I' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		fc.assert(
			fc.property(componentNameGen, (componentName) => {
				// Build code with memoized export
				const code = `
import { memo } from 'react';
const ${componentName} = () => <svg><path /></svg>;
export default memo(${componentName});
`;

				// Run the rule
				const messages = runRule(iconRules['memoized-export'], code);

				// Should NOT report an error
				expect(messages.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});
});
