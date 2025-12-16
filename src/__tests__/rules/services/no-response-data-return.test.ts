import { RuleTester } from '@typescript-eslint/rule-tester';
import { afterAll, describe, it } from 'vitest';
import { noResponseDataReturn } from '../../../rules/services/no-response-data-return.js';

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
});

ruleTester.run('no-response-data-return', noResponseDataReturn, {
	valid: [
		// Non-service file - should be ignored
		{
			code: `
				async function getData() {
					const response = await fetch('/api/data');
					return response.data;
				}
			`,
			filename: 'src/components/MyComponent.ts',
		},
		// Service file with transformed data
		{
			code: `
				async function getUser(id) {
					const response = await api.get('/users/' + id);
					return {
						id: response.data.id,
						name: response.data.name,
						email: response.data.email,
					};
				}
			`,
			filename: 'src/services/user-service.ts',
		},
		// Service file with variable assignment
		{
			code: `
				async function getUsers() {
					const response = await api.get('/users');
					const users = response.data;
					return users.map(user => transformUser(user));
				}
			`,
			filename: 'src/services/user-service.ts',
		},
		// Service file returning non-response data
		{
			code: `
				async function getConfig() {
					const config = await loadConfig();
					return config.data;
				}
			`,
			filename: 'src/services/config-service.ts',
		},
	],
	invalid: [
		// Direct response.data return in service file
		{
			code: `
				async function getUser(id) {
					const response = await api.get('/users/' + id);
					return response.data;
				}
			`,
			filename: 'src/services/user-service.ts',
			errors: [{ messageId: 'directResponseDataReturn' }],
		},
		// Direct res.data return
		{
			code: `
				async function getUsers() {
					const res = await api.get('/users');
					return res.data;
				}
			`,
			filename: 'src/services/user-service.ts',
			errors: [{ messageId: 'directResponseDataReturn' }],
		},
		// Direct result.data return
		{
			code: `
				async function fetchData() {
					const result = await api.get('/data');
					return result.data;
				}
			`,
			filename: 'src/services/data-service.ts',
			errors: [{ messageId: 'directResponseDataReturn' }],
		},
	],
});








