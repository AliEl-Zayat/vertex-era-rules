import fc from 'fast-check';
import { describe, it } from 'vitest';

import plugin from '../src/plugin.js';
import { runRule } from './test-utils.js';

/**
 * Feature: comprehensive-rule-verification, Property 15: One SVG per icon file enforcement
 * For any icon file containing multiple SVG elements, the single-svg-per-file rule should detect a violation.
 * Validates: Requirements 2.7
 */
describe('Property 15: One SVG per icon file enforcement', () => {
	const rule = plugin.rules['single-svg-per-file'];

	// Generator for number of SVG elements (2 or more for violations)
	const multipleSvgCountGen = fc.integer({ min: 2, max: 5 });

	// Generator for SVG attributes
	const svgAttributesGen = fc.record({
		width: fc.oneof(fc.integer({ min: 1, max: 1000 }), fc.constant(undefined)),
		height: fc.oneof(fc.integer({ min: 1, max: 1000 }), fc.constant(undefined)),
		viewBox: fc.oneof(
			fc
				.tuple(
					fc.integer({ min: 0, max: 100 }),
					fc.integer({ min: 0, max: 100 }),
					fc.integer({ min: 1, max: 1000 }),
					fc.integer({ min: 1, max: 1000 }),
				)
				.map(([x, y, w, h]) => `"${x} ${y} ${w} ${h}"`),
			fc.constant(undefined),
		),
	});

	it('should detect any icon file with multiple SVG elements', () => {
		fc.assert(
			fc.property(multipleSvgCountGen, svgAttributesGen, (count, attrs) => {
				// Build multiple SVG elements
				const attrStrings: string[] = [];
				if (attrs.width !== undefined) attrStrings.push(`width={${attrs.width}}`);
				if (attrs.height !== undefined) attrStrings.push(`height={${attrs.height}}`);
				if (attrs.viewBox !== undefined) attrStrings.push(`viewBox=${attrs.viewBox}`);
				const attrString = attrStrings.length > 0 ? ' ' + attrStrings.join(' ') : '';

				const svgElements = Array(count)
					.fill(0)
					.map(() => `<svg${attrString}><path d="M10 10" /></svg>`)
					.join('\n    ');

				const code = `
import React from 'react';

const Icon = () => (
  <div>
    ${svgElements}
  </div>
);

export default Icon;
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should report an error for multiple SVGs
				return messages.length > 0 && messages[0].message.includes('Multiple SVG');
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow any icon file with a single SVG element', () => {
		fc.assert(
			fc.property(svgAttributesGen, (attrs) => {
				// Build single SVG element
				const attrStrings: string[] = [];
				if (attrs.width !== undefined) attrStrings.push(`width={${attrs.width}}`);
				if (attrs.height !== undefined) attrStrings.push(`height={${attrs.height}}`);
				if (attrs.viewBox !== undefined) attrStrings.push(`viewBox=${attrs.viewBox}`);
				const attrString = attrStrings.length > 0 ? ' ' + attrStrings.join(' ') : '';

				const code = `
import React from 'react';

const Icon = () => <svg${attrString}><path d="M10 10" /></svg>;

export default Icon;
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should NOT report an error for single SVG
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow icon files with no SVG elements', () => {
		// Generator for non-SVG JSX elements
		const nonSvgElementGen = fc.constantFrom(
			'<div>Hello</div>',
			'<span>World</span>',
			'<button>Click me</button>',
			'<p>Paragraph</p>',
		);

		fc.assert(
			fc.property(nonSvgElementGen, (element) => {
				const code = `
import React from 'react';

const Component = () => ${element};

export default Component;
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should NOT report an error for no SVGs
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect multiple SVGs even when nested in different elements', () => {
		fc.assert(
			fc.property(multipleSvgCountGen, (count) => {
				// Build multiple SVG elements nested in different containers
				const svgElements = Array(count)
					.fill(0)
					.map(
						(_, i) => `
    <div key={${i}}>
      <svg><path d="M${i * 10} ${i * 10}" /></svg>
    </div>`,
					)
					.join('\n');

				const code = `
import React from 'react';

const Icon = () => (
  <div>
    ${svgElements}
  </div>
);

export default Icon;
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should report an error for multiple SVGs
				return messages.length > 0 && messages[0].message.includes('Multiple SVG');
			}),
			{ numRuns: 100 },
		);
	});

	it('should allow single SVG with multiple nested elements', () => {
		// Generator for number of nested elements
		const nestedElementCountGen = fc.integer({ min: 1, max: 10 });

		// Generator for SVG child element types
		const svgChildElementGen = fc.constantFrom('path', 'circle', 'rect', 'polygon', 'ellipse');

		fc.assert(
			fc.property(nestedElementCountGen, svgChildElementGen, (count, elementType) => {
				// Build nested elements inside a single SVG
				const nestedElements = Array(count)
					.fill(0)
					.map((_, i) => `<${elementType} d="M${i * 10} ${i * 10}" />`)
					.join('\n      ');

				const code = `
import React from 'react';

const Icon = () => (
  <svg>
    ${nestedElements}
  </svg>
);

export default Icon;
`;

				// Run the rule
				const messages = runRule(rule, code);

				// Should NOT report an error - nested elements don't count as multiple SVGs
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});
});
