/**
 * Validate JSX attribute has proper structure
 */
export function validateJSXAttributeStructure(attribute) {
    // Validate attribute has a name
    if (attribute.name?.type !== 'JSXIdentifier') {
        return false;
    }
    return true;
}
/**
 * Get the name of a JSX attribute
 */
export function getAttributeName(attribute) {
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
export function getAttributes(element) {
    if (!element.attributes) {
        return [];
    }
    return element.attributes.filter((attr) => attr.type === 'JSXAttribute');
}
/**
 * Check if a JSX attribute value is an inline object expression
 */
export function isInlineObject(attribute) {
    if (!validateJSXAttributeStructure(attribute)) {
        return false;
    }
    if (!attribute.value)
        return false;
    if (attribute.value.type === 'JSXExpressionContainer') {
        // Validate expression exists and is not empty
        if (!attribute.value.expression ||
            attribute.value.expression.type === 'JSXEmptyExpression') {
            return false;
        }
        return attribute.value.expression.type === 'ObjectExpression';
    }
    return false;
}
/**
 * Check if a JSX attribute value is an inline function
 */
export function isInlineFunction(attribute) {
    if (!validateJSXAttributeStructure(attribute)) {
        return false;
    }
    if (!attribute.value)
        return false;
    if (attribute.value.type === 'JSXExpressionContainer') {
        // Validate expression exists and is not empty
        if (!attribute.value.expression ||
            attribute.value.expression.type === 'JSXEmptyExpression') {
            return false;
        }
        const { expression } = attribute.value;
        return (expression.type === 'ArrowFunctionExpression' ||
            expression.type === 'FunctionExpression');
    }
    return false;
}
/**
 * Extract prop value from JSX attribute
 */
export function getPropValue(attribute) {
    if (!validateJSXAttributeStructure(attribute)) {
        return null;
    }
    if (!attribute.value)
        return null;
    if (attribute.value.type === 'JSXExpressionContainer') {
        if (attribute.value.expression.type !== 'JSXEmptyExpression') {
            return attribute.value.expression;
        }
    }
    else if (attribute.value.type === 'Literal') {
        return attribute.value;
    }
    return null;
}
/**
 * Validate JSX opening element structure
 */
export function validateJSXOpeningElement(node) {
    if (node.type !== 'JSXOpeningElement')
        return false;
    // Validate name exists
    if (!node.name)
        return false;
    // Validate attributes array exists
    if (!Array.isArray(node.attributes))
        return false;
    return true;
}
/**
 * Validate JSX element structure
 */
export function validateJSXElement(node) {
    if (node.type !== 'JSXElement')
        return false;
    // Validate opening element exists and is valid
    if (!node.openingElement || !validateJSXOpeningElement(node.openingElement)) {
        return false;
    }
    // Validate children array exists
    if (!Array.isArray(node.children))
        return false;
    return true;
}
/**
 * Validate JSX expression container structure
 */
export function validateJSXExpressionContainer(node) {
    if (node.type !== 'JSXExpressionContainer')
        return false;
    // Validate expression exists
    if (!node.expression)
        return false;
    return true;
}
/**
 * Validate JSX identifier structure
 */
export function validateJSXIdentifier(node) {
    if (node.type !== 'JSXIdentifier')
        return false;
    // Validate name exists
    if (!node.name || typeof node.name !== 'string')
        return false;
    return true;
}
/**
 * Check if a JSX attribute value is a variable reference (not inline)
 */
export function isVariableReference(attribute) {
    if (!validateJSXAttributeStructure(attribute)) {
        return false;
    }
    if (!attribute.value)
        return false;
    if (attribute.value.type === 'JSXExpressionContainer') {
        if (!attribute.value.expression ||
            attribute.value.expression.type === 'JSXEmptyExpression') {
            return false;
        }
        const { expression } = attribute.value;
        // Variable references are identifiers or member expressions
        return expression.type === 'Identifier' || expression.type === 'MemberExpression';
    }
    return false;
}
/**
 * Safe wrapper for JSX validation that catches errors
 */
export function safeValidateJSX(node, validator) {
    try {
        if (!node)
            return false;
        return validator(node);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=jsx-helpers.js.map