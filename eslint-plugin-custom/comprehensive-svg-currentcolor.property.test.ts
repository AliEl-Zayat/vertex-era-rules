import fc from 'fast-check';
import { describe, it } from 'vitest';

import plugin from '../src/plugin.js';
import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 13: SVG currentColor enforcement
 * For any SVG element with fill or stroke attributes, if the value is not 'currentColor',
 * the svg-currentcolor rule should detect a violation.
 * Validates: Requirements 2.5
 */
describe('Property 13: SVG currentColor enforcement', () => {
	const rule = plugin.rules!['svg-currentcolor'];

	// Generator for color values (not currentColor)
	const colorGen = fc.oneof(
		fc.constant('red'),
		fc.constant('blue'),
		fc.constant('green'),
		fc.constant('#000000'),
		fc.constant('#fff'),
		fc.constant('#ffffff'),
		fc.constant('rgb(255, 0, 0)'),
		fc.constant('black'),
		fc.constant('white'),
	);

	// Generator for attribute type (fill or stroke)
	const attributeGen = fc.oneof(fc.constant('fill'), fc.constant('stroke'));

	// Generator for SVG element types
	const svgElementGen = fc.constantFrom('path', 'circle', 'rect', 'polygon', 'ellipse');

	it('should detect any SVG element with non-currentColor fill or stroke', () => {
		fc.assert(
			fc.property(colorGen, attributeGen, svgElementGen, (color, attribute, element) => {
				// Build code with non-currentColor value
				const code = `
const Icon = () => <svg><${element} ${attribute}="${color}" /></svg>;
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should report an error
				return messages.length > 0 && messages[0].message.includes('currentColor');
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow SVG elements with currentColor', () => {
		fc.assert(
			fc.property(attributeGen, svgElementGen, (attribute, element) => {
				// Build code with currentColor
				const code = `
const Icon = () => <svg><${element} ${attribute}="currentColor" /></svg>;
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should NOT report an error
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow SVG elements with none value', () => {
		fc.assert(
			fc.property(attributeGen, svgElementGen, (attribute, element) => {
				// Build code with 'none'
				const code = `
const Icon = () => <svg><${element} ${attribute}="none" /></svg>;
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should NOT report an error
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow SVG elements with gradient URLs', () => {
		// Generator for gradient IDs
		const gradientIdGen = fc
			.stringMatching(/^[a-zA-Z][a-zA-Z0-9_-]*$/)
			.map((id) => id || 'grad');

		fc.assert(
			fc.property(attributeGen, svgElementGen, gradientIdGen, (attribute, element, gradientId) => {
				// Build code with gradient URL
				const code = `
const Icon = () => <svg><${element} ${attribute}="url(#${gradientId})" /></svg>;
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should NOT report an error
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow multi-color SVGs', () => {
		// Generator for distinct colors
		const distinctColorsGen = fc
			.array(
				fc.constantFrom(
					'#ff0000',
					'#00ff00',
					'#0000ff',
					'#ffff00',
					'#ff00ff',
					'#00ffff',
					'red',
					'blue',
					'green',
					'yellow',
				),
				{ minLength: 2, maxLength: 4 },
			)
			.map((colors) => Array.from(new Set(colors)))
			.filter((colors) => colors.length >= 2);

		fc.assert(
			fc.property(attributeGen, svgElementGen, distinctColorsGen, (attribute, element, colors) => {
				// Build code with multiple different colors
				const elements = colors
					.map((color, i) => `<${element} ${attribute}="${color}" d="M${i * 10} ${i * 10}" />`)
					.join('\n');

				const code = `
const Icon = () => <svg>${elements}</svg>;
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should NOT report an error for multi-color SVGs
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect violations in nested SVG elements', () => {
		fc.assert(
			fc.property(colorGen, attributeGen, (color, attribute) => {
				// Build code with nested SVG elements
				const code = `
const Icon = () => (
	<svg>
		<g>
			<path ${attribute}="${color}" d="M10 10" />
		</g>
	</svg>
);
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should report an error
				return messages.length > 0 && messages[0].message.includes('currentColor');
			}),
			{ numRuns: 100 },
		);
	});
});
