import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import type { RuleContext } from "@typescript-eslint/utils/ts-eslint";

// Performance optimization: Cache expensive type checking results
const typeCheckCache = new WeakMap<TSESTree.Node, boolean>();
const explicitAnnotationCache = new WeakMap<TSESTree.Node, boolean>();

/**
 * Safely check if TypeScript parser services are available
 */
export function hasTypeServices(
  context: RuleContext<string, readonly unknown[]>
): boolean {
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
): import("typescript").TypeChecker | null {
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
      case "VariableDeclarator": {
        if (node.id.type === "Identifier") {
          const typeAnnotation = node.id.typeAnnotation;
          if (typeAnnotation?.typeAnnotation.type === "TSBooleanKeyword") {
            result = true;
          }
        }
        break;
      }
      case "Identifier": {
        if ("typeAnnotation" in node) {
          const typeAnnotation = (node as TSESTree.Identifier).typeAnnotation;
          if (typeAnnotation?.typeAnnotation?.type === "TSBooleanKeyword") {
            result = true;
          }
        }
        break;
      }
      case "TSPropertySignature": {
        const typeAnnotation = node.typeAnnotation;
        if (typeAnnotation?.typeAnnotation.type === "TSBooleanKeyword") {
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
export function getTypeAnnotation(
  node: TSESTree.Node
): TSESTree.TSTypeAnnotation | null {
  try {
    if ("typeAnnotation" in node && node.typeAnnotation) {
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
export function isBooleanTypeAnnotation(
  typeAnnotation: TSESTree.TSTypeAnnotation
): boolean {
  try {
    return typeAnnotation.typeAnnotation.type === "TSBooleanKeyword";
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
export function validateTSTypeAnnotation(
  node: TSESTree.Node
): node is TSESTree.TSTypeAnnotation {
  if (node.type !== "TSTypeAnnotation") return false;
  if (!(node as TSESTree.TSTypeAnnotation).typeAnnotation) return false;
  return true;
}

/**
 * Validate that a node has a valid type annotation
 */
export function hasValidTypeAnnotation(node: TSESTree.Node): boolean {
  try {
    if (!("typeAnnotation" in node)) return false;
    const typeAnnotation = (
      node as { typeAnnotation?: TSESTree.TSTypeAnnotation }
    ).typeAnnotation;
    if (!typeAnnotation) return false;
    return validateTSTypeAnnotation(typeAnnotation);
  } catch {
    return false;
  }
}

/**
 * Validate identifier with type annotation
 */
export function validateIdentifierWithType(
  node: TSESTree.Node
): node is TSESTree.Identifier {
  if (node.type !== "Identifier") return false;
  if (!node.name || typeof node.name !== "string") return false;
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








