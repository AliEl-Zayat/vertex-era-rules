import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import formsRules from './eslint-plugin-forms-rules';

describe('Unit Tests: form-config-extraction', () => {
	it('should report error for inline useForm config', () => {
		const code = `
      import { useForm } from 'react-hook-form';
      
      function MyForm() {
        const form = useForm({
          defaultValues: {
            name: '',
            email: ''
          }
        });
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].messageId).toBe('inlineConfig');
		expect(messages[0].message).toContain('constants file');
	});

	it('should pass for imported config from constants file', () => {
		const code = `
      import { useForm } from 'react-hook-form';
      import { USER_FORM_CONFIG } from './user-form-constants.ts';
      
      function MyForm() {
        const form = useForm(USER_FORM_CONFIG);
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		expect(messages.length).toBe(0);
	});

	it('should pass for config with UPPER_SNAKE_CASE name', () => {
		const code = `
      import { useForm } from 'react-hook-form';
      import { LOGIN_FORM_CONFIG } from './login-form-constants.ts';
      
      function LoginForm() {
        const form = useForm(LOGIN_FORM_CONFIG);
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		expect(messages.length).toBe(0);
	});

	it('should report error for config with camelCase name', () => {
		const code = `
      import { useForm } from 'react-hook-form';
      import { userFormConfig } from './user-form-constants.ts';
      
      function MyForm() {
        const form = useForm(userFormConfig);
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].messageId).toBe('invalidNaming');
		expect(messages[0].message).toContain('UPPER_SNAKE_CASE');
	});

	it('should report error for config imported from non-constants file', () => {
		const code = `
      import { useForm } from 'react-hook-form';
      import { USER_FORM_CONFIG } from './user-form-config';
      
      function MyForm() {
        const form = useForm(USER_FORM_CONFIG);
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].messageId).toBe('invalidImportSource');
		expect(messages[0].message).toContain('*-constants.ts');
	});

	it('should detect inline config with schema property', () => {
		const code = `
      import { useForm } from 'react-hook-form';
      
      function MyForm() {
        const form = useForm({
          schema: validationSchema
        });
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].messageId).toBe('inlineConfig');
	});

	it('should detect inline config with resolver property', () => {
		const code = `
      import { useForm } from 'react-hook-form';
      import { zodResolver } from '@hookform/resolvers/zod';
      
      function MyForm() {
        const form = useForm({
          resolver: zodResolver(schema)
        });
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].messageId).toBe('inlineConfig');
	});

	it('should not report error for useForm without config', () => {
		const code = `
      import { useForm } from 'react-hook-form';
      
      function MyForm() {
        const form = useForm();
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		expect(messages.length).toBe(0);
	});

	it('should work with Formik useFormik hook', () => {
		const code = `
      import { useFormik } from 'formik';
      
      function MyForm() {
        const formik = useFormik({
          initialValues: {
            name: ''
          }
        });
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].messageId).toBe('inlineConfig');
	});

	it('should pass for config imported from .tsx constants file', () => {
		const code = `
      import { useForm } from 'react-hook-form';
      import { FORM_CONFIG } from './form-constants.tsx';
      
      function MyForm() {
        const form = useForm(FORM_CONFIG);
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		expect(messages.length).toBe(0);
	});

	it('should handle member expression config access', () => {
		const code = `
      import { useForm } from 'react-hook-form';
      import { FORM_CONFIGS } from './form-constants.ts';
      
      function MyForm() {
        const form = useForm(FORM_CONFIGS.user);
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		expect(messages.length).toBe(0);
	});

	it('should report error for member expression with camelCase base', () => {
		const code = `
      import { useForm } from 'react-hook-form';
      import { formConfigs } from './form-constants.ts';
      
      function MyForm() {
        const form = useForm(formConfigs.user);
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].messageId).toBe('invalidNaming');
	});

	it('should not report error for inline config without form properties', () => {
		const code = `
      import { useForm } from 'react-hook-form';
      
      function MyForm() {
        const form = useForm({
          customOption: true
        });
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		// Note: customOption is not a form config property, so this should pass
		expect(messages.length).toBe(0);
	});

	it('should handle default imports from constants file', () => {
		const code = `
      import { useForm } from 'react-hook-form';
      import USER_FORM_CONFIG from './user-form-constants.ts';
      
      function MyForm() {
        const form = useForm(USER_FORM_CONFIG);
        
        return <form />;
      }
    `;

		const messages = runRule(formsRules['form-config-extraction'], code);
		expect(messages.length).toBe(0);
	});
});
