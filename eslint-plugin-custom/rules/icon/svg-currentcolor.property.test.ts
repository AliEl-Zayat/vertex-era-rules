import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import iconRules from './eslint-plugin-icon-rules';

describe('Property Tests: svg-currentcolor', () => {
	it('Property 13: SVG currentColor enforcement', () => {
		/**
		 * Feature: comprehensive-rule-verification, Property 13: SVG currentColor enforcement
		 * For any SVG element with fill or stroke attributes, if the value is not 'currentColor',
		 * the svg-currentcolor rule should detect a violation.
		 * Validates: Requirements 2.5
		 */

		// Generator for color values (not currentColor)
		const colorGen = fc.oneof(
			fc.constant('red'),
			fc.constant('blue'),
			fc.constant('green'),
			fc.constant('#000000'),
			fc.constant('#fff'),
			fc.constant('rgb(255, 0, 0)'),
			fc.constant('black'),
		);

		// Generator for attribute type
		const attributeGen = fc.oneof(fc.constant('fill'), fc.constant('stroke'));

		fc.assert(
			fc.property(colorGen, attributeGen, (color, attribute) => {
				// Build code with non-currentColor value
				const code = `
const Icon = () => <svg><path ${attribute}="${color}" /></svg>;
`;

				// Run the rule
				const messages = runRule(iconRules['svg-currentcolor'], code);

				// Should report an error
				expect(messages.length).toBeGreaterThan(0);
				expect(messages[0].message).toContain('currentColor');

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 13 (valid): currentColor should pass', () => {
		/**
		 * Feature: comprehensive-rule-verification, Property 13: SVG currentColor enforcement
		 * For any SVG element with fill or stroke set to 'currentColor', the rule should not report violations.
		 * Validates: Requirements 2.5
		 */

		// Generator for attribute type
		const attributeGen = fc.oneof(fc.constant('fill'), fc.constant('stroke'));

		fc.assert(
			fc.property(attributeGen, (attribute) => {
				// Build code with currentColor
				const code = `
const Icon = () => <svg><path ${attribute}="currentColor" /></svg>;
`;

				// Run the rule
				const messages = runRule(iconRules['svg-currentcolor'], code);

				// Should NOT report an error
				expect(messages.length).toBe(0);

				return true;
			}),
			{ numRuns: 100 },
		);
	});
});
