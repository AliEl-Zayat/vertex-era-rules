import { type TSESTree } from '@typescript-eslint/utils';
/**
 * Type guard to check if a node is a valid JSX attribute
 */
export declare function isValidJSXAttribute(node: TSESTree.Node): node is TSESTree.JSXAttribute;
/**
 * Type guard to check if a node is a JSX element
 */
export declare function isJSXElement(node: TSESTree.Node): node is TSESTree.JSXElement;
/**
 * Type guard to check if a node is an identifier
 */
export declare function isIdentifier(node: TSESTree.Node): node is TSESTree.Identifier;
/**
 * Type guard to check if a node is a call expression
 */
export declare function isCallExpression(node: TSESTree.Node): node is TSESTree.CallExpression;
/**
 * Type guard to check if a node is an export default declaration
 */
export declare function isExportDefaultDeclaration(node: TSESTree.Node): node is TSESTree.ExportDefaultDeclaration;
/**
 * Type guard to check if a node is a variable declarator
 */
export declare function isVariableDeclarator(node: TSESTree.Node): node is TSESTree.VariableDeclarator;
/**
 * Validate JSX element structure
 */
export declare function validateJSXElement(node: TSESTree.Node): node is TSESTree.JSXElement;
/**
 * Validate JSX attribute structure
 */
export declare function validateJSXAttribute(node: TSESTree.Node): node is TSESTree.JSXAttribute;
/**
 * Validate export default declaration structure
 */
export declare function validateExportDefaultDeclaration(node: TSESTree.Node): node is TSESTree.ExportDefaultDeclaration;
/**
 * Get the name of a JSX element
 */
export declare function getJSXElementName(node: TSESTree.JSXElement): string | null;
/**
 * Traverse all child nodes of a given node
 * Optimized to minimize redundant checks and use early returns
 */
export declare function traverseNode(node: TSESTree.Node, visitor: (node: TSESTree.Node) => void): void;
/**
 * Validate that a node is a valid function parameter
 */
export declare function validateFunctionParameter(node: TSESTree.Node): node is TSESTree.Parameter;
/**
 * Validate that a node is a valid import declaration
 */
export declare function validateImportDeclaration(node: TSESTree.Node): node is TSESTree.ImportDeclaration;
/**
 * Validate that a node is a valid member expression
 */
export declare function validateMemberExpression(node: TSESTree.Node): node is TSESTree.MemberExpression;
/**
 * Validate that a node is a valid literal
 */
export declare function validateLiteral(node: TSESTree.Node): node is TSESTree.Literal;
/**
 * Validate that a node is a valid object expression
 */
export declare function validateObjectExpression(node: TSESTree.Node): node is TSESTree.ObjectExpression;
/**
 * Validate that a node is a valid arrow function expression
 */
export declare function validateArrowFunctionExpression(node: TSESTree.Node): node is TSESTree.ArrowFunctionExpression;
/**
 * Validate that a node is a valid function expression
 */
export declare function validateFunctionExpression(node: TSESTree.Node): node is TSESTree.FunctionExpression;
/**
 * Validate that a node is a valid call expression with proper structure
 */
export declare function validateCallExpression(node: TSESTree.Node): node is TSESTree.CallExpression;
/**
 * Validate that a node is a valid variable declaration
 */
export declare function validateVariableDeclaration(node: TSESTree.Node): node is TSESTree.VariableDeclaration;
/**
 * Validate that a node is a valid variable declarator with proper structure
 */
export declare function validateVariableDeclaratorStructure(node: TSESTree.Node): node is TSESTree.VariableDeclarator;
/**
 * Validate that a node is a valid TypeScript property signature
 */
export declare function validateTSPropertySignature(node: TSESTree.Node): node is TSESTree.TSPropertySignature;
/**
 * Validate that a node is a valid JSX expression container
 */
export declare function validateJSXExpressionContainer(node: TSESTree.Node): node is TSESTree.JSXExpressionContainer;
/**
 * Safe wrapper for node validation that catches errors
 */
export declare function safeValidate<T extends TSESTree.Node>(node: TSESTree.Node | null | undefined, validator: (node: TSESTree.Node) => node is T): node is T;
/**
 * Check if a node returns JSX
 * Used to identify React components
 */
export declare function returnsJSX(node: TSESTree.FunctionDeclaration | TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression): boolean;
/**
 * Check if a node is a React component
 * A React component is a function or class that returns JSX
 */
export declare function isReactComponent(node: TSESTree.Node): boolean;
/**
 * Check if a call expression is a form hook (useForm from react-hook-form or Formik)
 */
export declare function isFormHook(node: TSESTree.CallExpression): boolean;
/**
 * Check if a property key is a form configuration property
 */
export declare function isFormConfigProperty(key: string): boolean;
/**
 * Check if a filename matches the service path pattern (src/services/*)
 */
export declare function matchesServicePath(filename: string): boolean;
/**
 * Check if a ternary operator contains nested ternaries
 */
export declare function containsNestedTernary(node: TSESTree.ConditionalExpression): boolean;
/**
 * Check if a catch block is effectively empty (no statements, only whitespace/comments)
 */
export declare function isEffectivelyEmpty(catchClause: TSESTree.CatchClause): boolean;
/**
 * Check if a catch block has an intentional ignore comment
 */
export declare function hasIntentionalIgnoreComment(catchClause: TSESTree.CatchClause, sourceCode: unknown): boolean;
//# sourceMappingURL=ast-helpers.d.ts.map