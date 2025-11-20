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
	const visited = new WeakSet<object>();

	function traverse(currentNode: TSESTree.Node): void {
		// Skip if already visited (prevents infinite recursion on circular references)
		if (visited.has(currentNode)) return;
		visited.add(currentNode);

		visitor(currentNode);

		// Recursively visit all child nodes
		// Use Object.keys for better performance than for-in
		const keys = Object.keys(currentNode);
		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			// Skip parent references to avoid circular traversal
			if (key === 'parent') continue;

			const child = (currentNode as unknown as Record<string, unknown>)[key];

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

					traverse(item as TSESTree.Node);
				}
			} else if ('type' in child) {
				// Single node child
				traverse(child as TSESTree.Node);
			}
		}
	}

	traverse(node);
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
 * React import style enum
 */
export enum ReactImportStyle {
	NAMESPACE = 'NAMESPACE', // import * as React from 'react'
	DEFAULT_ONLY = 'DEFAULT_ONLY', // import React from 'react'
	NAMED_ONLY = 'NAMED_ONLY', // import { useState } from 'react'
	MIXED = 'MIXED', // import React, { useState } from 'react'
	NONE = 'NONE', // no React import
}

/**
 * Import analysis result interface
 */
export interface ImportAnalysisResult {
	style: ReactImportStyle;
	hasDefaultImport: boolean;
	hasNamedImports: boolean;
	hasMemoImport: boolean;
	importNode: TSESTree.ImportDeclaration | null;
}

/**
 * Analyze React import style in a program
 * Detects namespace, default, named, mixed, or no React import
 */
export function analyzeReactImport(programNode: TSESTree.Program): ImportAnalysisResult {
	try {
		// Find React import declaration
		let reactImport: TSESTree.ImportDeclaration | null = null;

		for (const statement of programNode.body) {
			if (
				statement.type === AST_NODE_TYPES.ImportDeclaration &&
				statement.source.value === 'react'
			) {
				reactImport = statement;
				break;
			}
		}

		// No React import found
		if (!reactImport) {
			return {
				style: ReactImportStyle.NONE,
				hasDefaultImport: false,
				hasNamedImports: false,
				hasMemoImport: false,
				importNode: null,
			};
		}

		// Analyze import specifiers
		let hasDefaultImport = false;
		let hasNamedImports = false;
		let hasNamespaceImport = false;
		let hasMemoImport = false;

		for (const specifier of reactImport.specifiers) {
			if (specifier.type === AST_NODE_TYPES.ImportDefaultSpecifier) {
				hasDefaultImport = true;
			} else if (specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier) {
				hasNamespaceImport = true;
			} else if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
				hasNamedImports = true;
				// Check if memo is imported
				if (
					specifier.imported.type === AST_NODE_TYPES.Identifier &&
					specifier.imported.name === 'memo'
				) {
					hasMemoImport = true;
				}
			}
		}

		// Determine import style
		let style: ReactImportStyle;
		if (hasNamespaceImport) {
			style = ReactImportStyle.NAMESPACE;
		} else if (hasDefaultImport && hasNamedImports) {
			style = ReactImportStyle.MIXED;
		} else if (hasDefaultImport) {
			style = ReactImportStyle.DEFAULT_ONLY;
		} else if (hasNamedImports) {
			style = ReactImportStyle.NAMED_ONLY;
		} else {
			// Edge case: empty import (shouldn't happen but handle gracefully)
			style = ReactImportStyle.NONE;
		}

		return {
			style,
			hasDefaultImport,
			hasNamedImports,
			hasMemoImport,
			importNode: reactImport,
		};
	} catch (error) {
		// Return safe default on error
		return {
			style: ReactImportStyle.NONE,
			hasDefaultImport: false,
			hasNamedImports: false,
			hasMemoImport: false,
			importNode: null,
		};
	}
}

/**
 * Icon environment enum
 */
export enum IconEnvironment {
	REACT_WEB = 'REACT_WEB',
	REACT_NATIVE = 'REACT_NATIVE',
}

/**
 * Environment detection result interface
 */
export interface EnvironmentDetectionResult {
	environment: IconEnvironment;
	hasReactNativeSvgImport: boolean;
	usesSvgComponent: boolean;
}

/**
 * Detect icon environment (React web vs React Native)
 * Checks for react-native-svg imports and <Svg> JSX elements
 * Defaults to React web if environment cannot be determined
 */
export function detectIconEnvironment(
	programNode: TSESTree.Program,
	svgNode?: TSESTree.JSXElement,
): EnvironmentDetectionResult {
	try {
		let hasReactNativeSvgImport = false;
		let usesSvgComponent = false;

		// Check for react-native-svg import
		for (const statement of programNode.body) {
			if (
				statement.type === AST_NODE_TYPES.ImportDeclaration &&
				statement.source.value === 'react-native-svg'
			) {
				hasReactNativeSvgImport = true;
				break;
			}
		}

		// Check if the provided SVG node uses <Svg> component (React Native)
		if (svgNode) {
			const elementName = getJSXElementName(svgNode);
			if (elementName === 'Svg') {
				usesSvgComponent = true;
			}
		}

		// If no SVG node provided, traverse the entire program to find <Svg> usage
		if (!svgNode) {
			traverseNode(programNode, (node) => {
				if (node.type === AST_NODE_TYPES.JSXElement) {
					const elementName = getJSXElementName(node);
					if (elementName === 'Svg') {
						usesSvgComponent = true;
					}
				}
			});
		}

		// Determine environment: React Native if either indicator is present
		const environment =
			hasReactNativeSvgImport || usesSvgComponent
				? IconEnvironment.REACT_NATIVE
				: IconEnvironment.REACT_WEB;

		return {
			environment,
			hasReactNativeSvgImport,
			usesSvgComponent,
		};
	} catch (error) {
		// Default to React web on error
		return {
			environment: IconEnvironment.REACT_WEB,
			hasReactNativeSvgImport: false,
			usesSvgComponent: false,
		};
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

/**
 * Import update strategy enum
 */
export enum ImportUpdateStrategy {
	NO_UPDATE = 'NO_UPDATE', // memo already available
	ADD_TO_NAMED = 'ADD_TO_NAMED', // add to existing named imports
	ADD_NAMED_TO_DEFAULT = 'ADD_NAMED_TO_DEFAULT', // add named imports to default-only import
	CREATE_NEW_IMPORT = 'CREATE_NEW_IMPORT', // create new import statement
}

/**
 * Memo strategy interface
 */
export interface MemoStrategy {
	memoReference: string; // 'React.memo' or 'memo'
	needsMemoImport: boolean;
	importUpdateStrategy: ImportUpdateStrategy;
}

/**
 * Select memo strategy based on React import analysis
 * Chooses between React.memo and memo based on import style
 */
export function selectMemoStrategy(analysis: ImportAnalysisResult): MemoStrategy {
	try {
		// If memo is already imported, use it directly
		if (analysis.hasMemoImport) {
			return {
				memoReference: 'memo',
				needsMemoImport: false,
				importUpdateStrategy: ImportUpdateStrategy.NO_UPDATE,
			};
		}

		// Namespace imports: use React.memo, no import changes needed
		if (analysis.style === ReactImportStyle.NAMESPACE) {
			return {
				memoReference: 'React.memo',
				needsMemoImport: false,
				importUpdateStrategy: ImportUpdateStrategy.NO_UPDATE,
			};
		}

		// Default-only imports: use React.memo, no import changes needed
		if (analysis.style === ReactImportStyle.DEFAULT_ONLY) {
			return {
				memoReference: 'React.memo',
				needsMemoImport: false,
				importUpdateStrategy: ImportUpdateStrategy.NO_UPDATE,
			};
		}

		// Named-only imports: add memo to existing named imports
		if (analysis.style === ReactImportStyle.NAMED_ONLY) {
			return {
				memoReference: 'memo',
				needsMemoImport: true,
				importUpdateStrategy: ImportUpdateStrategy.ADD_TO_NAMED,
			};
		}

		// Mixed imports: add memo to existing named imports
		if (analysis.style === ReactImportStyle.MIXED) {
			return {
				memoReference: 'memo',
				needsMemoImport: true,
				importUpdateStrategy: ImportUpdateStrategy.ADD_TO_NAMED,
			};
		}

		// No React import: create new import statement
		return {
			memoReference: 'memo',
			needsMemoImport: true,
			importUpdateStrategy: ImportUpdateStrategy.CREATE_NEW_IMPORT,
		};
	} catch (error) {
		// Safe fallback: use React.memo without import changes
		return {
			memoReference: 'React.memo',
			needsMemoImport: false,
			importUpdateStrategy: ImportUpdateStrategy.NO_UPDATE,
		};
	}
}

/**
 * Import update interface
 */
export interface ImportUpdate {
	fixes: { range: [number, number]; text: string }[];
	updatedImports: string[];
}

/**
 * Update imports to add memo if needed
 * Generates import modification fixes based on the strategy
 */
export function updateImports(
	strategy: MemoStrategy,
	importNode: TSESTree.ImportDeclaration | null,
	programNode: TSESTree.Program,
): ImportUpdate {
	try {
		const fixes: { range: [number, number]; text: string }[] = [];
		const updatedImports: string[] = [];

		// No update needed
		if (strategy.importUpdateStrategy === ImportUpdateStrategy.NO_UPDATE) {
			return { fixes, updatedImports };
		}

		// Add memo to existing named imports
		if (strategy.importUpdateStrategy === ImportUpdateStrategy.ADD_TO_NAMED) {
			if (!importNode || !importNode.range) {
				return { fixes, updatedImports };
			}

			// Find the named imports section
			const namedSpecifiers = importNode.specifiers.filter(
				(spec) => spec.type === AST_NODE_TYPES.ImportSpecifier,
			);

			if (namedSpecifiers.length === 0) {
				// This shouldn't happen for ADD_TO_NAMED, but handle gracefully
				return { fixes, updatedImports };
			}

			// Get the last named specifier to insert after it
			const lastNamedSpecifier = namedSpecifiers[namedSpecifiers.length - 1];
			if (!lastNamedSpecifier.range) {
				return { fixes, updatedImports };
			}

			// Insert ", memo" after the last named import
			const insertPosition = lastNamedSpecifier.range[1];
			fixes.push({
				range: [insertPosition, insertPosition],
				text: ', memo',
			});

			updatedImports.push('memo');
		}

		// Add named imports to default-only import
		if (strategy.importUpdateStrategy === ImportUpdateStrategy.ADD_NAMED_TO_DEFAULT) {
			if (!importNode || !importNode.range) {
				return { fixes, updatedImports };
			}

			// Find the default specifier
			const defaultSpecifier = importNode.specifiers.find(
				(spec) => spec.type === AST_NODE_TYPES.ImportDefaultSpecifier,
			);

			if (!defaultSpecifier || !defaultSpecifier.range) {
				return { fixes, updatedImports };
			}

			// Insert ", { memo }" after the default import
			const insertPosition = defaultSpecifier.range[1];
			fixes.push({
				range: [insertPosition, insertPosition],
				text: ', { memo }',
			});

			updatedImports.push('memo');
		}

		// Create new import statement
		if (strategy.importUpdateStrategy === ImportUpdateStrategy.CREATE_NEW_IMPORT) {
			// Insert at the beginning of the program
			const insertPosition = programNode.range ? programNode.range[0] : 0;
			fixes.push({
				range: [insertPosition, insertPosition],
				text: "import { memo } from 'react';\n",
			});

			updatedImports.push('memo');
		}

		return { fixes, updatedImports };
	} catch (error) {
		// Return empty fixes on error
		return { fixes: [], updatedImports: [] };
	}
}

/**
 * Type annotation strategy interface
 */
export interface TypeAnnotationStrategy {
	propsType: string; // 'React.SVGProps<SVGSVGElement>' or 'SvgProps'
	needsTypeImport: boolean;
	typeImportSource: string | null; // 'react-native-svg' or null
	needsComponentImport: boolean; // For React Native Svg component
}

/**
 * Get type annotation strategy based on environment and import style
 * Determines the appropriate props type for React web or React Native
 */
export function getTypeAnnotationStrategy(
	environment: IconEnvironment,
	importStyle: ReactImportStyle,
): TypeAnnotationStrategy {
	try {
		// React Native environment
		if (environment === IconEnvironment.REACT_NATIVE) {
			return {
				propsType: 'SvgProps',
				needsTypeImport: true,
				typeImportSource: 'react-native-svg',
				needsComponentImport: true,
			};
		}

		// React web environment
		// Use React.SVGProps for namespace imports, SVGProps for others
		if (importStyle === ReactImportStyle.NAMESPACE) {
			return {
				propsType: 'React.SVGProps<SVGSVGElement>',
				needsTypeImport: false,
				typeImportSource: null,
				needsComponentImport: false,
			};
		}

		// For other import styles, we could use SVGProps directly
		// but to keep it simple and consistent, use React.SVGProps
		return {
			propsType: 'React.SVGProps<SVGSVGElement>',
			needsTypeImport: false,
			typeImportSource: null,
			needsComponentImport: false,
		};
	} catch (error) {
		// Safe fallback: React web with React.SVGProps
		return {
			propsType: 'React.SVGProps<SVGSVGElement>',
			needsTypeImport: false,
			typeImportSource: null,
			needsComponentImport: false,
		};
	}
}

/**
 * Type annotation fix interface
 */
export interface TypeAnnotationFix {
	fixes: { range: [number, number]; text: string }[];
	success: boolean;
}

/**
 * Add type annotation to a component
 * Handles function declarations, arrow functions, and components with/without props
 */
export function addTypeAnnotation(
	componentNode: TSESTree.Node,
	strategy: TypeAnnotationStrategy,
	programNode: TSESTree.Program,
): TypeAnnotationFix {
	try {
		const fixes: { range: [number, number]; text: string }[] = [];

		// Handle function declaration: function Icon(props) { ... }
		if (componentNode.type === AST_NODE_TYPES.FunctionDeclaration) {
			const func = componentNode;

			// Check if function already has a typed props parameter
			if (func.params.length > 0) {
				const firstParam = func.params[0];

				// If parameter already has a type annotation, skip
				if (
					firstParam.type === AST_NODE_TYPES.Identifier &&
					firstParam.typeAnnotation
				) {
					return { fixes: [], success: false };
				}

				// Add type annotation to existing parameter
				if (firstParam.type === AST_NODE_TYPES.Identifier && firstParam.range) {
					const insertPosition = firstParam.range[1];
					fixes.push({
						range: [insertPosition, insertPosition],
						text: `: ${strategy.propsType}`,
					});
				}
			} else {
				// No props parameter, add one with type
				// The function has empty params (), we need to add props inside them
				// Find the opening parenthesis position (right after function name)
				if (func.id && func.id.range && func.body.range) {
					// The opening paren is right after the function name
					const openParenPosition = func.id.range[1];
					// Insert "props: Type" right after the opening paren
					// We need to replace the () with (props: Type)
					// Find the closing paren by looking at the body start
					const bodyStart = func.body.range[0];
					// The closing paren should be just before the body
					// We'll insert after the opening paren
					fixes.push({
						range: [openParenPosition + 1, openParenPosition + 1],
						text: `props: ${strategy.propsType}`,
					});
				}
			}
		}

		// Handle arrow function: const Icon = (props) => { ... }
		if (componentNode.type === AST_NODE_TYPES.VariableDeclarator) {
			const init = componentNode.init;

			if (init && init.type === AST_NODE_TYPES.ArrowFunctionExpression) {
				const arrowFunc = init;

				// Check if arrow function already has a typed props parameter
				if (arrowFunc.params.length > 0) {
					const firstParam = arrowFunc.params[0];

					// If parameter already has a type annotation, skip
					if (
						firstParam.type === AST_NODE_TYPES.Identifier &&
						firstParam.typeAnnotation
					) {
						return { fixes: [], success: false };
					}

					// Add type annotation to existing parameter
					if (firstParam.type === AST_NODE_TYPES.Identifier && firstParam.range) {
						const insertPosition = firstParam.range[1];
						fixes.push({
							range: [insertPosition, insertPosition],
							text: `: ${strategy.propsType}`,
						});
					}
				}
				// Note: We don't add props parameter if it doesn't exist
				// This would require more complex AST manipulation
			}
		}

		// Add React Native imports if needed
		if (strategy.needsTypeImport && strategy.typeImportSource) {
			// Check if react-native-svg import already exists
			let reactNativeSvgImport: TSESTree.ImportDeclaration | null = null;

			for (const statement of programNode.body) {
				if (
					statement.type === AST_NODE_TYPES.ImportDeclaration &&
					statement.source.value === strategy.typeImportSource
				) {
					reactNativeSvgImport = statement;
					break;
				}
			}

			if (reactNativeSvgImport) {
				// Check if SvgProps and Svg are already imported
				const importedNames = reactNativeSvgImport.specifiers
					.filter((spec) => spec.type === AST_NODE_TYPES.ImportSpecifier)
					.map((spec) => {
						if (spec.type === AST_NODE_TYPES.ImportSpecifier) {
							return spec.imported.type === AST_NODE_TYPES.Identifier
								? spec.imported.name
								: null;
						}
						return null;
					})
					.filter((name): name is string => name !== null);

				const needsSvgProps = !importedNames.includes('SvgProps');
				const needsSvg = strategy.needsComponentImport && !importedNames.includes('Svg');

				if (needsSvgProps || needsSvg) {
					// Add to existing import
					const namedSpecifiers = reactNativeSvgImport.specifiers.filter(
						(spec) => spec.type === AST_NODE_TYPES.ImportSpecifier,
					);

					if (namedSpecifiers.length > 0) {
						const lastSpecifier = namedSpecifiers[namedSpecifiers.length - 1];
						if (lastSpecifier.range) {
							const toAdd: string[] = [];
							if (needsSvgProps) toAdd.push('SvgProps');
							if (needsSvg) toAdd.push('Svg');

							fixes.push({
								range: [lastSpecifier.range[1], lastSpecifier.range[1]],
								text: `, ${toAdd.join(', ')}`,
							});
						}
					}
				}
			} else {
				// Create new react-native-svg import
				const toImport: string[] = ['SvgProps'];
				if (strategy.needsComponentImport) {
					toImport.push('Svg');
				}

				const insertPosition = programNode.range ? programNode.range[0] : 0;
				fixes.push({
					range: [insertPosition, insertPosition],
					text: `import { ${toImport.join(', ')} } from '${strategy.typeImportSource}';\n`,
				});
			}
		}

		return { fixes, success: fixes.length > 0 };
	} catch (error) {
		// Return empty fixes on error
		return { fixes: [], success: false };
	}
}
