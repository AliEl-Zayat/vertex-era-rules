import type { TSESTree } from "@typescript-eslint/utils";

/**
 * Validate JSX attribute has proper structure
 */
export function validateJSXAttributeStructure(
  attribute: TSESTree.JSXAttribute
): boolean {
  if (attribute.name?.type !== "JSXIdentifier") {
    return false;
  }
  return true;
}

/**
 * Get the name of a JSX attribute
 */
export function getAttributeName(
  attribute: TSESTree.JSXAttribute
): string | null {
  if (!validateJSXAttributeStructure(attribute)) {
    return null;
  }
  if (attribute.name.type === "JSXIdentifier") {
    return attribute.name.name;
  }
  return null;
}

/**
 * Get all attributes from a JSX opening element
 */
export function getAttributes(
  element: TSESTree.JSXOpeningElement
): TSESTree.JSXAttribute[] {
  if (!element.attributes) {
    return [];
  }
  return element.attributes.filter(
    (attr): attr is TSESTree.JSXAttribute => attr.type === "JSXAttribute"
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

  if (attribute.value.type === "JSXExpressionContainer") {
    if (
      !attribute.value.expression ||
      attribute.value.expression.type === "JSXEmptyExpression"
    ) {
      return false;
    }
    return attribute.value.expression.type === "ObjectExpression";
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

  if (attribute.value.type === "JSXExpressionContainer") {
    if (
      !attribute.value.expression ||
      attribute.value.expression.type === "JSXEmptyExpression"
    ) {
      return false;
    }
    const { expression } = attribute.value;
    return (
      expression.type === "ArrowFunctionExpression" ||
      expression.type === "FunctionExpression"
    );
  }
  return false;
}

/**
 * Extract prop value from JSX attribute
 */
export function getPropValue(
  attribute: TSESTree.JSXAttribute
): TSESTree.Expression | null {
  if (!validateJSXAttributeStructure(attribute)) {
    return null;
  }
  if (!attribute.value) return null;

  if (attribute.value.type === "JSXExpressionContainer") {
    if (attribute.value.expression.type !== "JSXEmptyExpression") {
      return attribute.value.expression;
    }
  } else if (attribute.value.type === "Literal") {
    return attribute.value;
  }
  return null;
}

/**
 * Validate JSX opening element structure
 */
export function validateJSXOpeningElement(
  node: TSESTree.Node
): node is TSESTree.JSXOpeningElement {
  if (node.type !== "JSXOpeningElement") return false;
  if (!node.name) return false;
  if (!Array.isArray(node.attributes)) return false;
  return true;
}

/**
 * Validate JSX element structure
 */
export function validateJSXElement(
  node: TSESTree.Node
): node is TSESTree.JSXElement {
  if (node.type !== "JSXElement") return false;
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
  if (node.type !== "JSXExpressionContainer") return false;
  if (!node.expression) return false;
  return true;
}

/**
 * Validate JSX identifier structure
 */
export function validateJSXIdentifier(
  node: TSESTree.Node
): node is TSESTree.JSXIdentifier {
  if (node.type !== "JSXIdentifier") return false;
  if (!node.name || typeof node.name !== "string") return false;
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

  if (attribute.value.type === "JSXExpressionContainer") {
    if (
      !attribute.value.expression ||
      attribute.value.expression.type === "JSXEmptyExpression"
    ) {
      return false;
    }
    const { expression } = attribute.value;
    return (
      expression.type === "Identifier" || expression.type === "MemberExpression"
    );
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








