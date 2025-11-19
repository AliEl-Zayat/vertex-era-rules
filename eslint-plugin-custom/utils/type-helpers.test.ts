import { describe, expect, it } from 'vitest';

import {
	hasExplicitBooleanAnnotation,
	hasValidTypeAnnotation,
	validateIdentifierWithType,
} from './type-helpers';

describe('Type Helpers - Error Handling', () => {
	describe('hasExplicitBooleanAnnotation', () => {
		it('should return false for nodes without type annotation', () => {
			const node = {
				type: 'Identifier',
				name: 'test',
			} as any;

			expect(hasExplicitBooleanAnnotation(node)).toBe(false);
		});

		it('should return true for identifier with boolean type annotation', () => {
			const node = {
				type: 'Identifier',
				name: 'test',
				typeAnnotation: {
					type: 'TSTypeAnnotation',
					typeAnnotation: {
						type: 'TSBooleanKeyword',
					},
				},
			} as any;

			expect(hasExplicitBooleanAnnotation(node)).toBe(true);
		});

		it('should return false for identifier with non-boolean type annotation', () => {
			const node = {
				type: 'Identifier',
				name: 'test',
				typeAnnotation: {
					type: 'TSTypeAnnotation',
					typeAnnotation: {
						type: 'TSStringKeyword',
					},
				},
			} as any;

			expect(hasExplicitBooleanAnnotation(node)).toBe(false);
		});

		it('should handle errors gracefully and return false', () => {
			const node = {
				type: 'Identifier',
				name: 'test',
				typeAnnotation: null,
			} as any;

			expect(hasExplicitBooleanAnnotation(node)).toBe(false);
		});
	});

	describe('hasValidTypeAnnotation', () => {
		it('should return false for nodes without typeAnnotation property', () => {
			const node = {
				type: 'Identifier',
				name: 'test',
			} as any;

			expect(hasValidTypeAnnotation(node)).toBe(false);
		});

		it('should return true for nodes with valid type annotation', () => {
			const node = {
				type: 'Identifier',
				name: 'test',
				typeAnnotation: {
					type: 'TSTypeAnnotation',
					typeAnnotation: {
						type: 'TSBooleanKeyword',
					},
				},
			} as any;

			expect(hasValidTypeAnnotation(node)).toBe(true);
		});

		it('should handle errors gracefully and return false', () => {
			const node = {
				type: 'Identifier',
				name: 'test',
				typeAnnotation: null,
			} as any;

			expect(hasValidTypeAnnotation(node)).toBe(false);
		});
	});

	describe('validateIdentifierWithType', () => {
		it('should return true for valid identifier', () => {
			const node = {
				type: 'Identifier',
				name: 'test',
			} as any;

			expect(validateIdentifierWithType(node)).toBe(true);
		});

		it('should return false for non-identifier', () => {
			const node = {
				type: 'Literal',
				value: 'test',
			} as any;

			expect(validateIdentifierWithType(node)).toBe(false);
		});

		it('should return false for identifier without name', () => {
			const node = {
				type: 'Identifier',
				name: null,
			} as any;

			expect(validateIdentifierWithType(node)).toBe(false);
		});
	});
});
