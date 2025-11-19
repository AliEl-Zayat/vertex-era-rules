import { describe, expect, it } from 'vitest';

import { runRule } from '../../test-utils';

import errorHandlingRules from './eslint-plugin-error-handling-rules';

describe('Unit Tests: no-empty-catch', () => {
	it('should report error for empty catch block', () => {
		const code = `
      try {
        riskyOperation();
      } catch (error) {
      }
    `;

		const messages = runRule(errorHandlingRules['no-empty-catch'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('Empty catch block detected');
	});

	it('should not report error for catch with logging', () => {
		const code = `
      try {
        riskyOperation();
      } catch (error) {
        console.error(error);
      }
    `;

		const messages = runRule(errorHandlingRules['no-empty-catch'], code);
		expect(messages.length).toBe(0);
	});

	it('should not report error for catch with intentional ignore comment', () => {
		const code = `
      try {
        riskyOperation();
      } catch (error) {
        // intentionally ignored
      }
    `;

		const messages = runRule(errorHandlingRules['no-empty-catch'], code);
		expect(messages.length).toBe(0);
	});

	it('should report warning for catch with statement but unused parameter', () => {
		const code = `
      try {
        riskyOperation();
      } catch (error) {
        console.log('An error occurred');
      }
    `;

		const messages = runRule(errorHandlingRules['no-empty-catch'], code);
		// The catch block is not empty, so no empty catch error
		// But should report unused parameter warning
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('never used');
		expect(messages[0].message).toContain('error');
	});

	it('should not report error for catch that uses the error parameter', () => {
		const code = `
      try {
        riskyOperation();
      } catch (error) {
        console.error('Error:', error);
      }
    `;

		const messages = runRule(errorHandlingRules['no-empty-catch'], code);
		expect(messages.length).toBe(0);
	});

	it('should report error for catch with only whitespace', () => {
		const code = `
      try {
        riskyOperation();
      } catch (error) {
        
        
      }
    `;

		const messages = runRule(errorHandlingRules['no-empty-catch'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('Empty catch block detected');
	});

	it('should not report error for catch that rethrows', () => {
		const code = `
      try {
        riskyOperation();
      } catch (error) {
        throw error;
      }
    `;

		const messages = runRule(errorHandlingRules['no-empty-catch'], code);
		expect(messages.length).toBe(0);
	});

	it('should handle catch without parameter', () => {
		const code = `
      try {
        riskyOperation();
      } catch {
        console.log('Error occurred');
      }
    `;

		const messages = runRule(errorHandlingRules['no-empty-catch'], code);
		expect(messages.length).toBe(0);
	});

	it('should report error for empty catch without parameter', () => {
		const code = `
      try {
        riskyOperation();
      } catch {
      }
    `;

		const messages = runRule(errorHandlingRules['no-empty-catch'], code);
		expect(messages.length).toBe(1);
		expect(messages[0].message).toContain('Empty catch block detected');
	});
});
