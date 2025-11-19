import type { TSESTree } from '@typescript-eslint/utils';
import type { RuleContext } from '@typescript-eslint/utils/ts-eslint';
import type * as ts from 'typescript';
/**
 * Safely check if TypeScript parser services are available
 */
export declare function hasTypeServices(context: RuleContext<string, readonly unknown[]>): boolean;
/**
 * Safely get TypeScript type checker
 * Returns null if type services are unavailable
 */
export declare function getTypeChecker(context: RuleContext<string, readonly unknown[]>): ts.TypeChecker | null;
/**
 * Check if a node has an explicit boolean type annotation
 * This is the fallback when TypeScript type information is unavailable
 */
export declare function hasExplicitBooleanAnnotation(node: TSESTree.Node): boolean;
/**
 * Extract type annotation from a node
 */
export declare function getTypeAnnotation(node: TSESTree.Node): TSESTree.TSTypeAnnotation | null;
/**
 * Check if a type annotation is a boolean type
 */
export declare function isBooleanTypeAnnotation(typeAnnotation: TSESTree.TSTypeAnnotation): boolean;
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
export declare function isBooleanType(node: TSESTree.Node, context: RuleContext<string, readonly unknown[]>): boolean;
/**
 * Validate TypeScript type annotation structure
 */
export declare function validateTSTypeAnnotation(node: TSESTree.Node): node is TSESTree.TSTypeAnnotation;
/**
 * Validate that a node has a valid type annotation
 */
export declare function hasValidTypeAnnotation(node: TSESTree.Node): boolean;
/**
 * Validate identifier with type annotation
 */
export declare function validateIdentifierWithType(node: TSESTree.Node): node is TSESTree.Identifier;
/**
 * Safe wrapper for type validation that catches errors
 */
export declare function safeValidateType<T extends TSESTree.Node>(node: TSESTree.Node | null | undefined, validator: (node: TSESTree.Node) => node is T): node is T;
//# sourceMappingURL=type-helpers.d.ts.map