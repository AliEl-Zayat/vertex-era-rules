import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { applyFixes, runRule } from '../../test-utils';

import iconRules from './eslint-plugin-icon-rules';

/**
 * Feature: custom-eslint-rules, Property 3: CurrentColor usage in single-color SVGs
 * For any SVG element with a single color, all fill and stroke attributes with hardcoded
 * color values (excluding 'none' and gradients) should be reported as errors with auto-fix
 * to currentColor.
 * Validates: Requirements 1.4
 */

describe('svg-currentcolor rule', () => {
	it('should report error for single-color SVG with hardcoded color', () => {
		const code = `
			import React from 'react';
			
			const Icon = () => {
				return (
					<svg>
						<path fill="#000000" d="M10 10" />
					</svg>
				);
			};
			
			export default Icon;
		`;

		const messages = runRule(iconRules['svg-currentcolor'], code);

		expect(messages.length).toBeGreaterThan(0);
		expect(messages[0].message).toContain('currentColor');
	});

	it('should not report error for multi-color SVG', () => {
		const code = `
			import React from 'react';
			
			const Icon = () => {
				return (
					<svg>
						<path fill="#ff0000" d="M10 10" />
						<path fill="#00ff00" d="M20 20" />
					</svg>
				);
			};
			
			export default Icon;
		`;

		const messages = runRule(iconRules['svg-currentcolor'], code);

		expect(messages.length).toBe(0);
	});

	it('should not report error for SVG with currentColor', () => {
		const code = `
			import React from 'react';
			
			const Icon = () => {
				return (
					<svg>
						<path fill="currentColor" d="M10 10" />
					</svg>
				);
			};
			
			export default Icon;
		`;

		const messages = runRule(iconRules['svg-currentcolor'], code);

		expect(messages.length).toBe(0);
	});

	it('should not report error for SVG with none', () => {
		const code = `
			import React from 'react';
			
			const Icon = () => {
				return (
					<svg>
						<path fill="none" stroke="#000000" d="M10 10" />
					</svg>
				);
			};
			
			export default Icon;
		`;

		const messages = runRule(iconRules['svg-currentcolor'], code);

		expect(messages.length).toBeGreaterThan(0);
		expect(messages[0].message).toContain('stroke');
	});

	it('should not report error for SVG with gradients', () => {
		const code = `
			import React from 'react';
			
			const Icon = () => {
				return (
					<svg>
						<defs>
							<linearGradient id="grad1">
								<stop offset="0%" stopColor="#ff0000" />
								<stop offset="100%" stopColor="#00ff00" />
							</linearGradient>
						</defs>
						<path fill="url(#grad1)" d="M10 10" />
					</svg>
				);
			};
			
			export default Icon;
		`;

		const messages = runRule(iconRules['svg-currentcolor'], code);

		expect(messages.length).toBe(0);
	});

	it('should auto-fix hardcoded colors to currentColor', () => {
		const code = `
			import React from 'react';
			
			const Icon = () => {
				return (
					<svg>
						<path fill="#000000" d="M10 10" />
					</svg>
				);
			};
			
			export default Icon;
		`;

		const messages = runRule(iconRules['svg-currentcolor'], code);
		const fixed = applyFixes(code, messages);

		expect(fixed).toContain('fill="currentColor"');
		expect(fixed).not.toContain('#000000');
	});

	it('should handle nested SVG elements', () => {
		const code = `
			import React from 'react';
			
			const Icon = () => {
				return (
					<svg>
						<g>
							<path fill="#000000" d="M10 10" />
							<circle fill="#000000" cx="50" cy="50" r="40" />
						</g>
					</svg>
				);
			};
			
			export default Icon;
		`;

		const messages = runRule(iconRules['svg-currentcolor'], code);

		expect(messages.length).toBeGreaterThan(0);
		expect(messages.every((m) => m.message.includes('currentColor'))).toBe(true);
	});
});

describe('Property Test: svg-currentcolor single-color enforcement', () => {
	it('Property 3: CurrentColor usage in single-color SVGs - hardcoded colors should report error', () => {
		// Generator for color values (hex, rgb, named colors)
		const hardcodedColorGen = fc.oneof(
			// Hex colors - use predefined hex values
			fc.constantFrom(
				'#000000',
				'#ffffff',
				'#ff0000',
				'#00ff00',
				'#0000ff',
				'#ffff00',
				'#ff00ff',
				'#00ffff',
			),
			// RGB colors
			fc
				.tuple(
					fc.integer({ min: 0, max: 255 }),
					fc.integer({ min: 0, max: 255 }),
					fc.integer({ min: 0, max: 255 }),
				)
				.map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`),
			// Named colors
			fc.constantFrom('red', 'blue', 'green', 'black', 'white', 'yellow', 'purple', 'orange'),
		);

		// Generator for color attributes (fill or stroke)
		const colorAttributeGen = fc.constantFrom('fill', 'stroke');

		// Generator for SVG elements with single hardcoded color
		const singleColorSvgGen = fc.record({
			color: hardcodedColorGen,
			attribute: colorAttributeGen,
			elementType: fc.constantFrom('path', 'circle', 'rect', 'polygon', 'ellipse'),
			elementCount: fc.integer({ min: 1, max: 5 }),
		});

		fc.assert(
			fc.property(singleColorSvgGen, (config) => {
				// Create SVG elements with the same color
				const elements = Array.from({ length: config.elementCount }, (_, i) => {
					if (config.elementType === 'path') {
						return `<path ${config.attribute}="${config.color}" d="M${i * 10} ${i * 10}" />`;
					} else if (config.elementType === 'circle') {
						return `<circle ${config.attribute}="${config.color}" cx="${50 + i * 10}" cy="${50 + i * 10}" r="40" />`;
					} else if (config.elementType === 'rect') {
						return `<rect ${config.attribute}="${config.color}" x="${i * 10}" y="${i * 10}" width="30" height="30" />`;
					} else if (config.elementType === 'polygon') {
						return `<polygon ${config.attribute}="${config.color}" points="0,0 50,0 25,50" />`;
					} else {
						return `<ellipse ${config.attribute}="${config.color}" cx="${50 + i * 10}" cy="${50 + i * 10}" rx="40" ry="30" />`;
					}
				}).join('\n\t\t\t\t\t');

				const code = `
					import React from 'react';
					
					const Icon = () => {
						return (
							<svg>
								${elements}
							</svg>
						);
					};
					
					export default Icon;
				`;

				// Run the rule
				const messages = runRule(iconRules['svg-currentcolor'], code);

				// Property: Single-color SVGs with hardcoded colors should report errors
				expect(messages.length).toBeGreaterThan(0);
				expect(messages.every((m) => m.message.includes('currentColor'))).toBe(true);
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 3: CurrentColor usage in single-color SVGs - currentColor should not report error', () => {
		// Generator for SVG elements already using currentColor
		const currentColorSvgGen = fc.record({
			attribute: fc.constantFrom('fill', 'stroke'),
			elementType: fc.constantFrom('path', 'circle', 'rect', 'polygon', 'ellipse'),
			elementCount: fc.integer({ min: 1, max: 5 }),
		});

		fc.assert(
			fc.property(currentColorSvgGen, (config) => {
				// Create SVG elements with currentColor
				const elements = Array.from({ length: config.elementCount }, (_, i) => {
					if (config.elementType === 'path') {
						return `<path ${config.attribute}="currentColor" d="M${i * 10} ${i * 10}" />`;
					} else if (config.elementType === 'circle') {
						return `<circle ${config.attribute}="currentColor" cx="${50 + i * 10}" cy="${50 + i * 10}" r="40" />`;
					} else if (config.elementType === 'rect') {
						return `<rect ${config.attribute}="currentColor" x="${i * 10}" y="${i * 10}" width="30" height="30" />`;
					} else if (config.elementType === 'polygon') {
						return `<polygon ${config.attribute}="currentColor" points="0,0 50,0 25,50" />`;
					} else {
						return `<ellipse ${config.attribute}="currentColor" cx="${50 + i * 10}" cy="${50 + i * 10}" rx="40" ry="30" />`;
					}
				}).join('\n\t\t\t\t\t');

				const code = `
					import React from 'react';
					
					const Icon = () => {
						return (
							<svg>
								${elements}
							</svg>
						);
					};
					
					export default Icon;
				`;

				// Run the rule
				const messages = runRule(iconRules['svg-currentcolor'], code);

				// Property: SVGs already using currentColor should not report errors
				expect(messages.length).toBe(0);
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 3: CurrentColor usage in single-color SVGs - none value should not report error', () => {
		// Generator for SVG elements with 'none' value
		const noneSvgGen = fc.record({
			attribute: fc.constantFrom('fill', 'stroke'),
			elementType: fc.constantFrom('path', 'circle', 'rect', 'polygon', 'ellipse'),
			elementCount: fc.integer({ min: 1, max: 5 }),
		});

		fc.assert(
			fc.property(noneSvgGen, (config) => {
				// Create SVG elements with 'none'
				const elements = Array.from({ length: config.elementCount }, (_, i) => {
					if (config.elementType === 'path') {
						return `<path ${config.attribute}="none" d="M${i * 10} ${i * 10}" />`;
					} else if (config.elementType === 'circle') {
						return `<circle ${config.attribute}="none" cx="${50 + i * 10}" cy="${50 + i * 10}" r="40" />`;
					} else if (config.elementType === 'rect') {
						return `<rect ${config.attribute}="none" x="${i * 10}" y="${i * 10}" width="30" height="30" />`;
					} else if (config.elementType === 'polygon') {
						return `<polygon ${config.attribute}="none" points="0,0 50,0 25,50" />`;
					} else {
						return `<ellipse ${config.attribute}="none" cx="${50 + i * 10}" cy="${50 + i * 10}" rx="40" ry="30" />`;
					}
				}).join('\n\t\t\t\t\t');

				const code = `
					import React from 'react';
					
					const Icon = () => {
						return (
							<svg>
								${elements}
							</svg>
						);
					};
					
					export default Icon;
				`;

				// Run the rule
				const messages = runRule(iconRules['svg-currentcolor'], code);

				// Property: SVGs with 'none' should not report errors
				expect(messages.length).toBe(0);
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 3: CurrentColor usage in single-color SVGs - gradients should not report error', () => {
		// Generator for gradient URLs - use alphanumeric IDs only
		const gradientUrlGen = fc
			.stringMatching(/^[a-zA-Z0-9_-]+$/)
			.map((id) => `url(#${id || 'grad'})`);

		// Generator for SVG elements with gradients
		const gradientSvgGen = fc.record({
			gradientUrl: gradientUrlGen,
			attribute: fc.constantFrom('fill', 'stroke'),
			elementType: fc.constantFrom('path', 'circle', 'rect', 'polygon', 'ellipse'),
			elementCount: fc.integer({ min: 1, max: 3 }),
		});

		fc.assert(
			fc.property(gradientSvgGen, (config) => {
				// Create SVG elements with gradient URLs
				const elements = Array.from({ length: config.elementCount }, (_, i) => {
					if (config.elementType === 'path') {
						return `<path ${config.attribute}="${config.gradientUrl}" d="M${i * 10} ${i * 10}" />`;
					} else if (config.elementType === 'circle') {
						return `<circle ${config.attribute}="${config.gradientUrl}" cx="${50 + i * 10}" cy="${50 + i * 10}" r="40" />`;
					} else if (config.elementType === 'rect') {
						return `<rect ${config.attribute}="${config.gradientUrl}" x="${i * 10}" y="${i * 10}" width="30" height="30" />`;
					} else if (config.elementType === 'polygon') {
						return `<polygon ${config.attribute}="${config.gradientUrl}" points="0,0 50,0 25,50" />`;
					} else {
						return `<ellipse ${config.attribute}="${config.gradientUrl}" cx="${50 + i * 10}" cy="${50 + i * 10}" rx="40" ry="30" />`;
					}
				}).join('\n\t\t\t\t\t');

				const code = `
					import React from 'react';
					
					const Icon = () => {
						return (
							<svg>
								${elements}
							</svg>
						);
					};
					
					export default Icon;
				`;

				// Run the rule
				const messages = runRule(iconRules['svg-currentcolor'], code);

				// Property: SVGs with gradients should not report errors
				expect(messages.length).toBe(0);
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 3: CurrentColor usage in single-color SVGs - auto-fix should replace with currentColor', () => {
		// Generator for hardcoded colors
		const hardcodedColorGen = fc.oneof(
			fc.constantFrom('#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff'),
			fc.constantFrom('red', 'blue', 'green', 'black', 'white'),
		);

		// Generator for color attributes
		const colorAttributeGen = fc.constantFrom('fill', 'stroke');

		fc.assert(
			fc.property(
				fc.record({
					color: hardcodedColorGen,
					attribute: colorAttributeGen,
				}),
				(config) => {
					const code = `
						import React from 'react';
						
						const Icon = () => {
							return (
								<svg>
									<path ${config.attribute}="${config.color}" d="M10 10" />
								</svg>
							);
						};
						
						export default Icon;
					`;

					// Run the rule and apply fixes
					const messages = runRule(iconRules['svg-currentcolor'], code);
					const fixed = applyFixes(code, messages);

					// Property: Auto-fix should replace hardcoded color with currentColor
					expect(fixed).toContain('currentColor');
					expect(fixed).not.toContain(config.color);
				},
			),
			{ numRuns: 100 },
		);
	});
});

describe('Property Test: svg-currentcolor multi-color exemption', () => {
	/**
	 * Feature: custom-eslint-rules, Property 4: Multi-color SVG exemption
	 * For any SVG element containing multiple distinct colors or gradients,
	 * hardcoded color values should not trigger errors.
	 * Validates: Requirements 1.5
	 */
	it('Property 4: Multi-color SVG exemption - multiple distinct colors should not report error', () => {
		// Generator for distinct color values
		const distinctColorGen = fc.constantFrom(
			'#ff0000',
			'#00ff00',
			'#0000ff',
			'#ffff00',
			'#ff00ff',
			'#00ffff',
			'#000000',
			'#ffffff',
			'#ff8800',
			'#8800ff',
			'red',
			'blue',
			'green',
			'yellow',
			'purple',
			'orange',
			'black',
			'white',
		);

		// Generator for multi-color SVG configurations
		const multiColorSvgGen = fc
			.record({
				colors: fc.array(distinctColorGen, { minLength: 2, maxLength: 5 }).map((colors) => {
					// Ensure colors are distinct
					return Array.from(new Set(colors)).slice(0, Math.max(2, colors.length));
				}),
				attribute: fc.constantFrom('fill', 'stroke'),
				elementType: fc.constantFrom('path', 'circle', 'rect', 'polygon', 'ellipse'),
			})
			.filter((config) => config.colors.length >= 2); // Ensure at least 2 distinct colors

		fc.assert(
			fc.property(multiColorSvgGen, (config) => {
				// Create SVG elements with different colors
				const elements = config.colors
					.map((color, i) => {
						if (config.elementType === 'path') {
							return `<path ${config.attribute}="${color}" d="M${i * 10} ${i * 10}" />`;
						} else if (config.elementType === 'circle') {
							return `<circle ${config.attribute}="${color}" cx="${50 + i * 10}" cy="${50 + i * 10}" r="40" />`;
						} else if (config.elementType === 'rect') {
							return `<rect ${config.attribute}="${color}" x="${i * 10}" y="${i * 10}" width="30" height="30" />`;
						} else if (config.elementType === 'polygon') {
							return `<polygon ${config.attribute}="${color}" points="${i * 10},${i * 10} ${50 + i * 10},${i * 10} ${25 + i * 10},${50 + i * 10}" />`;
						} else {
							return `<ellipse ${config.attribute}="${color}" cx="${50 + i * 10}" cy="${50 + i * 10}" rx="40" ry="30" />`;
						}
					})
					.join('\n\t\t\t\t\t');

				const code = `
					import React from 'react';
					
					const Icon = () => {
						return (
							<svg>
								${elements}
							</svg>
						);
					};
					
					export default Icon;
				`;

				// Run the rule
				const messages = runRule(iconRules['svg-currentcolor'], code);

				// Property: Multi-color SVGs should not report errors
				expect(messages.length).toBe(0);
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 4: Multi-color SVG exemption - SVGs with gradients should not report error', () => {
		// Generator for gradient definitions
		const gradientGen = fc.record({
			id: fc.stringMatching(/^[a-zA-Z0-9_-]+$/).map((id) => id || 'grad'),
			stopColors: fc.array(
				fc.constantFrom('#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'),
				{ minLength: 2, maxLength: 4 },
			),
		});

		// Generator for SVG with gradient
		const gradientSvgGen = fc.record({
			gradient: gradientGen,
			attribute: fc.constantFrom('fill', 'stroke'),
			elementType: fc.constantFrom('path', 'circle', 'rect'),
		});

		fc.assert(
			fc.property(gradientSvgGen, (config) => {
				// Create gradient definition
				const stops = config.gradient.stopColors
					.map((color, i) => {
						const offset = (i / (config.gradient.stopColors.length - 1)) * 100;
						return `<stop offset="${offset}%" stopColor="${color}" />`;
					})
					.join('\n\t\t\t\t\t\t');

				// Create element using gradient
				let element = '';
				if (config.elementType === 'path') {
					element = `<path ${config.attribute}="url(#${config.gradient.id})" d="M10 10 L50 50" />`;
				} else if (config.elementType === 'circle') {
					element = `<circle ${config.attribute}="url(#${config.gradient.id})" cx="50" cy="50" r="40" />`;
				} else {
					element = `<rect ${config.attribute}="url(#${config.gradient.id})" x="10" y="10" width="30" height="30" />`;
				}

				const code = `
					import React from 'react';
					
					const Icon = () => {
						return (
							<svg>
								<defs>
									<linearGradient id="${config.gradient.id}">
										${stops}
									</linearGradient>
								</defs>
								${element}
							</svg>
						);
					};
					
					export default Icon;
				`;

				// Run the rule
				const messages = runRule(iconRules['svg-currentcolor'], code);

				// Property: SVGs with gradients should not report errors
				expect(messages.length).toBe(0);
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 4: Multi-color SVG exemption - mixed colors and gradients should not report error', () => {
		// Generator for mixed color scenarios
		const mixedColorGen = fc.record({
			hardcodedColor: fc.constantFrom(
				'#ff0000',
				'#00ff00',
				'#0000ff',
				'red',
				'blue',
				'green',
			),
			gradientId: fc.stringMatching(/^[a-zA-Z0-9_-]+$/).map((id) => id || 'grad'),
			gradientColors: fc.array(
				fc.constantFrom('#ffff00', '#ff00ff', '#00ffff', 'yellow', 'purple', 'orange'),
				{ minLength: 2, maxLength: 3 },
			),
		});

		fc.assert(
			fc.property(mixedColorGen, (config) => {
				// Create gradient stops
				const stops = config.gradientColors
					.map((color, i) => {
						const offset = (i / (config.gradientColors.length - 1)) * 100;
						return `<stop offset="${offset}%" stopColor="${color}" />`;
					})
					.join('\n\t\t\t\t\t\t');

				const code = `
					import React from 'react';
					
					const Icon = () => {
						return (
							<svg>
								<defs>
									<linearGradient id="${config.gradientId}">
										${stops}
									</linearGradient>
								</defs>
								<path fill="${config.hardcodedColor}" d="M10 10" />
								<circle fill="url(#${config.gradientId})" cx="50" cy="50" r="40" />
							</svg>
						);
					};
					
					export default Icon;
				`;

				// Run the rule
				const messages = runRule(iconRules['svg-currentcolor'], code);

				// Property: Mixed colors and gradients should not report errors
				expect(messages.length).toBe(0);
			}),
			{ numRuns: 100 },
		);
	});
});
