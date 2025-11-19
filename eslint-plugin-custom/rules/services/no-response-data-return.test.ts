import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import servicesRules from './eslint-plugin-services-rules';

describe('Unit Tests: no-response-data-return', () => {
	it('should report error for direct response.data return in service file', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchUsers() {
				const response = await axios.get('/api/users');
				return response.data;
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/user-service.ts',
		);
		expect(messages.length).toBe(1);
		expect(messages[0].messageId).toBe('directResponseDataReturn');
		expect(messages[0].message).toContain('transformation');
	});

	it('should pass for transformed response in service file', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchUsers() {
				const response = await axios.get('/api/users');
				const data = response.data;
				return data.map(user => ({ ...user, processed: true }));
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/user-service.ts',
		);
		expect(messages.length).toBe(0);
	});

	it('should pass for response.data in non-service file', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchUsers() {
				const response = await axios.get('/api/users');
				return response.data;
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/hooks/useUsers.ts',
		);
		expect(messages.length).toBe(0);
	});

	it('should detect nested service directory', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchUserProfile() {
				const response = await axios.get('/api/user/profile');
				return response.data;
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/user/profile-service.ts',
		);
		expect(messages.length).toBe(1);
		expect(messages[0].messageId).toBe('directResponseDataReturn');
	});

	it('should pass for destructured response', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchUsers() {
				const response = await axios.get('/api/users');
				const { data } = response;
				return data;
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/user-service.ts',
		);
		expect(messages.length).toBe(0);
	});

	it('should pass for validated response', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchUsers() {
				const response = await axios.get('/api/users');
				const data = response.data;
				if (!data) {
					throw new Error('No data received');
				}
				return data;
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/user-service.ts',
		);
		expect(messages.length).toBe(0);
	});

	it('should pass for type-casted response', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchUsers() {
				const response = await axios.get('/api/users');
				const data = response.data as User[];
				return data;
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/user-service.ts',
		);
		expect(messages.length).toBe(0);
	});

	it('should pass for response with property access', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchUsers() {
				const response = await axios.get('/api/users');
				const data = response.data;
				return data.users;
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/user-service.ts',
		);
		expect(messages.length).toBe(0);
	});

	it('should detect response.data with different variable names', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchUsers() {
				const res = await axios.get('/api/users');
				return res.data;
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/user-service.ts',
		);
		expect(messages.length).toBe(1);
		expect(messages[0].messageId).toBe('directResponseDataReturn');
	});

	it('should detect apiResponse.data pattern', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchUsers() {
				const apiResponse = await axios.get('/api/users');
				return apiResponse.data;
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/user-service.ts',
		);
		expect(messages.length).toBe(1);
		expect(messages[0].messageId).toBe('directResponseDataReturn');
	});

	it('should detect result.data pattern', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchUsers() {
				const result = await axios.get('/api/users');
				return result.data;
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/user-service.ts',
		);
		expect(messages.length).toBe(1);
		expect(messages[0].messageId).toBe('directResponseDataReturn');
	});

	it('should handle optional chaining response?.data', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchUsers() {
				const response = await axios.get('/api/users');
				return response?.data;
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/user-service.ts',
		);
		expect(messages.length).toBe(1);
		expect(messages[0].messageId).toBe('directResponseDataReturn');
	});

	it('should pass for spread operator transformation', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchUsers() {
				const response = await axios.get('/api/users');
				const data = response.data;
				return { ...data, timestamp: Date.now() };
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/user-service.ts',
		);
		expect(messages.length).toBe(0);
	});

	it('should pass for filtered response', () => {
		const code = `
			import axios from 'axios';
			
			export async function fetchActiveUsers() {
				const response = await axios.get('/api/users');
				const data = response.data;
				return data.filter(user => user.active);
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/user-service.ts',
		);
		expect(messages.length).toBe(0);
	});

	it('should not flag non-response variables with data property', () => {
		const code = `
			import axios from 'axios';
			
			export async function processData() {
				const config = { data: { key: 'value' } };
				return config.data;
			}
		`;

		const messages = runRule(
			servicesRules['no-response-data-return'],
			code,
			'src/services/config-service.ts',
		);
		expect(messages.length).toBe(0);
	});
});
