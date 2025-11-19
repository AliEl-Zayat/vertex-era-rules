import { TSESLint } from '@typescript-eslint/utils';
import * as fc from 'fast-check';
import { describe, it } from 'vitest';

import iconRules from './eslint-plugin-icon-rules';

const ruleTester = new TSESLint.RuleTester({
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
		ecmaFeatures: {
			jsx: true,
		},
	},
});

/**
 * Property Tests for Icon Rules
 */
describe('Property Tests - Icon Rules', () => {
	/**
	 * Property Test 2.2: Single SVG per file enforcement
	 * Feature: custom-eslint-rules, Property 1: Single SVG per file enforcement
	 *
	 * For any TypeScript/JavaScript file containing SVG elements, if the file contains
	 * more than one SVG element, the linting system should report an error.
	 *
	 * Validates: Requirements 1.1, 1.3
	 */
	describe('single-svg-per-file', () => {
		it('Property 1: Single SVG per file enforcement', () => {
			fc.assert(
				fc.property(
					fc.integer({ min: 2, max: 5 }),
					fc.array(fc.string(), { minLength: 1, maxLength: 3 }),
					(svgCount, pathData) => {
						const svgs = Array.from({ length: svgCount }, (_, i) => {
							const paths = pathData
								.map((d, j) => `<path key="${j}" d="${d.replace(/"/g, '')}" />`)
								.join('\n');
							return `<svg key="${i}">${paths}</svg>`;
						}).join('\n');

						const code = `
							const Component = () => (
								<div>
									${svgs}
								</div>
							);
						`;

						try {
							ruleTester.run(
								'single-svg-per-file',
								iconRules['single-svg-per-file'] as any,
								{
									valid: [],
									invalid: [
										{
											code,
											errors: Array.from({ length: svgCount - 1 }, () => ({
												messageId: 'multipleSvgs',
											})),
										},
									],
								},
							);
							return true;
						} catch {
							// intentionally ignored
							return false;
						}
					},
				),
				{ numRuns: 100 },
			);
		});

		it('should not report error for single SVG', () => {
			ruleTester.run('single-svg-per-file', iconRules['single-svg-per-file'] as any, {
				valid: [
					{
						code: `
							const Icon = () => (
								<svg>
									<path d="M0 0" />
								</svg>
							);
						`,
					},
				],
				invalid: [],
			});
		});
	});

	/**
	 * Property Tests for svg-currentcolor rule
	 */
	describe('svg-currentcolor', () => {
		/**
		 * Property Test 2.4: CurrentColor usage in single-color SVGs
		 * Feature: custom-eslint-rules, Property 3: CurrentColor usage in single-color SVGs
		 *
		 * Validates: Requirements 1.4
		 */
		it('Property 3: CurrentColor usage in single-color SVGs', () => {
			fc.assert(
				fc.property(
					fc.constantFrom(
						'#000000',
						'#ffffff',
						'#ff0000',
						'#00ff00',
						'#0000ff',
						'red',
						'blue',
						'green',
						'black',
						'white',
						'rgb(255, 0, 0)',
						'rgb(0, 255, 0)',
						'rgb(0, 0, 255)',
					),
					fc.constantFrom('fill', 'stroke'),
					(color, attribute) => {
						const code = `
							const Icon = () => (
								<svg>
									<path ${attribute}="${color}" />
								</svg>
							);
						`;

						try {
							ruleTester.run(
								'svg-currentcolor',
								iconRules['svg-currentcolor'] as any,
								{
									valid: [],
									invalid: [
										{
											code,
											errors: [{ messageId: 'useCurrentColor' }],
											output: `
							const Icon = () => (
								<svg>
									<path ${attribute}="currentColor" />
								</svg>
							);
						`,
										},
									],
								},
							);
							return true;
						} catch {
							// intentionally ignored
							return false;
						}
					},
				),
				{ numRuns: 100 },
			);
		});

		/**
		 * Property Test 2.5: Multi-color SVG exemption
		 * Feature: custom-eslint-rules, Property 4: Multi-color SVG exemption
		 *
		 * Validates: Requirements 1.5
		 */
		it('Property 4: Multi-color SVG exemption', () => {
			fc.assert(
				fc.property(
					fc.constantFrom(
						'#000000',
						'#ffffff',
						'#ff0000',
						'#00ff00',
						'#0000ff',
						'red',
						'blue',
						'green',
					),
					fc.constantFrom(
						'#111111',
						'#222222',
						'#ff00ff',
						'#00ffff',
						'yellow',
						'purple',
						'orange',
					),
					(color1, color2) => {
						const code = `
							const Icon = () => (
								<svg>
									<path fill="${color1}" />
									<path fill="${color2}" />
								</svg>
							);
						`;

						try {
							ruleTester.run(
								'svg-currentcolor',
								iconRules['svg-currentcolor'] as any,
								{
									valid: [{ code }],
									invalid: [],
								},
							);
							return true;
						} catch {
							// intentionally ignored
							return false;
						}
					},
				),
				{ numRuns: 100 },
			);
		});

		it('should not report error for currentColor', () => {
			ruleTester.run('svg-currentcolor', iconRules['svg-currentcolor'] as any, {
				valid: [
					{
						code: `
							const Icon = () => (
								<svg>
									<path fill="currentColor" />
								</svg>
							);
						`,
					},
				],
				invalid: [],
			});
		});

		it('should not report error for none', () => {
			ruleTester.run('svg-currentcolor', iconRules['svg-currentcolor'] as any, {
				valid: [
					{
						code: `
							const Icon = () => (
								<svg>
									<path fill="none" />
								</svg>
							);
						`,
					},
				],
				invalid: [],
			});
		});

		it('should not report error for gradients', () => {
			ruleTester.run('svg-currentcolor', iconRules['svg-currentcolor'] as any, {
				valid: [
					{
						code: `
							const Icon = () => (
								<svg>
									<defs>
										<linearGradient id="grad">
											<stop offset="0%" stopColor="red" />
											<stop offset="100%" stopColor="blue" />
										</linearGradient>
									</defs>
									<path fill="url(#grad)" />
								</svg>
							);
						`,
					},
				],
				invalid: [],
			});
		});
	});

	/**
	 * Property Tests for memoized-export rule
	 */
	describe('memoized-export', () => {
		/**
		 * Property Test 2.7: Memo wrapping verification
		 * Feature: custom-eslint-rules, Property 5: Memo wrapping verification
		 *
		 * Validates: Requirements 2.1
		 */
		it('Property 5: Memo wrapping verification', () => {
			fc.assert(
				fc.property(
					fc.constantFrom('IconComponent', 'MyIcon', 'CustomIcon', 'SvgIcon'),
					(componentName) => {
						const code = `
							const ${componentName} = () => <svg><path d="M0 0" /></svg>;
							export default ${componentName};
						`;

						try {
							ruleTester.run('memoized-export', iconRules['memoized-export'] as any, {
								valid: [],
								invalid: [
									{
										code,
										errors: [{ messageId: 'memoizeExport' }],
									},
								],
							});
							return true;
						} catch {
							// intentionally ignored
							return false;
						}
					},
				),
				{ numRuns: 100 },
			);
		});

		/**
		 * Property Test 2.8: Memo auto-fix correctness
		 * Feature: custom-eslint-rules, Property 6: Memo auto-fix correctness
		 *
		 * Validates: Requirements 2.2, 2.3
		 */
		it('Property 6: Memo auto-fix correctness', () => {
			fc.assert(
				fc.property(
					fc.constantFrom('IconComponent', 'MyIcon', 'CustomIcon', 'SvgIcon'),
					fc.boolean(),
					(componentName, hasReactImport) => {
						const reactImport = hasReactImport ? "import React from 'react';\n" : '';
						const code = `${reactImport}const ${componentName} = () => <svg><path d="M0 0" /></svg>;
export default ${componentName};`;

						const expectedOutput = hasReactImport
							? `import React, { memo } from 'react';
const ${componentName} = () => <svg><path d="M0 0" /></svg>;
export default memo(${componentName});`
							: `import { memo } from 'react';
const ${componentName} = () => <svg><path d="M0 0" /></svg>;
export default memo(${componentName});`;

						try {
							ruleTester.run('memoized-export', iconRules['memoized-export'] as any, {
								valid: [],
								invalid: [
									{
										code,
										errors: [{ messageId: 'memoizeExport' }],
										output: expectedOutput,
									},
								],
							});
							return true;
						} catch {
							// intentionally ignored
							return false;
						}
					},
				),
				{ numRuns: 100 },
			);
		});

		it('should not report error for memoized export', () => {
			ruleTester.run('memoized-export', iconRules['memoized-export'] as any, {
				valid: [
					{
						code: `
							import { memo } from 'react';
							const Icon = () => <svg><path d="M0 0" /></svg>;
							export default memo(Icon);
						`,
					},
				],
				invalid: [],
			});
		});

		it('should add memo import when React import exists', () => {
			const code = `
				import React from 'react';
				const Icon = () => <svg><path d="M0 0" /></svg>;
				export default Icon;
			`;

			ruleTester.run('memoized-export', iconRules['memoized-export'] as any, {
				valid: [],
				invalid: [
					{
						code,
						errors: [{ messageId: 'memoizeExport' }],
						output: `
				import React, { memo } from 'react';
				const Icon = () => <svg><path d="M0 0" /></svg>;
				export default memo(Icon);
			`,
					},
				],
			});
		});

		it('should create new React import when none exists', () => {
			const code = `
				const Icon = () => <svg><path d="M0 0" /></svg>;
				export default Icon;
			`;

			ruleTester.run(
				'memoized-export',
				iconRules['memoized-export'] as unknown as TSESLint.RuleModule<
					'memoizeExport',
					readonly unknown[]
				>,
				{
					valid: [],
					invalid: [
						{
							code,
							errors: [{ messageId: 'memoizeExport' }],
							output: `import { memo } from 'react';

				const Icon = () => <svg><path d="M0 0" /></svg>;
				export default memo(Icon);
			`,
						},
					],
				},
			);
		});
	});
});
