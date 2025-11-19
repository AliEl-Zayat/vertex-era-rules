import type { TSESTree } from '@typescript-eslint/utils';
/**
 * Validate JSX attribute has proper structure
 */
export declare function validateJSXAttributeStructure(attribute: TSESTree.JSXAttribute): boolean;
/**
 * Get the name of a JSX attribute
 */
export declare function getAttributeName(attribute: TSESTree.JSXAttribute): string | null;
/**
 * Get all attributes from a JSX opening element
 */
export declare function getAttributes(element: TSESTree.JSXOpeningElement): TSESTree.JSXAttribute[];
/**
 * Check if a JSX attribute value is an inline object expression
 */
export declare function isInlineObject(attribute: TSESTree.JSXAttribute): boolean;
/**
 * Check if a JSX attribute value is an inline function
 */
export declare function isInlineFunction(attribute: TSESTree.JSXAttribute): boolean;
/**
 * Extract prop value from JSX attribute
 */
export declare function getPropValue(attribute: TSESTree.JSXAttribute): TSESTree.Expression | TSESTree.Literal | null;
/**
 * Validate JSX opening element structure
 */
export declare function validateJSXOpeningElement(node: TSESTree.Node): node is TSESTree.JSXOpeningElement;
/**
 * Validate JSX element structure
 */
export declare function validateJSXElement(node: TSESTree.Node): node is TSESTree.JSXElement;
/**
 * Validate JSX expression container structure
 */
export declare function validateJSXExpressionContainer(node: TSESTree.Node): node is TSESTree.JSXExpressionContainer;
/**
 * Validate JSX identifier structure
 */
export declare function validateJSXIdentifier(node: TSESTree.Node): node is TSESTree.JSXIdentifier;
/**
 * Check if a JSX attribute value is a variable reference (not inline)
 */
export declare function isVariableReference(attribute: TSESTree.JSXAttribute): boolean;
/**
 * Safe wrapper for JSX validation that catches errors
 */
export declare function safeValidateJSX<T extends TSESTree.Node>(node: TSESTree.Node | null | undefined, validator: (node: TSESTree.Node) => node is T): node is T;
//# sourceMappingURL=jsx-helpers.d.ts.map