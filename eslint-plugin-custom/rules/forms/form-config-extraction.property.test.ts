import fc from 'fast-check';
import { describe, it } from 'vitest';

import { runRule } from '../../test-utils.js';

import formsRules from './eslint-plugin-forms-rules.js';

/**
 * Feature: comprehensive-rule-verification, Property 16: Form config extraction enforcement
 * For any inline form configuration object, the form-config-extraction rule should detect a violation.
 * Validates: Requirements 2.8
 */
describe('Property 16: Form config extraction enforcement', () => {
	const rule = formsRules['form-config-extraction'];

	// Generator for form hook names
	const formHookName = fc.constantFrom('useForm', 'useFormik');

	// Generator for form config property names
	const formConfigProperty = fc.constantFrom(
		'defaultValues',
		'schema',
		'resolver',
		'mode',
		'initialValues',
		'validationSchema',
	);

	// Generator for valid UPPER_SNAKE_CASE constant names
	const upperSnakeCaseName = fc
		.array(fc.stringMatching(/^[A-Z][A-Z0-9]*$/), { minLength: 1, maxLength: 3 })
		.map((parts) => parts.join('_'));

	// Generator for invalid camelCase constant names
	const camelCaseName = fc
		.tuple(fc.stringMatching(/^[a-z][a-z0-9]*$/), fc.stringMatching(/^[A-Z][a-z0-9]*$/))
		.map(([first, second]) => `${first}${second}`);

	// Generator for constants file paths
	const constantsFilePath = fc
		.stringMatching(/^[a-z][a-z0-9-]*$/)
		.map((name) => `./${name}-constants.ts`);

	// Generator for non-constants file paths
	const nonConstantsFilePath = fc
		.stringMatching(/^[a-z][a-z0-9-]*$/)
		.map((name) => `./${name}-config.ts`);

	it('should detect violation for any inline form config object', { timeout: 10000 }, () => {
		fc.assert(
			fc.property(formHookName, formConfigProperty, (hookName, configProp) => {
				const code = `
          import { ${hookName} } from 'react-hook-form';
          
          function MyForm() {
            const form = ${hookName}({
              ${configProp}: {}
            });
            
            return <form />;
          }
        `;
				const messages = runRule(rule, code);

				// Should report at least one error for inline config
				return messages.length > 0 && messages[0].messageId === 'inlineConfig';
			}),
			{ numRuns: 100 },
		);
	});

	it('should not detect violation for any config imported from constants file with UPPER_SNAKE_CASE', () => {
		fc.assert(
			fc.property(
				formHookName,
				upperSnakeCaseName,
				constantsFilePath,
				(hookName, configName, filePath) => {
					const code = `
          import { ${hookName} } from 'react-hook-form';
          import { ${configName} } from '${filePath}';
          
          function MyForm() {
            const form = ${hookName}(${configName});
            
            return <form />;
          }
        `;
					const messages = runRule(rule, code);

					// Should not report any errors
					return messages.length === 0;
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should detect violation for any config with camelCase naming', () => {
		fc.assert(
			fc.property(
				formHookName,
				camelCaseName,
				constantsFilePath,
				(hookName, configName, filePath) => {
					const code = `
          import { ${hookName} } from 'react-hook-form';
          import { ${configName} } from '${filePath}';
          
          function MyForm() {
            const form = ${hookName}(${configName});
            
            return <form />;
          }
        `;
					const messages = runRule(rule, code);

					// Should report error for invalid naming
					return (
						messages.length > 0 && messages.some((m) => m.messageId === 'invalidNaming')
					);
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should detect violation for any config imported from non-constants file', () => {
		fc.assert(
			fc.property(
				formHookName,
				upperSnakeCaseName,
				nonConstantsFilePath,
				(hookName, configName, filePath) => {
					const code = `
          import { ${hookName} } from 'react-hook-form';
          import { ${configName} } from '${filePath}';
          
          function MyForm() {
            const form = ${hookName}(${configName});
            
            return <form />;
          }
        `;
					const messages = runRule(rule, code);

					// Should report error for invalid import source
					return (
						messages.length > 0 &&
						messages.some((m) => m.messageId === 'invalidImportSource')
					);
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should not detect violation for any form hook without config argument', () => {
		fc.assert(
			fc.property(formHookName, (hookName) => {
				const code = `
          import { ${hookName} } from 'react-hook-form';
          
          function MyForm() {
            const form = ${hookName}();
            
            return <form />;
          }
        `;
				const messages = runRule(rule, code);

				// Should not report any errors
				return messages.length === 0;
			}),
			{ numRuns: 100 },
		);
	});

	it('should detect violation for any inline config with multiple properties', () => {
		fc.assert(
			fc.property(
				formHookName,
				fc.array(formConfigProperty, { minLength: 2, maxLength: 3 }),
				(hookName, configProps) => {
					const uniqueProps = [...new Set(configProps)];
					const propsString = uniqueProps.map((prop) => `${prop}: {}`).join(',\n');

					const code = `
          import { ${hookName} } from 'react-hook-form';
          
          function MyForm() {
            const form = ${hookName}({
              ${propsString}
            });
            
            return <form />;
          }
        `;
					const messages = runRule(rule, code);

					// Should report at least one error for inline config
					return messages.length > 0 && messages[0].messageId === 'inlineConfig';
				},
			),
			{ numRuns: 100 },
		);
	});

	it('should not detect violation for member expression config access from constants', () => {
		fc.assert(
			fc.property(
				formHookName,
				upperSnakeCaseName,
				constantsFilePath,
				fc.stringMatching(/^[a-z][a-z0-9]*$/),
				(hookName, configName, filePath, memberName) => {
					const code = `
          import { ${hookName} } from 'react-hook-form';
          import { ${configName} } from '${filePath}';
          
          function MyForm() {
            const form = ${hookName}(${configName}.${memberName});
            
            return <form />;
          }
        `;
					const messages = runRule(rule, code);

					// Should not report any errors
					return messages.length === 0;
				},
			),
			{ numRuns: 100 },
		);
	});
});
