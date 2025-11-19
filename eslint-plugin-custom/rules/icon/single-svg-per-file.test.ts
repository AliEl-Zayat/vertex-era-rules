import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import iconRules from './eslint-plugin-icon-rules';

/**
 * Feature: custom-eslint-rules, Property 1: Single SVG per file enforcement
 * For any TypeScript/JavaScript file containing SVG elements, if the file contains
 * more than one SVG element, the linting system should report an error.
 * Validates: Requirements 1.1, 1.3
 */

describe('Property Test: single-svg-per-file', () => {
	it('Property 1: Single SVG per file enforcement - multiple SVGs should report error', () => {
		// Generator for SVG attributes
		const svgAttributeGen = fc.record({
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

		// Generator for a single SVG element
		const svgElementGen = svgAttributeGen.map((attrs) => {
			const attrStrings: string[] = [];
			if (attrs.width !== undefined) attrStrings.push(`width={${attrs.width}}`);
			if (attrs.height !== undefined) attrStrings.push(`height={${attrs.height}}`);
			if (attrs.viewBox !== undefined) attrStrings.push(`viewBox=${attrs.viewBox}`);

			const attrString = attrStrings.length > 0 ? ' ' + attrStrings.join(' ') : '';
			return `<svg${attrString}><path d="M10 10" /></svg>`;
		});

		// Generator for multiple SVG elements (2-5)
		const multipleSvgsGen = fc.array(svgElementGen, { minLength: 2, maxLength: 5 });

		fc.assert(
			fc.property(multipleSvgsGen, (svgElements) => {
				// Create a file with multiple SVG elements
				const code = `
					import React from 'react';
					
					const IconComponent = () => {
						return (
							<>
								${svgElements.join('\n\t\t\t\t')}
							</>
						);
					};
					
					export default IconComponent;
				`;

				// Run the rule
				const messages = runRule(iconRules['single-svg-per-file'], code);

				// Property: Files with multiple SVGs should report at least one error
				// (specifically, errors for the 2nd, 3rd, etc. SVGs)
				expect(messages.length).toBeGreaterThan(0);
				expect(messages.some((m) => m.message.includes('Multiple SVG icons found'))).toBe(
					true,
				);
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 1: Single SVG per file enforcement - single SVG should not report error', () => {
		// Generator for SVG attributes
		const svgAttributeGen = fc.record({
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
			fill: fc.oneof(
				fc.constantFrom('currentColor', '#000', '#fff', 'none'),
				fc.constant(undefined),
			),
		});

		// Generator for a single SVG element with nested elements
		const svgElementGen = svgAttributeGen.map((attrs) => {
			const attrStrings: string[] = [];
			if (attrs.width !== undefined) attrStrings.push(`width={${attrs.width}}`);
			if (attrs.height !== undefined) attrStrings.push(`height={${attrs.height}}`);
			if (attrs.viewBox !== undefined) attrStrings.push(`viewBox=${attrs.viewBox}`);
			if (attrs.fill !== undefined) attrStrings.push(`fill="${attrs.fill}"`);

			const attrString = attrStrings.length > 0 ? ' ' + attrStrings.join(' ') : '';

			// Include nested elements to ensure we're not counting nested paths/circles as separate SVGs
			return `<svg${attrString}>
				<path d="M10 10" />
				<circle cx="50" cy="50" r="40" />
				<rect x="10" y="10" width="30" height="30" />
			</svg>`;
		});

		fc.assert(
			fc.property(svgElementGen, (svgElement) => {
				// Create a file with a single SVG element
				const code = `
					import React from 'react';
					
					const IconComponent = () => {
						return ${svgElement};
					};
					
					export default IconComponent;
				`;

				// Run the rule
				const messages = runRule(iconRules['single-svg-per-file'], code);

				// Property: Files with a single SVG should not report any errors
				expect(messages.length).toBe(0);
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 1: Single SVG per file enforcement - no SVG should not report error', () => {
		// Generator for non-SVG JSX elements
		const nonSvgElementGen = fc.constantFrom(
			'<div>Hello</div>',
			'<span>World</span>',
			'<button>Click me</button>',
			'<p>Paragraph</p>',
			'<h1>Title</h1>',
		);

		fc.assert(
			fc.property(nonSvgElementGen, (element) => {
				// Create a file with no SVG elements
				const code = `
					import React from 'react';
					
					const Component = () => {
						return ${element};
					};
					
					export default Component;
				`;

				// Run the rule
				const messages = runRule(iconRules['single-svg-per-file'], code);

				// Property: Files with no SVGs should not report any errors
				expect(messages.length).toBe(0);
			}),
			{ numRuns: 100 },
		);
	});
});
