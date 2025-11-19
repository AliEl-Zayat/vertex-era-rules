// Common AST traversal utilities
import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';

/**
 * Type guard to check if a node is a valid JSX attribute
 */
export function isValidJSXAttribute(node: TSESTree.Node): node is TSESTree.JSXAttribute {
	return (
		node.type === AST_NODE_TYPES.JSXAttribute &&
		node.name.type === AST_NODE_TYPES.JSXIdentifier &&
		node.value !== null
	);
}

/**
 * Type guard to check if a node is a JSX element
 */
export function isJSXElement(node: TSESTree.Node): node is TSESTree.JSXElement {
	return node.type === AST_NODE_TYPES.JSXElement;
}

/**
 * Type guard to check if a node is an identifier
 */
export function isIdentifier(node: TSESTree.Node): node is TSESTree.Identifier {
	return node.type === AST_NODE_TYPES.Identifier;
}

/**
 * Type guard to check if a node is a call expression
 */
export function isCallExpression(node: TSESTree.Node): node is TSESTree.CallExpression {
	return node.type === AST_NODE_TYPES.CallExpression;
}

/**
 * Type guard to check if a node is an export default declaration
 */
export function isExportDefaultDeclaration(
	node: TSESTree.Node,
): node is TSESTree.ExportDefaultDeclaration {
	return node.type === AST_NODE_TYPES.ExportDefaultDeclaration;
}

/**
 * Type guard to check if a node is a variable declarator
 */
export function isVariableDeclarator(node: TSESTree.Node): node is TSESTree.VariableDeclarator {
	return node.type === AST_NODE_TYPES.VariableDeclarator;
}

/**
 * Validate JSX element structure
 */
export function validateJSXElement(node: TSESTree.Node): node is TSESTree.JSXElement {
	if (!isJSXElement(node)) {
		return false;
	}

	// Validate opening element has a name
	if (!node.openingElement?.name) {
		return false;
	}

	return true;
}

/**
 * Validate JSX attribute structure
 */
export function validateJSXAttribute(node: TSESTree.Node): node is TSESTree.JSXAttribute {
	if (node.type !== AST_NODE_TYPES.JSXAttribute) {
		return false;
	}

	// Validate attribute has a name
	if (node.name?.type !== AST_NODE_TYPES.JSXIdentifier) {
		return false;
	}

	return true;
}

/**
 * Validate export default declaration structure
 */
export function validateExportDefaultDeclaration(
	node: TSESTree.Node,
): node is TSESTree.ExportDefaultDeclaration {
	if (!isExportDefaultDeclaration(node)) {
		return false;
	}

	// Declaration is always present in ExportDefaultDeclaration
	return true;
}

/**
 * Get the name of a JSX element
 */
export function getJSXElementName(node: TSESTree.JSXElement): string | null {
	const { openingElement } = node;
	if (openingElement.name.type === AST_NODE_TYPES.JSXIdentifier) {
		return openingElement.name.name;
	}
	return null;
}

/**
 * Traverse all child nodes of a given node
 * Optimized to minimize redundant checks and use early returns
 */
export function traverseNode(node: TSESTree.Node, visitor: (node: TSESTree.Node) => void): void {
	visitor(node);

	// Recursively visit all child nodes
	// Use Object.keys for better performance than for-in
	const keys = Object.keys(node);
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i];
		const child = (node as unknown as Record<string, unknown>)[key];

		// Early continue: skip null/undefined
		if (!child) continue;

		// Early continue: skip non-objects
		if (typeof child !== 'object') continue;

		if (Array.isArray(child)) {
			// Optimize array traversal
			for (let j = 0; j < child.length; j++) {
				const item = child[j];
				// Early continue: skip invalid items
				if (!item || typeof item !== 'object') continue;
				// Early continue: skip non-AST nodes
				if (!('type' in item)) continue;

				traverseNode(item as TSESTree.Node, visitor);
			}
		} else if ('type' in child) {
			// Single node child
			traverseNode(child as TSESTree.Node, visitor);
		}
	}
}

/**
 * Validate that a node is a valid function parameter
 */
export function validateFunctionParameter(node: TSESTree.Node): node is TSESTree.Parameter {
	return (
		node.type === AST_NODE_TYPES.Identifier ||
		node.type === AST_NODE_TYPES.RestElement ||
		node.type === AST_NODE_TYPES.ArrayPattern ||
		node.type === AST_NODE_TYPES.ObjectPattern ||
		node.type === AST_NODE_TYPES.AssignmentPattern
	);
}

/**
 * Validate that a node is a valid import declaration
 */
export function validateImportDeclaration(node: TSESTree.Node): node is TSESTree.ImportDeclaration {
	if (node.type !== AST_NODE_TYPES.ImportDeclaration) return false;

	// Validate source exists
	if (node.source.type !== AST_NODE_TYPES.Literal) return false;

	return true;
}

/**
 * Validate that a node is a valid member expression
 */
export function validateMemberExpression(node: TSESTree.Node): node is TSESTree.MemberExpression {
	if (node.type !== AST_NODE_TYPES.MemberExpression) return false;

	// Object and property are always present in MemberExpression
	return true;
}

/**
 * Validate that a node is a valid literal
 */
export function validateLiteral(node: TSESTree.Node): node is TSESTree.Literal {
	if (node.type !== AST_NODE_TYPES.Literal) return false;

	// Validate value exists (can be null, but property should exist)
	if (!('value' in node)) return false;

	return true;
}

/**
 * Validate that a node is a valid object expression
 */
export function validateObjectExpression(node: TSESTree.Node): node is TSESTree.ObjectExpression {
	if (node.type !== AST_NODE_TYPES.ObjectExpression) return false;

	// Properties array is always present in ObjectExpression
	return true;
}

/**
 * Validate that a node is a valid arrow function expression
 */
export function validateArrowFunctionExpression(
	node: TSESTree.Node,
): node is TSESTree.ArrowFunctionExpression {
	if (node.type !== AST_NODE_TYPES.ArrowFunctionExpression) return false;

	// Params and body are always present in ArrowFunctionExpression
	return true;
}

/**
 * Validate that a node is a valid function expression
 */
export function validateFunctionExpression(
	node: TSESTree.Node,
): node is TSESTree.FunctionExpression {
	if (node.type !== AST_NODE_TYPES.FunctionExpression) return false;

	// Params and body are always present in FunctionExpression
	return true;
}

/**
 * Validate that a node is a valid call expression with proper structure
 */
export function validateCallExpression(node: TSESTree.Node): node is TSESTree.CallExpression {
	if (!isCallExpression(node)) return false;

	// Callee and arguments are always present in CallExpression
	return true;
}

/**
 * Validate that a node is a valid variable declaration
 */
export function validateVariableDeclaration(
	node: TSESTree.Node,
): node is TSESTree.VariableDeclaration {
	if (node.type !== AST_NODE_TYPES.VariableDeclaration) return false;

	// Validate declarations array exists and is not empty
	if (!Array.isArray(node.declarations) || node.declarations.length === 0) return false;

	// Validate kind is valid
	if (!['const', 'let', 'var'].includes(node.kind)) return false;

	return true;
}

/**
 * Validate that a node is a valid variable declarator with proper structure
 */
export function validateVariableDeclaratorStructure(
	node: TSESTree.Node,
): node is TSESTree.VariableDeclarator {
	if (!isVariableDeclarator(node)) return false;

	// ID is always present in VariableDeclarator
	return true;
}

/**
 * Validate that a node is a valid TypeScript property signature
 */
export function validateTSPropertySignature(
	node: TSESTree.Node,
): node is TSESTree.TSPropertySignature {
	if (node.type !== AST_NODE_TYPES.TSPropertySignature) return false;

	// Key is always present in TSPropertySignature
	return true;
}

/**
 * Validate that a node is a valid JSX expression container
 */
export function validateJSXExpressionContainer(
	node: TSESTree.Node,
): node is TSESTree.JSXExpressionContainer {
	if (node.type !== AST_NODE_TYPES.JSXExpressionContainer) return false;

	// Expression is always present in JSXExpressionContainer
	return true;
}

/**
 * Safe wrapper for node validation that catches errors
 */
export function safeValidate<T extends TSESTree.Node>(
	node: TSESTree.Node | null | undefined,
	validator: (node: TSESTree.Node) => node is T,
): node is T {
	try {
		if (!node) return false;
		return validator(node);
	} catch {
		return false;
	}
}

/**
 * Check if a node returns JSX
 * Used to identify React components
 */
export function returnsJSX(
	node:
		| TSESTree.FunctionDeclaration
		| TSESTree.ArrowFunctionExpression
		| TSESTree.FunctionExpression,
): boolean {
	try {
		// Helper to check if a node is JSX
		const isJSXNode = (n: TSESTree.Node): boolean => {
			return n.type === AST_NODE_TYPES.JSXElement || n.type === AST_NODE_TYPES.JSXFragment;
		};

		// For arrow functions with expression body
		if (
			node.type === AST_NODE_TYPES.ArrowFunctionExpression &&
			node.expression &&
			node.body.type !== AST_NODE_TYPES.BlockStatement
		) {
			return isJSXNode(node.body);
		}

		// For functions with block statement body
		if (node.body && node.body.type === AST_NODE_TYPES.BlockStatement) {
			// Check each statement in the function body
			for (const statement of node.body.body) {
				if (statement.type === AST_NODE_TYPES.ReturnStatement && statement.argument) {
					if (isJSXNode(statement.argument)) {
						return true;
					}
				}
			}
		}

		return false;
	} catch (error) {
		const isErrorGuard = error instanceof Error && !!error;
		return isErrorGuard;
	}
}

/**
 * Check if a node is a React component
 * A React component is a function or class that returns JSX
 */
export function isReactComponent(node: TSESTree.Node): boolean {
	try {
		// Check function declarations
		if (node.type === AST_NODE_TYPES.FunctionDeclaration) {
			return returnsJSX(node);
		}

		// Check arrow functions and function expressions in variable declarations
		if (node.type === AST_NODE_TYPES.VariableDeclarator && node.init) {
			if (
				node.init.type === AST_NODE_TYPES.ArrowFunctionExpression ||
				node.init.type === AST_NODE_TYPES.FunctionExpression
			) {
				return returnsJSX(node.init);
			}
		}

		// Check class components (extend React.Component or React.PureComponent)
		if (node.type === AST_NODE_TYPES.ClassDeclaration) {
			if (node.superClass) {
				// Check for React.Component or React.PureComponent
				if (node.superClass.type === AST_NODE_TYPES.MemberExpression) {
					const obj = node.superClass.object;
					const prop = node.superClass.property;
					if (
						obj.type === AST_NODE_TYPES.Identifier &&
						obj.name === 'React' &&
						prop.type === AST_NODE_TYPES.Identifier &&
						(prop.name === 'Component' || prop.name === 'PureComponent')
					) {
						return true;
					}
				}
				// Check for Component or PureComponent (imported directly)
				if (node.superClass.type === AST_NODE_TYPES.Identifier) {
					const name = node.superClass.name;
					if (name === 'Component' || name === 'PureComponent') {
						return true;
					}
				}
			}
		}

		return false;
	} catch {
		return false;
	}
}

/**
 * Check if a call expression is a form hook (useForm from react-hook-form or Formik)
 */
export function isFormHook(node: TSESTree.CallExpression): boolean {
	try {
		if (!validateCallExpression(node)) return false;

		const { callee } = node;

		// Check for direct hook calls: useForm()
		if (callee.type === AST_NODE_TYPES.Identifier) {
			return callee.name === 'useForm' || callee.name === 'useFormik';
		}

		// Check for namespaced calls: formik.useFormik()
		if (callee.type === AST_NODE_TYPES.MemberExpression) {
			const prop = callee.property;
			if (prop.type === AST_NODE_TYPES.Identifier) {
				return prop.name === 'useForm' || prop.name === 'useFormik';
			}
		}

		return false;
	} catch {
		return false;
	}
}

/**
 * Check if a property key is a form configuration property
 */
export function isFormConfigProperty(key: string): boolean {
	const formConfigKeys = [
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
	];

	return formConfigKeys.includes(key);
}

/**
 * Check if a filename matches the service path pattern (src/services/*)
 */
export function matchesServicePath(filename: string): boolean {
	try {
		// Normalize path separators
		const normalizedPath = filename.replace(/\\/g, '/');

		// Check if path contains src/services/
		return normalizedPath.includes('src/services/');
	} catch {
		return false;
	}
}

/**
 * Check if a ternary operator contains nested ternaries
 */
export function containsNestedTernary(node: TSESTree.ConditionalExpression): boolean {
	try {
		let hasNested = false;

		// Check consequent branch
		traverseNode(node.consequent, (childNode) => {
			if (childNode.type === AST_NODE_TYPES.ConditionalExpression) {
				hasNested = true;
			}
		});

		// Check alternate branch
		if (!hasNested) {
			traverseNode(node.alternate, (childNode) => {
				if (childNode.type === AST_NODE_TYPES.ConditionalExpression) {
					hasNested = true;
				}
			});
		}

		return hasNested;
	} catch {
		return false;
	}
}

/**
 * Check if a catch block is effectively empty (no statements, only whitespace/comments)
 */
export function isEffectivelyEmpty(catchClause: TSESTree.CatchClause): boolean {
	try {
		if (!catchClause.body || catchClause.body.type !== AST_NODE_TYPES.BlockStatement) {
			return true;
		}

		// Check if body has any statements
		return catchClause.body.body.length === 0;
	} catch {
		return true;
	}
}

/**
 * Check if a catch block has an intentional ignore comment
 */
export function hasIntentionalIgnoreComment(
	catchClause: TSESTree.CatchClause,
	sourceCode: unknown,
): boolean {
	try {
		if (!catchClause.body || catchClause.body.type !== AST_NODE_TYPES.BlockStatement) {
			return false;
		}

		function hasGetAllComments(value: unknown): value is { getAllComments: () => unknown[] } {
			return (
				typeof value === 'object' &&
				value !== null &&
				'getAllComments' in value &&
				typeof (value as Record<string, unknown>).getAllComments === 'function'
			);
		}
		// Get all comments in and around the catch block
		const allComments: unknown[] = hasGetAllComments(sourceCode)
			? sourceCode.getAllComments()
			: [];

		// Filter comments that are within the catch block range
		const catchBlockComments = allComments.filter((comment: any) => {
			if (!catchClause.body || !catchClause.range) return false;
			const [start, end] = catchClause.range;
			return comment.range && comment.range[0] >= start && comment.range[1] <= end;
		});

		// Check for intentional ignore patterns
		const ignorePatterns = [
			/intentionally\s+ignored?/i,
			/deliberately\s+ignored?/i,
			/ignore\s+error/i,
			/no-op/i,
			/noop/i,
		];

		return catchBlockComments.some((comment: any) =>
			ignorePatterns.some((pattern) => pattern.test(comment.value)),
		);
	} catch {
		return false;
	}
}
