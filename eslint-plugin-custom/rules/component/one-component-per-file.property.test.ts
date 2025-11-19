import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import componentRules from './eslint-plugin-component-rules';

describe('Property Tests: one-component-per-file', () => {
	it('Property 1: Component count validation', () => {
		/**
		 * Feature: additional-eslint-rules, Property 1: Component count validation
		 * For any file, the rule should report an error if and only if the file contains
		 * more than one component definition (excluding compound component children)
		 * Validates: Requirements 1.1, 1.3
		 */

		// Generator for component names (PascalCase)
		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Component';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'C' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		// Generator for number of components (1 to 5)
		const componentCountGen = fc.integer({ min: 1, max: 5 });

		fc.assert(
			fc.property(
				componentCountGen,
				fc.array(componentNameGen, { minLength: 5, maxLength: 5 }).map((names) => {
					// Ensure unique names
					return [...new Set(names)];
				}),
				(count, componentNames) => {
					// Build code with specified number of components
					const components = componentNames.slice(0, count).map((name) => {
						return `
							function ${name}() {
								return <div>${name}</div>;
							}
						`;
					});

					const code = `
						import React from 'react';
						${components.join('\n')}
						export default ${componentNames[0]};
					`;

					// Run the rule
					const messages = runRule(componentRules['one-component-per-file'], code);

					// Should report error if and only if count > 1
					if (count > 1) {
						expect(messages.length).toBeGreaterThan(0);
						expect(messages[0].message).toContain('component definitions');
					} else {
						expect(messages.length).toBe(0);
					}

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('Property 2: Compound component exemption', () => {
		/**
		 * Feature: additional-eslint-rules, Property 2: Compound component exemption
		 * For any file using the compound component pattern (Component.SubComponent = SubComponent),
		 * these child assignments should not be counted as separate components
		 * Validates: Requirements 1.2
		 */

		// Generator for component names
		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Component';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'C' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		// Generator for sub-component names
		const subComponentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'SubComponent';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'S' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		fc.assert(
			fc.property(
				componentNameGen,
				fc.array(subComponentNameGen, { minLength: 1, maxLength: 3 }).map((names) => {
					// Ensure unique names
					return [...new Set(names)];
				}),
				(parentName, subNames) => {
					// Build code with compound component pattern
					const subComponents = subNames.map((name) => {
						return `
							function ${name}() {
								return <div>${name}</div>;
							}
						`;
					});

					const assignments = subNames.map((name) => {
						return `${parentName}.${name} = ${name};`;
					});

					const code = `
						import React from 'react';
						
						function ${parentName}() {
							return <div>${parentName}</div>;
						}
						
						${subComponents.join('\n')}
						
						${assignments.join('\n')}
						
						export default ${parentName};
					`;

					// Run the rule
					const messages = runRule(componentRules['one-component-per-file'], code);

					// Should NOT report error for compound component pattern
					expect(messages.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('Property 3: Non-component code exemption', () => {
		/**
		 * Feature: additional-eslint-rules, Property 3: Non-component code exemption
		 * For any file containing helper functions, constants, or other non-component code
		 * alongside a single component, the rule should not report errors for the non-component code
		 * Validates: Requirements 1.4
		 */

		// Generator for component names
		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Component';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'C' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		// Generator for helper function names (camelCase)
		const helperNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'helper';
				return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[a-z]/.test(name));

		// Generator for number of helper functions (0 to 5)
		const helperCountGen = fc.integer({ min: 0, max: 5 });

		fc.assert(
			fc.property(
				componentNameGen,
				helperCountGen,
				fc.array(helperNameGen, { minLength: 5, maxLength: 5 }).map((names) => {
					// Ensure unique names
					return [...new Set(names)];
				}),
				(componentName, helperCount, helperNames) => {
					// Build code with helper functions
					const helpers = helperNames.slice(0, helperCount).map((name) => {
						return `
							function ${name}(value: string) {
								return value.toUpperCase();
							}
						`;
					});

					const code = `
						import React from 'react';
						
						${helpers.join('\n')}
						
						function ${componentName}() {
							return <div>${componentName}</div>;
						}
						
						export default ${componentName};
					`;

					// Run the rule
					const messages = runRule(componentRules['one-component-per-file'], code);

					// Should NOT report error for helper functions
					expect(messages.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('Property 4: Component definition detection', () => {
		/**
		 * Feature: additional-eslint-rules, Property 4: Component definition detection
		 * For any React component definition style (function declaration, arrow function, class component),
		 * the rule should correctly identify it as a component if and only if it returns JSX
		 * Validates: Requirements 1.5
		 */

		// Generator for component names
		const componentNameGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				const cleaned = s.replace(/[^a-zA-Z0-9]/g, '');
				if (cleaned.length === 0) return 'Component';
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'C' + cleaned;
				}
				return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		// Generator for component definition styles
		const componentStyleGen = fc.constantFrom(
			'function-declaration',
			'arrow-function',
			'function-expression',
			'class-component',
		);

		fc.assert(
			fc.property(
				fc.array(componentNameGen, { minLength: 2, maxLength: 2 }).map((names) => {
					// Ensure unique names
					return [...new Set(names)];
				}),
				fc.array(componentStyleGen, { minLength: 2, maxLength: 2 }),
				(componentNames, styles) => {
					// Skip if we don't have at least 2 unique names
					if (componentNames.length < 2) {
						return true;
					}

					// Build code with two components in different styles
					const components = componentNames.map((name, index) => {
						const style = styles[index];
						switch (style) {
							case 'function-declaration':
								return `
									function ${name}() {
										return <div>${name}</div>;
									}
								`;
							case 'arrow-function':
								return `
									const ${name} = () => <div>${name}</div>;
								`;
							case 'function-expression':
								return `
									const ${name} = function() {
										return <div>${name}</div>;
									};
								`;
							case 'class-component':
								return `
									class ${name} extends React.Component {
										render() {
											return <div>${name}</div>;
										}
									}
								`;
							default:
								return '';
						}
					});

					const code = `
						import React from 'react';
						${components.join('\n')}
						export default ${componentNames[0]};
					`;

					// Run the rule
					const messages = runRule(componentRules['one-component-per-file'], code);

					// Should report error for multiple components regardless of style
					expect(messages.length).toBeGreaterThan(0);
					expect(messages[0].message).toContain('component definitions');

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});
});
