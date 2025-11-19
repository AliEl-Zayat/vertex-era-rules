import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import formsRules from './eslint-plugin-forms-rules';

describe('Property Tests: form-config-extraction', () => {
	it('Property 5: Inline configuration detection', () => {
		/**
		 * Feature: additional-eslint-rules, Property 5: Inline configuration detection
		 * For any useForm call with an inline configuration object, the rule should report
		 * an error suggesting extraction to a constants file
		 * Validates: Requirements 2.1
		 */

		// Generator for form configuration properties
		const formConfigPropertyGen = fc.constantFrom(
			'defaultValues',
			'schema',
			'resolver',
			'mode',
			'reValidateMode',
			'initialValues',
			'validationSchema',
		);

		// Generator for form hook names
		const formHookGen = fc.constantFrom('useForm', 'useFormik');

		// Generator for simple values (strings, numbers, booleans)
		const simpleValueGen = fc.oneof(
			fc.string().map((s) => JSON.stringify(s)),
			fc.integer().map((n) => n.toString()),
			fc.boolean().map((b) => b.toString()),
		);

		// Generator for inline configuration objects
		const inlineConfigGen = fc
			.array(fc.tuple(formConfigPropertyGen, simpleValueGen), { minLength: 1, maxLength: 3 })
			.map((props) => {
				// Create unique properties
				const uniqueProps = new Map(props);
				const entries = Array.from(uniqueProps.entries());
				return `{ ${entries.map(([key, value]) => `${key}: ${value}`).join(', ')} }`;
			});

		fc.assert(
			fc.property(formHookGen, inlineConfigGen, (hookName, inlineConfig) => {
				// Build code with inline form configuration
				const code = `
						import React from 'react';
						import { ${hookName} } from 'react-hook-form';
						
						function MyForm() {
							const form = ${hookName}(${inlineConfig});
							
							return <form>Form content</form>;
						}
						
						export default MyForm;
					`;

				// Run the rule
				const messages = runRule(formsRules['form-config-extraction'], code);

				// Should report error for inline configuration
				expect(messages.length).toBeGreaterThan(0);
				expect(messages[0].messageId).toBe('inlineConfig');
				expect(messages[0].message).toContain('constants file');

				return true;
			}),
			{ numRuns: 100 },
		);
	});

	it('Property 6: Constants file import exemption', () => {
		/**
		 * Feature: additional-eslint-rules, Property 6: Constants file import exemption
		 * For any form configuration imported from a file matching the pattern
		 * `*-constants.ts` or `*-constants.tsx`, the rule should not report errors
		 * Validates: Requirements 2.2
		 */

		// Generator for valid constants file names
		const constantsFileGen = fc
			.tuple(
				fc
					.string({ minLength: 1, maxLength: 20 })
					.map((s) => {
						// Clean to only lowercase letters and hyphens
						const cleaned = s.replace(/[^a-z-]/gi, '').toLowerCase();
						return cleaned.length > 0 ? cleaned : 'form';
					})
					.filter((s) => s.length > 0),
				fc.constantFrom('ts', 'tsx'),
			)
			.map(([name, ext]) => `./${name}-constants.${ext}`);

		// Generator for UPPER_SNAKE_CASE constant names
		const upperSnakeCaseGen = fc
			.string({ minLength: 1, maxLength: 15 })
			.map((s) => {
				// Clean to only uppercase letters, numbers, and underscores
				const cleaned = s.replace(/[^a-zA-Z0-9_]/g, '').toUpperCase();
				if (cleaned.length === 0) return 'FORM_CONFIG';
				// Ensure it starts with a letter
				const firstChar = cleaned.charAt(0);
				if (/[0-9]/.test(firstChar)) {
					return 'F' + cleaned;
				}
				return cleaned;
			})
			.filter((name) => name.length > 0 && /^[A-Z]/.test(name));

		// Generator for form hook names
		const formHookGen = fc.constantFrom('useForm', 'useFormik');

		fc.assert(
			fc.property(
				formHookGen,
				constantsFileGen,
				upperSnakeCaseGen,
				(hookName, constantsFile, constantName) => {
					// Build code with imported configuration from constants file
					const code = `
						import React from 'react';
						import { ${hookName} } from 'react-hook-form';
						import { ${constantName} } from '${constantsFile}';
						
						function MyForm() {
							const form = ${hookName}(${constantName});
							
							return <form>Form content</form>;
						}
						
						export default MyForm;
					`;

					// Run the rule
					const messages = runRule(formsRules['form-config-extraction'], code);

					// Should NOT report any errors for valid constants file import
					expect(messages.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('Property 7: Naming convention validation', () => {
		/**
		 * Feature: additional-eslint-rules, Property 7: Naming convention validation
		 * For any form configuration constant, the rule should report an error if and only if
		 * the constant name is not in UPPER_SNAKE_CASE format
		 * Validates: Requirements 2.3, 2.4
		 */

		// Generator for valid UPPER_SNAKE_CASE names
		const validUpperSnakeCaseGen = fc
			.tuple(
				fc.constantFrom('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'),
				fc.array(
					fc.oneof(
						fc.constantFrom(
							'A',
							'B',
							'C',
							'D',
							'E',
							'F',
							'G',
							'H',
							'I',
							'J',
							'K',
							'L',
							'M',
							'N',
							'O',
							'P',
							'Q',
							'R',
							'S',
							'T',
							'U',
							'V',
							'W',
							'X',
							'Y',
							'Z',
						),
						fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'),
						fc.constant('_'),
					),
					{ minLength: 0, maxLength: 15 },
				),
			)
			.map(([first, rest]) => first + rest.join(''));

		// Generator for invalid naming conventions (not UPPER_SNAKE_CASE)
		// All must be valid JavaScript identifiers
		const invalidNamingGen = fc.oneof(
			// camelCase - starts with lowercase
			fc
				.tuple(
					fc.constantFrom('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'),
					fc.array(
						fc.oneof(
							fc.constantFrom(
								'a',
								'b',
								'c',
								'd',
								'e',
								'f',
								'g',
								'h',
								'i',
								'j',
								'k',
								'l',
								'm',
							),
							fc.constantFrom(
								'A',
								'B',
								'C',
								'D',
								'E',
								'F',
								'G',
								'H',
								'I',
								'J',
								'K',
								'L',
								'M',
							),
						),
						{ minLength: 1, maxLength: 10 },
					),
				)
				.map(([first, rest]) => first + rest.join('')),
			// PascalCase - starts with uppercase but contains lowercase
			fc
				.tuple(
					fc.constantFrom('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'),
					fc.array(
						fc.constantFrom(
							'a',
							'b',
							'c',
							'd',
							'e',
							'f',
							'g',
							'h',
							'i',
							'j',
							'k',
							'l',
							'm',
						),
						{ minLength: 1, maxLength: 10 },
					),
				)
				.map(([first, rest]) => first + rest.join('')),
			// lowercase only
			fc
				.array(
					fc.constantFrom(
						'a',
						'b',
						'c',
						'd',
						'e',
						'f',
						'g',
						'h',
						'i',
						'j',
						'k',
						'l',
						'm',
					),
					{ minLength: 2, maxLength: 10 },
				)
				.map((chars) => chars.join('')),
		);

		// Generator for constants file names
		const constantsFileGen = fc.string({ minLength: 1, maxLength: 15 }).map((s) => {
			const cleaned = s.replace(/[^a-z-]/gi, '').toLowerCase();
			return cleaned.length > 0 ? `./${cleaned}-constants.ts` : './form-constants.ts';
		});

		// Generator for form hook names
		const formHookGen = fc.constantFrom('useForm', 'useFormik');

		// Test valid UPPER_SNAKE_CASE names (should NOT report errors)
		fc.assert(
			fc.property(
				formHookGen,
				constantsFileGen,
				validUpperSnakeCaseGen,
				(hookName, constantsFile, constantName) => {
					const code = `
						import React from 'react';
						import { ${hookName} } from 'react-hook-form';
						import { ${constantName} } from '${constantsFile}';
						
						function MyForm() {
							const form = ${hookName}(${constantName});
							
							return <form>Form content</form>;
						}
						
						export default MyForm;
					`;

					const messages = runRule(formsRules['form-config-extraction'], code);

					// Should NOT report naming convention errors for valid UPPER_SNAKE_CASE
					const namingErrors = messages.filter((m) => m.messageId === 'invalidNaming');
					expect(namingErrors.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);

		// Test invalid naming conventions (should report errors)
		fc.assert(
			fc.property(
				formHookGen,
				constantsFileGen,
				invalidNamingGen,
				(hookName, constantsFile, constantName) => {
					const code = `
						import React from 'react';
						import { ${hookName} } from 'react-hook-form';
						import { ${constantName} } from '${constantsFile}';
						
						function MyForm() {
							const form = ${hookName}(${constantName});
							
							return <form>Form content</form>;
						}
						
						export default MyForm;
					`;

					const messages = runRule(formsRules['form-config-extraction'], code);

					// Should report naming convention error for invalid naming
					const namingErrors = messages.filter((m) => m.messageId === 'invalidNaming');
					expect(namingErrors.length).toBeGreaterThan(0);
					expect(namingErrors[0].message).toContain('UPPER_SNAKE_CASE');

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('Property 8: Form configuration property detection', () => {
		/**
		 * Feature: additional-eslint-rules, Property 8: Form configuration property detection
		 * For any configuration object containing properties like defaultValues, schema, or resolver,
		 * the rule should correctly identify it as a form configuration requiring extraction
		 * Validates: Requirements 2.5
		 */

		// Generator for form configuration property names
		const formConfigPropertyGen = fc.constantFrom(
			'defaultValues',
			'schema',
			'resolver',
			'mode',
			'reValidateMode',
			'criteriaMode',
			'shouldFocusError',
			'shouldUnregister',
			'shouldUseNativeValidation',
			'delayError',
			'initialValues',
			'validationSchema',
			'validate',
			'validateOnBlur',
			'validateOnChange',
			'validateOnMount',
		);

		// Generator for non-form-config property names
		const nonFormConfigPropertyGen = fc.constantFrom(
			'name',
			'id',
			'className',
			'style',
			'onClick',
			'onChange',
			'value',
			'disabled',
			'placeholder',
			'type',
			'label',
			'description',
		);

		// Generator for simple values
		const simpleValueGen = fc.oneof(
			fc.string().map((s) => JSON.stringify(s)),
			fc.integer().map((n) => n.toString()),
			fc.boolean().map((b) => b.toString()),
			fc.constant('{}'),
			fc.constant('[]'),
		);

		// Generator for form hook names
		const formHookGen = fc.constantFrom('useForm', 'useFormik');

		// Test 1: Objects with form config properties should be detected
		fc.assert(
			fc.property(
				formHookGen,
				fc.array(formConfigPropertyGen, { minLength: 1, maxLength: 3 }),
				fc.array(nonFormConfigPropertyGen, { minLength: 0, maxLength: 2 }),
				(hookName, formConfigProps, nonFormConfigProps) => {
					// Create unique properties
					const uniqueFormProps = [...new Set(formConfigProps)];
					const uniqueNonFormProps = [...new Set(nonFormConfigProps)];

					// Build object with both form config and non-form config properties
					const allProps = [
						...uniqueFormProps.map((prop) => `${prop}: {}`),
						...uniqueNonFormProps.map((prop) => `${prop}: "value"`),
					];

					const inlineConfig = `{ ${allProps.join(', ')} }`;

					const code = `
						import React from 'react';
						import { ${hookName} } from 'react-hook-form';
						
						function MyForm() {
							const form = ${hookName}(${inlineConfig});
							
							return <form>Form content</form>;
						}
						
						export default MyForm;
					`;

					const messages = runRule(formsRules['form-config-extraction'], code);

					// Should report error because it contains form config properties
					expect(messages.length).toBeGreaterThan(0);
					expect(messages[0].messageId).toBe('inlineConfig');

					return true;
				},
			),
			{ numRuns: 100 },
		);

		// Test 2: Objects without form config properties should NOT be detected
		fc.assert(
			fc.property(
				formHookGen,
				fc.array(nonFormConfigPropertyGen, { minLength: 1, maxLength: 4 }),
				(hookName, nonFormConfigProps) => {
					// Create unique properties
					const uniqueProps = [...new Set(nonFormConfigProps)];

					// Build object with only non-form config properties
					const inlineConfig = `{ ${uniqueProps.map((prop) => `${prop}: "value"`).join(', ')} }`;

					const code = `
						import React from 'react';
						import { ${hookName} } from 'react-hook-form';
						
						function MyForm() {
							const form = ${hookName}(${inlineConfig});
							
							return <form>Form content</form>;
						}
						
						export default MyForm;
					`;

					const messages = runRule(formsRules['form-config-extraction'], code);

					// Should NOT report error because it doesn't contain form config properties
					expect(messages.length).toBe(0);

					return true;
				},
			),
			{ numRuns: 100 },
		);
	});
});
