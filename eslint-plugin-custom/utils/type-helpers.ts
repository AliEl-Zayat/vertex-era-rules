// TypeScript type checking helpers
import type { TSESTree } from '@typescript-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';
import type * as ts from 'typescript';

// Performance optimization: Cache expensive type checking results
const typeCheckCache = new WeakMap<TSESTree.Node, boolean>();
const explicitAnnotationCache = new WeakMap<TSESTree.Node, boolean>();

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
 * Returns null if type services are unavailable
 */
export function getTypeChecker(
	context: RuleContext<string, readonly unknown[]>,
): ts.TypeChecker | null {
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
 * This is the fallback when TypeScript type information is unavailable
 */
export function hasExplicitBooleanAnnotation(node: TSESTree.Node): boolean {
	// Check cache first for performance
	const cached = explicitAnnotationCache.get(node);
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
					if (typeAnnotation?.typeAnnotation.type === 'TSBooleanKeyword') {
						result = true;
					}
				}
				break;
			}

			case 'Identifier': {
				// Check for function parameter with type annotation
				if ('typeAnnotation' in node) {
					const typeAnnotation = (node as { typeAnnotation?: TSESTree.TSTypeAnnotation })
						.typeAnnotation;
					if (typeAnnotation?.typeAnnotation?.type === 'TSBooleanKeyword') {
						result = true;
					}
				}
				break;
			}

			case 'TSPropertySignature': {
				// Check for property signature with boolean type
				const typeAnnotation = node.typeAnnotation;
				if (typeAnnotation?.typeAnnotation.type === 'TSBooleanKeyword') {
					result = true;
				}
				break;
			}

			default:
				// No other node types need checking
				result = false;
		}

		// Cache the result
		explicitAnnotationCache.set(node, result);
		return result;
	} catch {
		// If any error occurs during annotation checking, cache and return false
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
 * Falls back to explicit type annotation if type checker is unavailable
 *
 * This function implements robust error handling for cases where:
 * - TypeScript parser services are not available (e.g., JavaScript files)
 * - Type information cannot be determined
 * - AST node mapping fails
 *
 * Fallback strategy: Use explicit type annotations when type checker is unavailable
 */
export function isBooleanType(
	node: TSESTree.Node,
	context: RuleContext<string, readonly unknown[]>,
): boolean {
	// Check cache first for performance
	const cached = typeCheckCache.get(node);
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
					result = hasExplicitBooleanAnnotation(node);
					typeCheckCache.set(node, result);
					return result;
				}

				const type = checker.getTypeAtLocation(tsNode);

				// Early fallback: type information unavailable
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
				// Type checking failed, fall back to explicit annotation
				result = hasExplicitBooleanAnnotation(node);
				typeCheckCache.set(node, result);
				return result;
			}
		}

		// Type checker unavailable, fall back to explicit type annotation
		result = hasExplicitBooleanAnnotation(node);
		typeCheckCache.set(node, result);
		return result;
	} catch {
		// Catch-all: if any error occurs, fall back to explicit annotation
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

	// Validate typeAnnotation exists
	if (!node.typeAnnotation) return false;

	return true;
}

/**
 * Validate that a node has a valid type annotation
 */
export function hasValidTypeAnnotation(node: TSESTree.Node): boolean {
	try {
		if (!('typeAnnotation' in node)) return false;

		const typeAnnotation = (node as { typeAnnotation?: TSESTree.TSTypeAnnotation })
			.typeAnnotation;
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

	// Validate name exists
	if (!node.name || typeof node.name !== 'string') return false;

	return true;
}

/**
 * Safe wrapper for type validation that catches errors
 */
export function safeValidateType<T extends TSESTree.Node>(
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
