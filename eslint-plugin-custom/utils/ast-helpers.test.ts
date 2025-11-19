import type { TSESTree } from '@typescript-eslint/utils';
import { describe, expect, it } from 'vitest';

import {
	containsNestedTernary,
	hasIntentionalIgnoreComment,
	isEffectivelyEmpty,
	isFormConfigProperty,
	isFormHook,
	isReactComponent,
	matchesServicePath,
	returnsJSX,
	safeValidate,
	validateCallExpression,
	validateExportDefaultDeclaration,
	validateFunctionParameter,
	validateJSXAttribute,
	validateJSXElement,
	validateVariableDeclaration,
} from './ast-helpers';

describe('AST Node Validation Helpers', () => {
	describe('validateJSXElement', () => {
		it('should return true for valid JSX element', () => {
			const validNode = {
				type: 'JSXElement',
				openingElement: {
					type: 'JSXOpeningElement',
					name: {
						type: 'JSXIdentifier',
						name: 'div',
					},
					attributes: [],
					selfClosing: false,
				},
				closingElement: null,
				children: [],
			} as unknown as TSESTree.JSXElement;

			expect(validateJSXElement(validNode)).toBe(true);
		});

		it('should return false for non-JSX element', () => {
			const invalidNode = {
				type: 'Identifier',
				name: 'test',
			} as unknown as TSESTree.Identifier;

			expect(validateJSXElement(invalidNode)).toBe(false);
		});
	});

	describe('validateJSXAttribute', () => {
		it('should return true for valid JSX attribute', () => {
			const validNode: TSESTree.JSXAttribute = {
				type: 'JSXAttribute',
				name: {
					type: 'JSXIdentifier',
					name: 'className',
				} as unknown as TSESTree.JSXIdentifier,
				value: null,
			} as unknown as TSESTree.JSXAttribute;

			expect(validateJSXAttribute(validNode)).toBe(true);
		});

		it('should return false for non-JSX attribute', () => {
			const invalidNode = {
				type: 'Identifier',
				name: 'test',
			} as unknown as TSESTree.Identifier;

			expect(validateJSXAttribute(invalidNode)).toBe(false);
		});
	});

	describe('validateExportDefaultDeclaration', () => {
		it('should return true for valid export default declaration', () => {
			const validNode: TSESTree.ExportDefaultDeclaration = {
				type: 'ExportDefaultDeclaration',
				declaration: {
					type: 'Identifier',
					name: 'Component',
				} as unknown as TSESTree.Identifier,
			} as unknown as TSESTree.ExportDefaultDeclaration;

			expect(validateExportDefaultDeclaration(validNode)).toBe(true);
		});

		it('should return false for non-export declaration', () => {
			const invalidNode = {
				type: 'Identifier',
				name: 'test',
			} as unknown as TSESTree.Identifier;

			expect(validateExportDefaultDeclaration(invalidNode)).toBe(false);
		});
	});

	describe('validateVariableDeclaration', () => {
		it('should return true for valid variable declaration', () => {
			const validNode: TSESTree.VariableDeclaration = {
				type: 'VariableDeclaration',
				kind: 'const',
				declarations: [
					{
						type: 'VariableDeclarator',
						id: {
							type: 'Identifier',
							name: 'x',
						} as unknown as TSESTree.Identifier,
						init: null,
					} as unknown as TSESTree.VariableDeclarator,
				],
			} as unknown as TSESTree.VariableDeclaration;

			expect(validateVariableDeclaration(validNode)).toBe(true);
		});

		it('should return false for variable declaration with invalid kind', () => {
			const invalidNode = {
				type: 'VariableDeclaration',
				kind: 'invalid',
				declarations: [{}],
			} as unknown as TSESTree.VariableDeclaration;

			expect(validateVariableDeclaration(invalidNode)).toBe(false);
		});
	});

	describe('validateCallExpression', () => {
		it('should return true for valid call expression', () => {
			const validNode: TSESTree.CallExpression = {
				type: 'CallExpression',
				callee: {
					type: 'Identifier',
					name: 'func',
				} as unknown as TSESTree.Identifier,
				arguments: [],
			} as unknown as TSESTree.CallExpression;

			expect(validateCallExpression(validNode)).toBe(true);
		});

		it('should return false for non-call expression', () => {
			const invalidNode = {
				type: 'Identifier',
				name: 'test',
			} as unknown as TSESTree.Identifier;

			expect(validateCallExpression(invalidNode)).toBe(false);
		});
	});

	describe('validateFunctionParameter', () => {
		it('should return true for identifier parameter', () => {
			const validNode: TSESTree.Identifier = {
				type: 'Identifier',
				name: 'param',
			} as unknown as TSESTree.Identifier;

			expect(validateFunctionParameter(validNode)).toBe(true);
		});

		it('should return true for rest element parameter', () => {
			const validNode = {
				type: 'RestElement',
			} as unknown as TSESTree.RestElement;

			expect(validateFunctionParameter(validNode)).toBe(true);
		});

		it('should return false for invalid parameter type', () => {
			const invalidNode = {
				type: 'Literal',
				value: 'test',
			} as unknown as TSESTree.Literal;

			expect(validateFunctionParameter(invalidNode)).toBe(false);
		});
	});

	describe('safeValidate', () => {
		it('should return false for null node', () => {
			expect(safeValidate(null, validateJSXElement)).toBe(false);
		});

		it('should return false for undefined node', () => {
			expect(safeValidate(undefined, validateJSXElement)).toBe(false);
		});

		it('should catch errors and return false', () => {
			const throwingValidator = () => {
				throw new Error('Test error');
			};

			const node = { type: 'Identifier' } as unknown as TSESTree.Identifier;
			expect(safeValidate(node, throwingValidator as any)).toBe(false);
		});
	});
});

describe('New AST Helper Functions', () => {
	describe('returnsJSX', () => {
		it('should return true for arrow function with JSX expression body', () => {
			const node: TSESTree.ArrowFunctionExpression = {
				type: 'ArrowFunctionExpression',
				expression: true,
				body: {
					type: 'JSXElement',
					openingElement: {
						type: 'JSXOpeningElement',
						name: {
							type: 'JSXIdentifier',
							name: 'div',
						} as unknown as TSESTree.JSXIdentifier,
						attributes: [],
						selfClosing: false,
					} as unknown as TSESTree.JSXOpeningElement,
					closingElement: null,
					children: [],
				} as unknown as TSESTree.JSXElement,
				params: [],
				async: false,
				generator: false,
			} as unknown as TSESTree.ArrowFunctionExpression;

			expect(returnsJSX(node)).toBe(true);
		});

		it('should return true for arrow function with JSX fragment', () => {
			const node: TSESTree.ArrowFunctionExpression = {
				type: 'ArrowFunctionExpression',
				expression: true,
				body: {
					type: 'JSXFragment',
					openingFragment: {} as unknown as TSESTree.JSXOpeningFragment,
					closingFragment: {} as unknown as TSESTree.JSXClosingFragment,
					children: [],
				} as unknown as TSESTree.JSXFragment,
				params: [],
				async: false,
				generator: false,
			} as unknown as TSESTree.ArrowFunctionExpression;

			expect(returnsJSX(node)).toBe(true);
		});

		it('should return false for arrow function without JSX', () => {
			const node: TSESTree.ArrowFunctionExpression = {
				type: 'ArrowFunctionExpression',
				expression: true,
				body: {
					type: 'Literal',
					value: 'test',
					raw: '"test"',
				} as unknown as TSESTree.Literal,
				params: [],
				async: false,
				generator: false,
			} as unknown as TSESTree.ArrowFunctionExpression;

			expect(returnsJSX(node)).toBe(false);
		});

		it('should return true for function with block statement returning JSX', () => {
			const node: TSESTree.FunctionDeclaration = {
				type: 'FunctionDeclaration',
				id: { type: 'Identifier', name: 'Component' } as unknown as TSESTree.Identifier,
				params: [],
				body: {
					type: 'BlockStatement',
					body: [
						{
							type: 'ReturnStatement',
							argument: {
								type: 'JSXElement',
								openingElement: {} as unknown as TSESTree.JSXOpeningElement,
								closingElement: null,
								children: [],
							} as unknown as TSESTree.JSXElement,
						} as unknown as TSESTree.ReturnStatement,
					],
				} as unknown as TSESTree.BlockStatement,
				async: false,
				generator: false,
			} as unknown as TSESTree.FunctionDeclaration;

			expect(returnsJSX(node)).toBe(true);
		});

		it('should return false for function with no return statement', () => {
			const node: TSESTree.FunctionDeclaration = {
				type: 'FunctionDeclaration',
				id: { type: 'Identifier', name: 'func' } as unknown as TSESTree.Identifier,
				params: [],
				body: {
					type: 'BlockStatement',
					body: [],
				} as unknown as TSESTree.BlockStatement,
				async: false,
				generator: false,
			} as unknown as TSESTree.FunctionDeclaration;

			expect(returnsJSX(node)).toBe(false);
		});

		it('should handle null nodes gracefully', () => {
			const node: TSESTree.FunctionDeclaration = {
				type: 'FunctionDeclaration',
				id: null,
				params: [],
				body: {
					type: 'BlockStatement',
					body: [],
				} as unknown as TSESTree.BlockStatement,
				async: false,
				generator: false,
			} as unknown as TSESTree.FunctionDeclaration;

			expect(returnsJSX(node)).toBe(false);
		});
	});

	describe('isReactComponent', () => {
		it('should return true for function declaration returning JSX', () => {
			const node: TSESTree.FunctionDeclaration = {
				type: 'FunctionDeclaration',
				id: { type: 'Identifier', name: 'Component' } as unknown as TSESTree.Identifier,
				params: [],
				body: {
					type: 'BlockStatement',
					body: [
						{
							type: 'ReturnStatement',
							argument: {
								type: 'JSXElement',
								openingElement: {} as unknown as TSESTree.JSXOpeningElement,
								closingElement: null,
								children: [],
							} as unknown as TSESTree.JSXElement,
						} as unknown as TSESTree.ReturnStatement,
					],
				} as unknown as TSESTree.BlockStatement,
				async: false,
				generator: false,
			} as unknown as TSESTree.FunctionDeclaration;

			expect(isReactComponent(node)).toBe(true);
		});

		it('should return true for variable declarator with arrow function returning JSX', () => {
			const node: TSESTree.VariableDeclarator = {
				type: 'VariableDeclarator',
				id: { type: 'Identifier', name: 'Component' } as unknown as TSESTree.Identifier,
				init: {
					type: 'ArrowFunctionExpression',
					expression: true,
					body: {
						type: 'JSXElement',
						openingElement: {} as unknown as TSESTree.JSXOpeningElement,
						closingElement: null,
						children: [],
					} as unknown as TSESTree.JSXElement,
					params: [],
					async: false,
					generator: false,
				} as unknown as TSESTree.ArrowFunctionExpression,
			} as unknown as TSESTree.VariableDeclarator;

			expect(isReactComponent(node)).toBe(true);
		});

		it('should return true for class extending React.Component', () => {
			const node: TSESTree.ClassDeclaration = {
				type: 'ClassDeclaration',
				id: { type: 'Identifier', name: 'MyComponent' } as unknown as TSESTree.Identifier,
				superClass: {
					type: 'MemberExpression',
					object: { type: 'Identifier', name: 'React' } as unknown as TSESTree.Identifier,
					property: {
						type: 'Identifier',
						name: 'Component',
					} as unknown as TSESTree.Identifier,
					computed: false,
					optional: false,
				} as unknown as TSESTree.MemberExpression,
				body: { type: 'ClassBody', body: [] } as unknown as TSESTree.ClassBody,
			} as unknown as TSESTree.ClassDeclaration;

			expect(isReactComponent(node)).toBe(true);
		});

		it('should return true for class extending React.PureComponent', () => {
			const node: TSESTree.ClassDeclaration = {
				type: 'ClassDeclaration',
				id: { type: 'Identifier', name: 'MyComponent' } as unknown as TSESTree.Identifier,
				superClass: {
					type: 'MemberExpression',
					object: { type: 'Identifier', name: 'React' } as unknown as TSESTree.Identifier,
					property: {
						type: 'Identifier',
						name: 'PureComponent',
					} as unknown as TSESTree.Identifier,
					computed: false,
					optional: false,
				} as unknown as TSESTree.MemberExpression,
				body: { type: 'ClassBody', body: [] } as unknown as TSESTree.ClassBody,
			} as unknown as TSESTree.ClassDeclaration;

			expect(isReactComponent(node)).toBe(true);
		});

		it('should return true for class extending Component (direct import)', () => {
			const node: TSESTree.ClassDeclaration = {
				type: 'ClassDeclaration',
				id: { type: 'Identifier', name: 'MyComponent' } as unknown as TSESTree.Identifier,
				superClass: {
					type: 'Identifier',
					name: 'Component',
				} as unknown as TSESTree.Identifier,
				body: { type: 'ClassBody', body: [] } as unknown as TSESTree.ClassBody,
			} as unknown as TSESTree.ClassDeclaration;

			expect(isReactComponent(node)).toBe(true);
		});

		it('should return false for function not returning JSX', () => {
			const node: TSESTree.FunctionDeclaration = {
				type: 'FunctionDeclaration',
				id: { type: 'Identifier', name: 'helper' } as unknown as TSESTree.Identifier,
				params: [],
				body: {
					type: 'BlockStatement',
					body: [
						{
							type: 'ReturnStatement',
							argument: {
								type: 'Literal',
								value: 'test',
							} as unknown as TSESTree.Literal,
						} as unknown as TSESTree.ReturnStatement,
					],
				} as unknown as TSESTree.BlockStatement,
				async: false,
				generator: false,
			} as unknown as TSESTree.FunctionDeclaration;

			expect(isReactComponent(node)).toBe(false);
		});

		it('should return false for class not extending React component', () => {
			const node: TSESTree.ClassDeclaration = {
				type: 'ClassDeclaration',
				id: { type: 'Identifier', name: 'MyClass' } as unknown as TSESTree.Identifier,
				superClass: {
					type: 'Identifier',
					name: 'BaseClass',
				} as unknown as TSESTree.Identifier,
				body: { type: 'ClassBody', body: [] } as unknown as TSESTree.ClassBody,
			} as unknown as TSESTree.ClassDeclaration;

			expect(isReactComponent(node)).toBe(false);
		});

		it('should return false for variable declarator without init', () => {
			const node: TSESTree.VariableDeclarator = {
				type: 'VariableDeclarator',
				id: { type: 'Identifier', name: 'x' } as unknown as TSESTree.Identifier,
				init: null,
			} as unknown as TSESTree.VariableDeclarator;

			expect(isReactComponent(node)).toBe(false);
		});
	});

	describe('isFormHook', () => {
		it('should return true for useForm call', () => {
			const node: TSESTree.CallExpression = {
				type: 'CallExpression',
				callee: { type: 'Identifier', name: 'useForm' } as unknown as TSESTree.Identifier,
				arguments: [],
				optional: false,
			} as unknown as TSESTree.CallExpression;

			expect(isFormHook(node)).toBe(true);
		});

		it('should return true for useFormik call', () => {
			const node: TSESTree.CallExpression = {
				type: 'CallExpression',
				callee: { type: 'Identifier', name: 'useFormik' } as unknown as TSESTree.Identifier,
				arguments: [],
				optional: false,
			} as unknown as TSESTree.CallExpression;

			expect(isFormHook(node)).toBe(true);
		});

		it('should return true for namespaced useForm call', () => {
			const node: TSESTree.CallExpression = {
				type: 'CallExpression',
				callee: {
					type: 'MemberExpression',
					object: {
						type: 'Identifier',
						name: 'formik',
					} as unknown as TSESTree.Identifier,
					property: {
						type: 'Identifier',
						name: 'useFormik',
					} as unknown as TSESTree.Identifier,
					computed: false,
					optional: false,
				} as unknown as TSESTree.MemberExpression,
				arguments: [],
				optional: false,
			} as unknown as TSESTree.CallExpression;

			expect(isFormHook(node)).toBe(true);
		});

		it('should return false for other hooks', () => {
			const node: TSESTree.CallExpression = {
				type: 'CallExpression',
				callee: { type: 'Identifier', name: 'useState' } as unknown as TSESTree.Identifier,
				arguments: [],
				optional: false,
			} as unknown as TSESTree.CallExpression;

			expect(isFormHook(node)).toBe(false);
		});

		it('should return false for invalid call expression', () => {
			const node = { type: 'Identifier', name: 'test' } as unknown as TSESTree.Identifier;
			expect(isFormHook(node as any)).toBe(false);
		});
	});

	describe('isFormConfigProperty', () => {
		it('should return true for defaultValues', () => {
			expect(isFormConfigProperty('defaultValues')).toBe(true);
		});

		it('should return true for schema', () => {
			expect(isFormConfigProperty('schema')).toBe(true);
		});

		it('should return true for resolver', () => {
			expect(isFormConfigProperty('resolver')).toBe(true);
		});

		it('should return true for mode', () => {
			expect(isFormConfigProperty('mode')).toBe(true);
		});

		it('should return true for initialValues', () => {
			expect(isFormConfigProperty('initialValues')).toBe(true);
		});

		it('should return true for validationSchema', () => {
			expect(isFormConfigProperty('validationSchema')).toBe(true);
		});

		it('should return false for non-config properties', () => {
			expect(isFormConfigProperty('onClick')).toBe(false);
			expect(isFormConfigProperty('className')).toBe(false);
			expect(isFormConfigProperty('value')).toBe(false);
		});

		it('should return false for empty string', () => {
			expect(isFormConfigProperty('')).toBe(false);
		});
	});

	describe('matchesServicePath', () => {
		it('should return true for service path', () => {
			expect(matchesServicePath('src/services/api.ts')).toBe(true);
		});

		it('should return true for nested service path', () => {
			expect(matchesServicePath('src/services/user/api.ts')).toBe(true);
		});

		it('should return true for deeply nested service path', () => {
			expect(matchesServicePath('src/services/api/v1/users.ts')).toBe(true);
		});

		it('should return false for non-service path', () => {
			expect(matchesServicePath('src/components/Button.tsx')).toBe(false);
		});

		it('should return false for similar but different path', () => {
			expect(matchesServicePath('src/service/api.ts')).toBe(false);
		});

		it('should handle Windows paths', () => {
			expect(matchesServicePath('src\\services\\api.ts')).toBe(true);
		});

		it('should handle mixed path separators', () => {
			expect(matchesServicePath('src/services\\user/api.ts')).toBe(true);
		});

		it('should return false for empty string', () => {
			expect(matchesServicePath('')).toBe(false);
		});
	});

	describe('containsNestedTernary', () => {
		it('should return true for nested ternary in consequent', () => {
			const innerTernary: TSESTree.ConditionalExpression = {
				type: 'ConditionalExpression',
				test: { type: 'Identifier', name: 'b' } as unknown as TSESTree.Identifier,
				consequent: { type: 'Literal', value: 1 } as unknown as TSESTree.Literal,
				alternate: { type: 'Literal', value: 2 } as unknown as TSESTree.Literal,
			} as unknown as TSESTree.ConditionalExpression;

			const node: TSESTree.ConditionalExpression = {
				type: 'ConditionalExpression',
				test: { type: 'Identifier', name: 'a' } as unknown as TSESTree.Identifier,
				consequent: innerTernary,
				alternate: { type: 'Literal', value: 3 } as unknown as TSESTree.Literal,
			} as unknown as TSESTree.ConditionalExpression;

			expect(containsNestedTernary(node)).toBe(true);
		});

		it('should return true for nested ternary in alternate', () => {
			const innerTernary: TSESTree.ConditionalExpression = {
				type: 'ConditionalExpression',
				test: { type: 'Identifier', name: 'b' } as unknown as TSESTree.Identifier,
				consequent: { type: 'Literal', value: 1 } as unknown as TSESTree.Literal,
				alternate: { type: 'Literal', value: 2 } as unknown as TSESTree.Literal,
			} as unknown as TSESTree.ConditionalExpression;

			const node: TSESTree.ConditionalExpression = {
				type: 'ConditionalExpression',
				test: { type: 'Identifier', name: 'a' } as unknown as TSESTree.Identifier,
				consequent: { type: 'Literal', value: 3 } as unknown as TSESTree.Literal,
				alternate: innerTernary,
			} as unknown as TSESTree.ConditionalExpression;

			expect(containsNestedTernary(node)).toBe(true);
		});

		it('should return false for simple ternary', () => {
			const node: TSESTree.ConditionalExpression = {
				type: 'ConditionalExpression',
				test: { type: 'Identifier', name: 'a' } as unknown as TSESTree.Identifier,
				consequent: { type: 'Literal', value: 1 } as unknown as TSESTree.Literal,
				alternate: { type: 'Literal', value: 2 } as unknown as TSESTree.Literal,
			} as unknown as TSESTree.ConditionalExpression;

			expect(containsNestedTernary(node)).toBe(false);
		});
	});

	describe('isEffectivelyEmpty', () => {
		it('should return true for empty catch block', () => {
			const node: TSESTree.CatchClause = {
				type: 'CatchClause',
				param: null,
				body: {
					type: 'BlockStatement',
					body: [],
				} as unknown as TSESTree.BlockStatement,
			} as unknown as TSESTree.CatchClause;

			expect(isEffectivelyEmpty(node)).toBe(true);
		});

		it('should return false for catch block with statements', () => {
			const node: TSESTree.CatchClause = {
				type: 'CatchClause',
				param: null,
				body: {
					type: 'BlockStatement',
					body: [
						{
							type: 'ExpressionStatement',
							expression: {} as unknown as TSESTree.Expression,
						} as unknown as TSESTree.ExpressionStatement,
					],
				} as unknown as TSESTree.BlockStatement,
			} as unknown as TSESTree.CatchClause;

			expect(isEffectivelyEmpty(node)).toBe(false);
		});

		it('should return true for catch block with invalid body type', () => {
			const node: TSESTree.CatchClause = {
				type: 'CatchClause',
				param: null,
				body: null as any,
			} as unknown as TSESTree.CatchClause;

			expect(isEffectivelyEmpty(node)).toBe(true);
		});
	});

	describe('hasIntentionalIgnoreComment', () => {
		it('should return true for intentionally ignored comment', () => {
			const node: TSESTree.CatchClause = {
				type: 'CatchClause',
				param: null,
				body: {
					type: 'BlockStatement',
					body: [],
				} as unknown as TSESTree.BlockStatement,
				range: [0, 50],
			} as unknown as TSESTree.CatchClause;

			const sourceCode = {
				getAllComments: () => [
					{
						type: 'Line',
						value: ' intentionally ignored',
						range: [10, 35],
					} as unknown as TSESTree.Comment,
				],
			};

			expect(hasIntentionalIgnoreComment(node, sourceCode)).toBe(true);
		});

		it('should return true for deliberately ignored comment', () => {
			const node: TSESTree.CatchClause = {
				type: 'CatchClause',
				param: null,
				body: {
					type: 'BlockStatement',
					body: [],
				} as unknown as TSESTree.BlockStatement,
				range: [0, 50],
			} as unknown as TSESTree.CatchClause;

			const sourceCode = {
				getAllComments: () => [
					{
						type: 'Line',
						value: ' deliberately ignored',
						range: [10, 35],
					} as unknown as TSESTree.Comment,
				],
			};

			expect(hasIntentionalIgnoreComment(node, sourceCode)).toBe(true);
		});

		it('should return true for ignore error comment', () => {
			const node: TSESTree.CatchClause = {
				type: 'CatchClause',
				param: null,
				body: {
					type: 'BlockStatement',
					body: [],
				} as unknown as TSESTree.BlockStatement,
				range: [0, 50],
			} as unknown as TSESTree.CatchClause;

			const sourceCode = {
				getAllComments: () => [
					{
						type: 'Line',
						value: ' ignore error',
						range: [10, 25],
					} as unknown as TSESTree.Comment,
				],
			};

			expect(hasIntentionalIgnoreComment(node, sourceCode)).toBe(true);
		});

		it('should return true for no-op comment', () => {
			const node: TSESTree.CatchClause = {
				type: 'CatchClause',
				param: null,
				body: {
					type: 'BlockStatement',
					body: [],
				} as unknown as TSESTree.BlockStatement,
				range: [0, 50],
			} as unknown as TSESTree.CatchClause;

			const sourceCode = {
				getAllComments: () => [
					{
						type: 'Line',
						value: ' no-op',
						range: [10, 18],
					} as unknown as TSESTree.Comment,
				],
			};

			expect(hasIntentionalIgnoreComment(node, sourceCode)).toBe(true);
		});

		it('should return false for no comments', () => {
			const node: TSESTree.CatchClause = {
				type: 'CatchClause',
				param: null,
				body: {
					type: 'BlockStatement',
					body: [],
				} as unknown as TSESTree.BlockStatement,
			} as unknown as TSESTree.CatchClause;

			const sourceCode = {
				getCommentsBefore: () => [],
			};

			expect(hasIntentionalIgnoreComment(node, sourceCode)).toBe(false);
		});

		it('should return false for unrelated comments', () => {
			const node: TSESTree.CatchClause = {
				type: 'CatchClause',
				param: null,
				body: {
					type: 'BlockStatement',
					body: [],
				} as unknown as TSESTree.BlockStatement,
			} as unknown as TSESTree.CatchClause;

			const sourceCode = {
				getCommentsBefore: () => [
					{ type: 'Line', value: ' some other comment' } as unknown as TSESTree.Comment,
				],
			};

			expect(hasIntentionalIgnoreComment(node, sourceCode)).toBe(false);
		});

		it('should return false for invalid body', () => {
			const node: TSESTree.CatchClause = {
				type: 'CatchClause',
				param: null,
				body: null as any,
			} as unknown as TSESTree.CatchClause;

			const sourceCode = {
				getCommentsBefore: () => [],
			};

			expect(hasIntentionalIgnoreComment(node, sourceCode)).toBe(false);
		});
	});
});
