import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';

// Performance optimization: Cache expensive type checking results
const typeCheckCache = new WeakMap<TSESTree.Node, boolean>();
const explicitAnnotationCache = new WeakMap<TSESTree.Node, boolean>();
const reactNodeTypeCache = new WeakMap<TSESTree.Node, boolean>();
const reactNodeAnnotationCache = new WeakMap<TSESTree.Node, boolean>();

/**
 * Safely check if TypeScript parser services are available
 */
export function hasTypeServices(context: RuleContext<string, readonly unknown[]>): boolean {
	try {
		const services = ESLintUtils.getParserServices(context);
		return !!(services && services.program && services.esTreeNodeToTSNodeMap);
	} catch {
		return false;
	}
}

/**
 * Safely get TypeScript type checker
 */
export function getTypeChecker(
	context: RuleContext<string, readonly unknown[]>
): import('typescript').TypeChecker | null {
	try {
		if (!hasTypeServices(context)) {
			return null;
		}
		const services = ESLintUtils.getParserServices(context);
		return services.program.getTypeChecker();
	} catch {
		return null;
	}
}

/**
 * Check if a node has an explicit boolean type annotation
 */
export function hasExplicitBooleanAnnotation(node: TSESTree.Node): boolean {
	const cached = explicitAnnotationCache.get(node);
	if (cached !== undefined) {
		return cached;
	}

	try {
		let result = false;

		switch (node.type) {
			case 'VariableDeclarator': {
				if (node.id.type === 'Identifier') {
					const typeAnnotation = node.id.typeAnnotation;
					if (typeAnnotation?.typeAnnotation.type === 'TSBooleanKeyword') {
						result = true;
					}
				}
				break;
			}
			case 'Identifier': {
				if ('typeAnnotation' in node) {
					const typeAnnotation = (node as TSESTree.Identifier).typeAnnotation;
					if (typeAnnotation?.typeAnnotation?.type === 'TSBooleanKeyword') {
						result = true;
					}
				}
				break;
			}
			case 'TSPropertySignature': {
				const typeAnnotation = node.typeAnnotation;
				if (typeAnnotation?.typeAnnotation.type === 'TSBooleanKeyword') {
					result = true;
				}
				break;
			}
			default:
				result = false;
		}

		explicitAnnotationCache.set(node, result);
		return result;
	} catch {
		explicitAnnotationCache.set(node, false);
		return false;
	}
}

/**
 * Extract type annotation from a node
 */
export function getTypeAnnotation(node: TSESTree.Node): TSESTree.TSTypeAnnotation | null {
	try {
		if ('typeAnnotation' in node && node.typeAnnotation) {
			return node.typeAnnotation as TSESTree.TSTypeAnnotation;
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Check if a type annotation is a boolean type
 */
export function isBooleanTypeAnnotation(typeAnnotation: TSESTree.TSTypeAnnotation): boolean {
	try {
		return typeAnnotation.typeAnnotation.type === 'TSBooleanKeyword';
	} catch {
		return false;
	}
}

/**
 * Safely check if a node is a boolean type using TypeScript type checker
 */
export function isBooleanType(
	node: TSESTree.Node,
	context: RuleContext<string, readonly unknown[]>
): boolean {
	const cached = typeCheckCache.get(node);
	if (cached !== undefined) {
		return cached;
	}

	let result = false;
	try {
		const checker = getTypeChecker(context);
		if (checker) {
			try {
				const services = ESLintUtils.getParserServices(context);
				const tsNode = services.esTreeNodeToTSNodeMap.get(node);

				if (!tsNode) {
					result = hasExplicitBooleanAnnotation(node);
					typeCheckCache.set(node, result);
					return result;
				}

				const type = checker.getTypeAtLocation(tsNode);

				if (!type) {
					result = hasExplicitBooleanAnnotation(node);
					typeCheckCache.set(node, result);
					return result;
				}

				// TypeScript TypeFlags.Boolean = 1 << 4 = 16
				result = (type.flags & 16) !== 0;
				typeCheckCache.set(node, result);
				return result;
			} catch {
				result = hasExplicitBooleanAnnotation(node);
				typeCheckCache.set(node, result);
				return result;
			}
		}

		result = hasExplicitBooleanAnnotation(node);
		typeCheckCache.set(node, result);
		return result;
	} catch {
		result = hasExplicitBooleanAnnotation(node);
		typeCheckCache.set(node, result);
		return result;
	}
}

/**
 * Validate TypeScript type annotation structure
 */
export function validateTSTypeAnnotation(node: TSESTree.Node): node is TSESTree.TSTypeAnnotation {
	if (node.type !== 'TSTypeAnnotation') return false;
	if (!(node as TSESTree.TSTypeAnnotation).typeAnnotation) return false;
	return true;
}

/**
 * Validate that a node has a valid type annotation
 */
export function hasValidTypeAnnotation(node: TSESTree.Node): boolean {
	try {
		if (!('typeAnnotation' in node)) return false;
		const typeAnnotation = (node as { typeAnnotation?: TSESTree.TSTypeAnnotation }).typeAnnotation;
		if (!typeAnnotation) return false;
		return validateTSTypeAnnotation(typeAnnotation);
	} catch {
		return false;
	}
}

/**
 * Validate identifier with type annotation
 */
export function validateIdentifierWithType(node: TSESTree.Node): node is TSESTree.Identifier {
	if (node.type !== 'Identifier') return false;
	if (!node.name || typeof node.name !== 'string') return false;
	return true;
}

/**
 * Safe wrapper for type validation that catches errors
 */
export function safeValidateType<T extends TSESTree.Node>(
	node: T | null | undefined,
	validator: (node: T) => boolean
): boolean {
	try {
		if (!node) return false;
		return validator(node);
	} catch {
		return false;
	}
}

/**
 * Check if a type annotation is ReactNode or JSX.Element
 * Checks for: React.ReactNode, ReactNode, JSX.Element, JSXElement
 */
function isReactNodeTypeAnnotation(typeAnnotation: TSESTree.TSTypeAnnotation): boolean {
	try {
		const type = typeAnnotation.typeAnnotation;

		// Check for React.ReactNode or JSX.Element (qualified names)
		if (type.type === 'TSQualifiedName') {
			const left = type.left;
			const right = type.right;

			if (left.type === 'Identifier' && right.type === 'Identifier') {
				// React.ReactNode
				if (left.name === 'React' && right.name === 'ReactNode') {
					return true;
				}
				// JSX.Element
				if (left.name === 'JSX' && right.name === 'Element') {
					return true;
				}
			}
		}

		// Check for ReactNode or JSXElement (direct identifiers)
		if (type.type === 'TSTypeReference' && type.typeName.type === 'Identifier') {
			const name = type.typeName.name;
			if (name === 'ReactNode' || name === 'JSXElement') {
				return true;
			}
		}

		// Check for JSX.Element via TSTypeReference with qualified name
		if (type.type === 'TSTypeReference' && type.typeName.type === 'TSQualifiedName') {
			const left = type.typeName.left;
			const right = type.typeName.right;

			if (left.type === 'Identifier' && right.type === 'Identifier') {
				if (left.name === 'JSX' && right.name === 'Element') {
					return true;
				}
				if (left.name === 'React' && right.name === 'ReactNode') {
					return true;
				}
			}
		}

		return false;
	} catch {
		return false;
	}
}

/**
 * Check if a node has an explicit ReactNode or JSX.Element type annotation
 * This is the fallback when TypeScript type information is unavailable
 */
export function hasExplicitReactNodeAnnotation(node: TSESTree.Node): boolean {
	// Check cache first for performance
	const cached = reactNodeAnnotationCache.get(node);
	if (cached !== undefined) {
		return cached;
	}

	try {
		let result = false;

		// Use switch for more efficient type checking
		switch (node.type) {
			case 'VariableDeclarator': {
				// Check for variable declarator with type annotation
				if (node.id.type === 'Identifier') {
					const typeAnnotation = node.id.typeAnnotation;
					if (typeAnnotation) {
						result = isReactNodeTypeAnnotation(typeAnnotation);
					}
				}
				break;
			}

			case 'Identifier': {
				// Check for function parameter with type annotation
				if ('typeAnnotation' in node) {
					const typeAnnotation = (node as { typeAnnotation?: TSESTree.TSTypeAnnotation })
						.typeAnnotation;
					if (typeAnnotation) {
						result = isReactNodeTypeAnnotation(typeAnnotation);
					}
				}
				break;
			}

			case 'TSPropertySignature': {
				// Check for property signature with ReactNode type
				const typeAnnotation = node.typeAnnotation;
				if (typeAnnotation) {
					result = isReactNodeTypeAnnotation(typeAnnotation);
				}
				break;
			}

			case 'Property': {
				// Check for object property in destructuring with type annotation
				if (node.key.type === 'Identifier' && 'typeAnnotation' in node.key) {
					const typeAnnotation = (node.key as { typeAnnotation?: TSESTree.TSTypeAnnotation })
						.typeAnnotation;
					if (typeAnnotation) {
						result = isReactNodeTypeAnnotation(typeAnnotation);
					}
				}
				break;
			}

			default:
				// No other node types need checking
				result = false;
		}

		// Cache the result
		reactNodeAnnotationCache.set(node, result);
		return result;
	} catch {
		// If any error occurs during annotation checking, cache and return false
		reactNodeAnnotationCache.set(node, false);
		return false;
	}
}

/**
 * Check if a TypeScript type is ReactNode or JSX.Element using type checker
 */
function isReactNodeTypeInChecker(
	type: import('typescript').Type,
	checker: import('typescript').TypeChecker
): boolean {
	try {
		// Get the type symbol
		const symbol = type.getSymbol();
		if (symbol) {
			const name = symbol.getName();
			// Check for ReactNode
			if (name === 'ReactNode') {
				return true;
			}
			// Check for JSX.Element
			// We check the type string representation instead of symbol parent
			// since getParent() is not available on Symbol
		}

		// Check type's string representation for ReactNode patterns
		const typeString = checker.typeToString(type);
		if (
			typeString.includes('ReactNode') ||
			typeString.includes('JSX.Element') ||
			typeString.includes('React.ReactNode')
		) {
			return true;
		}

		// Check if it's a union type that includes ReactNode
		if (type.isUnion()) {
			for (const unionType of type.types) {
				if (isReactNodeTypeInChecker(unionType, checker)) {
					return true;
				}
			}
		}

		// Check if it's an intersection type that includes ReactNode
		if (type.isIntersection()) {
			for (const intersectionType of type.types) {
				if (isReactNodeTypeInChecker(intersectionType, checker)) {
					return true;
				}
			}
		}

		return false;
	} catch {
		return false;
	}
}

/**
 * Safely check if a node is a ReactNode or JSX.Element type using TypeScript type checker
 * Falls back to explicit type annotation if type checker is unavailable
 *
 * This function implements robust error handling for cases where:
 * - TypeScript parser services are not available (e.g., JavaScript files)
 * - Type information cannot be determined
 * - AST node mapping fails
 *
 * Fallback strategy: Use explicit type annotations when type checker is unavailable
 */
export function isReactNodeType(
	node: TSESTree.Node,
	context: RuleContext<string, readonly unknown[]>
): boolean {
	// Check cache first for performance
	const cached = reactNodeTypeCache.get(node);
	if (cached !== undefined) {
		return cached;
	}

	let result = false;

	try {
		const checker = getTypeChecker(context);

		if (checker) {
			// Try to use TypeScript type checker
			try {
				const services = ESLintUtils.getParserServices(context);
				const tsNode = services.esTreeNodeToTSNodeMap.get(node);

				// Early fallback: node mapping failed
				if (!tsNode) {
					result = hasExplicitReactNodeAnnotation(node);
					reactNodeTypeCache.set(node, result);
					return result;
				}

				const type = checker.getTypeAtLocation(tsNode);

				// Early fallback: type information unavailable
				if (!type) {
					result = hasExplicitReactNodeAnnotation(node);
					reactNodeTypeCache.set(node, result);
					return result;
				}

				// Check if type is ReactNode or JSX.Element
				result = isReactNodeTypeInChecker(type, checker);
				reactNodeTypeCache.set(node, result);
				return result;
			} catch {
				// Type checking failed, fall back to explicit annotation
				result = hasExplicitReactNodeAnnotation(node);
				reactNodeTypeCache.set(node, result);
				return result;
			}
		}

		// Type checker unavailable, fall back to explicit type annotation
		result = hasExplicitReactNodeAnnotation(node);
		reactNodeTypeCache.set(node, result);
		return result;
	} catch {
		// Catch-all: if any error occurs, fall back to explicit annotation
		result = hasExplicitReactNodeAnnotation(node);
		reactNodeTypeCache.set(node, result);
		return result;
	}
}
