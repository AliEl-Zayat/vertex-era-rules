import type { TSESTree } from '@typescript-eslint/utils';

/**
 * Validate JSX attribute has proper structure
 */
export function validateJSXAttributeStructure(attribute: TSESTree.JSXAttribute): boolean {
	if (attribute.name?.type !== 'JSXIdentifier') {
		return false;
	}
	return true;
}

/**
 * Get the name of a JSX attribute
 */
export function getAttributeName(attribute: TSESTree.JSXAttribute): string | null {
	if (!validateJSXAttributeStructure(attribute)) {
		return null;
	}
	if (attribute.name.type === 'JSXIdentifier') {
		return attribute.name.name;
	}
	return null;
}

/**
 * Get all attributes from a JSX opening element
 */
export function getAttributes(element: TSESTree.JSXOpeningElement): TSESTree.JSXAttribute[] {
	if (!element.attributes) {
		return [];
	}
	return element.attributes.filter(
		(attr): attr is TSESTree.JSXAttribute => attr.type === 'JSXAttribute'
	);
}

/**
 * Check if a JSX attribute value is an inline object expression
 */
export function isInlineObject(attribute: TSESTree.JSXAttribute): boolean {
	if (!validateJSXAttributeStructure(attribute)) {
		return false;
	}
	if (!attribute.value) return false;

	if (attribute.value.type === 'JSXExpressionContainer') {
		if (!attribute.value.expression || attribute.value.expression.type === 'JSXEmptyExpression') {
			return false;
		}
		return attribute.value.expression.type === 'ObjectExpression';
	}
	return false;
}

/**
 * Check if a JSX attribute value is an inline function
 */
export function isInlineFunction(attribute: TSESTree.JSXAttribute): boolean {
	if (!validateJSXAttributeStructure(attribute)) {
		return false;
	}
	if (!attribute.value) return false;

	if (attribute.value.type === 'JSXExpressionContainer') {
		if (!attribute.value.expression || attribute.value.expression.type === 'JSXEmptyExpression') {
			return false;
		}
		const { expression } = attribute.value;
		return (
			expression.type === 'ArrowFunctionExpression' || expression.type === 'FunctionExpression'
		);
	}
	return false;
}

/**
 * Extract prop value from JSX attribute
 */
export function getPropValue(attribute: TSESTree.JSXAttribute): TSESTree.Expression | null {
	if (!validateJSXAttributeStructure(attribute)) {
		return null;
	}
	if (!attribute.value) return null;

	if (attribute.value.type === 'JSXExpressionContainer') {
		if (attribute.value.expression.type !== 'JSXEmptyExpression') {
			return attribute.value.expression;
		}
	} else if (attribute.value.type === 'Literal') {
		return attribute.value;
	}
	return null;
}

/**
 * Validate JSX opening element structure
 */
export function validateJSXOpeningElement(node: TSESTree.Node): node is TSESTree.JSXOpeningElement {
	if (node.type !== 'JSXOpeningElement') return false;
	if (!node.name) return false;
	if (!Array.isArray(node.attributes)) return false;
	return true;
}

/**
 * Validate JSX element structure
 */
export function validateJSXElement(node: TSESTree.Node): node is TSESTree.JSXElement {
	if (node.type !== 'JSXElement') return false;
	if (!node.openingElement || !validateJSXOpeningElement(node.openingElement)) {
		return false;
	}
	if (!Array.isArray(node.children)) return false;
	return true;
}

/**
 * Validate JSX expression container structure
 */
export function validateJSXExpressionContainer(
	node: TSESTree.Node
): node is TSESTree.JSXExpressionContainer {
	if (node.type !== 'JSXExpressionContainer') return false;
	if (!node.expression) return false;
	return true;
}

/**
 * Validate JSX identifier structure
 */
export function validateJSXIdentifier(node: TSESTree.Node): node is TSESTree.JSXIdentifier {
	if (node.type !== 'JSXIdentifier') return false;
	if (!node.name || typeof node.name !== 'string') return false;
	return true;
}

/**
 * Check if a JSX attribute value is a variable reference (not inline)
 */
export function isVariableReference(attribute: TSESTree.JSXAttribute): boolean {
	if (!validateJSXAttributeStructure(attribute)) {
		return false;
	}
	if (!attribute.value) return false;

	if (attribute.value.type === 'JSXExpressionContainer') {
		if (!attribute.value.expression || attribute.value.expression.type === 'JSXEmptyExpression') {
			return false;
		}
		const { expression } = attribute.value;
		return expression.type === 'Identifier' || expression.type === 'MemberExpression';
	}
	return false;
}

/**
 * Safe wrapper for JSX validation that catches errors
 */
export function safeValidateJSX<T extends TSESTree.Node>(
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
 * Check if a JSX attribute value is a JSX element (e.g., <Icon />)
 */
export function isJSXElementValue(attribute: TSESTree.JSXAttribute): boolean {
	if (!validateJSXAttributeStructure(attribute)) {
		return false;
	}

	if (!attribute.value) return false;

	if (attribute.value.type === 'JSXExpressionContainer') {
		// Validate expression exists and is not empty
		if (!attribute.value.expression || attribute.value.expression.type === 'JSXEmptyExpression') {
			return false;
		}

		// Check if expression is a JSX element
		return (
			attribute.value.expression.type === 'JSXElement' ||
			attribute.value.expression.type === 'JSXFragment'
		);
	}

	// Check if value is a JSX element directly (without expression container)
	// Note: JSXAttribute.value can only be JSXExpressionContainer, Literal, or null
	// JSXElement and JSXFragment are only found inside JSXExpressionContainer
	return false;
}

/**
 * Check if a JSX attribute value is a component reference (e.g., Icon)
 * This detects when a component is passed as a reference, not as JSX
 */
export function isComponentReference(attribute: TSESTree.JSXAttribute): boolean {
	if (!validateJSXAttributeStructure(attribute)) {
		return false;
	}

	if (!attribute.value) return false;

	if (attribute.value.type === 'JSXExpressionContainer') {
		// Validate expression exists and is not empty
		if (!attribute.value.expression || attribute.value.expression.type === 'JSXEmptyExpression') {
			return false;
		}

		const { expression } = attribute.value;

		// Component references are identifiers (e.g., Icon) or member expressions (e.g., React.Component)
		// But NOT JSX elements, functions, or objects
		if (expression.type === 'JSXElement' || expression.type === 'JSXFragment') {
			return false;
		}

		if (expression.type === 'Identifier' || expression.type === 'MemberExpression') {
			// Additional check: make sure it's not a function call
			// Component references should be identifiers, not calls
			return true;
		}
	}

	return false;
}

/**
 * Check if a prop is used as a component in JSX (e.g., <PropName />)
 * This checks if an identifier is used as a JSX element name
 */
export function isPropUsedAsComponent(node: TSESTree.Node, propName: string): boolean {
	try {
		// Check if this is a JSX opening element
		if (node.type === 'JSXOpeningElement' || node.type === 'JSXElement') {
			const openingElement = node.type === 'JSXElement' ? node.openingElement : node;

			if (!openingElement || !openingElement.name) {
				return false;
			}

			// Check if the JSX element name matches the prop name
			if (openingElement.name.type === 'JSXIdentifier') {
				return openingElement.name.name === propName;
			}

			// Check for member expressions like <Some.Prop />
			if (openingElement.name.type === 'JSXMemberExpression') {
				// For now, we'll focus on simple identifiers
				// Member expressions are more complex and less common for prop usage
				return false;
			}
		}

		return false;
	} catch {
		return false;
	}
}

/**
 * Check if a prop is used as a value in JSX (e.g., {PropName})
 * This checks if an identifier is used inside a JSX expression container
 */
export function isPropUsedAsValue(node: TSESTree.Node, propName: string): boolean {
	try {
		// Check if this is a JSX expression container
		if (node.type === 'JSXExpressionContainer') {
			const expression = node.expression;

			// Check if expression is an identifier matching the prop name
			if (expression.type === 'Identifier') {
				return expression.name === propName;
			}

			// Check for member expressions like {Some.Prop}
			if (expression.type === 'MemberExpression') {
				// For simple cases, check if the property name matches
				if (expression.property.type === 'Identifier' && expression.property.name === propName) {
					return true;
				}
			}
		}

		// Also check if it's used in a JSX attribute value
		if (node.type === 'JSXAttribute' && node.value) {
			if (node.value.type === 'JSXExpressionContainer') {
				const expression = node.value.expression;
				if (expression.type === 'Identifier' && expression.name === propName) {
					return true;
				}
			}
		}

		return false;
	} catch {
		return false;
	}
}
