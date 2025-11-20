import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import iconRules from './eslint-plugin-icon-rules';

describe('Property Tests: single-svg-per-file', () => {
	it('Property 15: One SVG per icon file enforcement', () => {
		/**
		 * Feature: comprehensive-rule-verification, Property 15: One SVG per icon file enforcement
		 * For any icon file containing multiple SVG elements, the single-svg-per-file rule should detect a violation.
		 * Validates: Requirements 2.7
		 */

		// Generator for number of SVG elements (2 or more)
		const svgCountGen = fc.integer({ min: 2, max: 5 });

		fc.assert(
			fc.property(svgCountGen, (count) => {
				// Build code with multiple SVG elements
				const svgElements = Array(count)
					.fill(0)
					.map(() => '<svg><path /></svg>')
					.join('\n    ');

				const code = `
const Icon = () => (
  <div>
    ${svgElements}
  </div>
);
`;

				// Run the rule
				const messages = runRule(iconRules['single-svg-per-file'], code);

				// Should report an error
				expect(messages.length).toBeGreaterThan(0);
				expect(messages[0].message).toContain('Multiple SVG');

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 15 (valid): Single SVG should pass', () => {
		/**
		 * Feature: comprehensive-rule-verification, Property 15: One SVG per icon file enforcement
		 * For any icon file containing a single SVG element, the rule should not report violations.
		 * Validates: Requirements 2.7
		 */

		fc.assert(
			fc.property(fc.constant(true), () => {
				// Build code with single SVG element
				const code = `
const Icon = () => <svg><path /></svg>;
`;

				// Run the rule
				const messages = runRule(iconRules['single-svg-per-file'], code);

				// Should NOT report an error
				expect(messages.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});
});
