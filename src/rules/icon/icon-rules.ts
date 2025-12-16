import type { TSESTree } from "@typescript-eslint/utils";
import {
  analyzeReactImport,
  detectIconEnvironment,
  getTypeAnnotationStrategy,
  selectMemoStrategy,
  updateImports,
  validateExportDefaultDeclaration,
  validateJSXElement,
} from "../../utils/ast-helpers.js";
import { createRule } from "../../utils/create-rule.js";

interface IColorIssue {
  attribute: string;
  value: string;
  node: TSESTree.JSXAttribute;
}

// Performance optimization: Cache expensive color detection results
const multiColorCache = new WeakMap<TSESTree.JSXElement, boolean>();

function getAttributeValue(
  value: TSESTree.JSXAttribute["value"]
): string | null {
  if (!value) return null;

  if (value.type === "Literal") {
    return value.value as string;
  }

  if (value.type === "JSXExpressionContainer") {
    return null;
  }

  return null;
}

function checkForMultipleColors(
  node: TSESTree.JSXElement,
  colors: Set<string>
): boolean {
  if (colors.size > 1) {
    return true;
  }

  const attributes = node.openingElement.attributes;
  if (attributes && attributes.length > 0) {
    for (const attr of attributes) {
      if (attr.type !== "JSXAttribute") continue;
      if (attr.name.type !== "JSXIdentifier") continue;

      const attrName = attr.name.name;
      if (attrName !== "fill" && attrName !== "stroke") continue;

      if (!attr.value) continue;

      const colorValue = getAttributeValue(attr.value);
      if (
        !colorValue ||
        colorValue === "none" ||
        colorValue === "currentColor"
      ) {
        continue;
      }

      colors.add(colorValue);

      if (colors.size > 1) {
        return true;
      }
    }
  }

  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      if (child.type !== "JSXElement") continue;

      if (checkForMultipleColors(child, colors)) {
        return true;
      }
    }
  }

  return colors.size > 1;
}

function findColorAttributeIssues(node: TSESTree.JSXElement): IColorIssue[] {
  const issues: IColorIssue[] = [];

  function traverse(currentNode: TSESTree.JSXElement): void {
    const attributes = currentNode.openingElement.attributes;

    if (attributes && attributes.length > 0) {
      for (const attr of attributes) {
        if (attr.type !== "JSXAttribute") continue;
        if (attr.name.type !== "JSXIdentifier") continue;

        const attrName = attr.name.name;
        if (attrName !== "fill" && attrName !== "stroke") continue;

        if (!attr.value) continue;

        const value = getAttributeValue(attr.value);
        if (
          !value ||
          value === "currentColor" ||
          value === "none" ||
          value.includes("url(")
        ) {
          continue;
        }

        issues.push({
          attribute: attrName,
          value,
          node: attr,
        });
      }
    }

    const children = currentNode.children;
    if (children && children.length > 0) {
      for (const child of children) {
        if (child.type !== "JSXElement") continue;
        traverse(child);
      }
    }
  }

  traverse(node);
  return issues;
}

function getComponentName(
  declaration: TSESTree.ExportDefaultDeclaration["declaration"]
): string | null {
  if (declaration.type === "Identifier") {
    return declaration.name;
  }

  if (declaration.type === "FunctionDeclaration" && declaration.id) {
    return declaration.id.name;
  }

  if (
    declaration.type === "ArrowFunctionExpression" ||
    declaration.type === "FunctionExpression"
  ) {
    return null;
  }

  return null;
}

export const singleSvgPerFile = createRule({
  name: "single-svg-per-file",
  meta: {
    type: "problem",
    docs: {
      description:
        "Ensure only one SVG icon per file. This improves code organization, makes icons easier to find and maintain, and enables better tree-shaking in production builds.",
    },
    schema: [],
    messages: {
      multipleSvgs:
        "Multiple SVG icons found ({{count}} total). Each icon must be in its own file for better maintainability and tree-shaking. Consider splitting into separate icon files.",
    },
  },
  defaultOptions: [],
  create(context) {
    let svgCount = 0;

    return {
      JSXElement(node: TSESTree.JSXElement) {
        try {
          if (!validateJSXElement(node)) {
            return;
          }

          if (
            node.openingElement.name.type === "JSXIdentifier" &&
            node.openingElement.name.name === "svg"
          ) {
            svgCount++;

            if (svgCount > 1) {
              context.report({
                node,
                messageId: "multipleSvgs",
                data: { count: svgCount },
              });
            }
          }
        } catch (error) {
          console.error("Error in single-svg-per-file rule:", error);
        }
      },

      "Program:exit"() {
        svgCount = 0;
      },
    };
  },
});

export const svgCurrentcolor = createRule({
  name: "svg-currentcolor",
  meta: {
    type: "problem",
    docs: {
      description:
        "Ensure single-color SVGs use currentColor. This allows icons to inherit the text color from their parent element, making them more flexible and easier to theme.",
    },
    fixable: "code",
    schema: [],
    messages: {
      useCurrentColor:
        'Single-color SVG should use "currentColor" instead of {{attribute}}="{{value}}". This allows the icon to inherit the text color from its parent, making it more flexible and themeable.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      JSXElement(node: TSESTree.JSXElement) {
        try {
          if (!validateJSXElement(node)) {
            return;
          }

          if (
            node.openingElement.name.type === "JSXIdentifier" &&
            node.openingElement.name.name === "svg"
          ) {
            let hasMultipleColors = multiColorCache.get(node);

            if (hasMultipleColors === undefined) {
              const colors = new Set<string>();
              hasMultipleColors = checkForMultipleColors(node, colors);
              multiColorCache.set(node, hasMultipleColors);
            }

            if (!hasMultipleColors) {
              const colorIssues = findColorAttributeIssues(node);

              colorIssues.forEach((issue) => {
                context.report({
                  node: issue.node,
                  messageId: "useCurrentColor",
                  data: {
                    attribute: issue.attribute,
                    value: issue.value,
                  },
                  fix(fixer) {
                    if (!issue.node.value) return null;
                    return fixer.replaceText(
                      issue.node.value,
                      '"currentColor"'
                    );
                  },
                });
              });
            }
          }
        } catch (error) {
          console.error("Error in svg-currentcolor rule:", error);
        }
      },
    };
  },
});

export const memoizedExport = createRule({
  name: "memoized-export",
  meta: {
    type: "problem",
    docs: {
      description:
        "Ensure icon components are memoized using React.memo. This prevents unnecessary re-renders when the icon is used in parent components, improving performance especially when icons are used frequently.",
    },
    fixable: "code",
    schema: [],
    messages: {
      memoizeExport:
        'Icon component "{{componentName}}" should be wrapped with React.memo to prevent unnecessary re-renders. Use: export default memo({{componentName}});',
    },
  },
  defaultOptions: [],
  create(context) {
    let exportNode: TSESTree.ExportDefaultDeclaration | null = null;
    let svgNode: TSESTree.JSXElement | null = null;

    function checkExport(
      node: TSESTree.ExportDefaultDeclaration,
      svg: TSESTree.JSXElement | null
    ): void {
      try {
        if (!validateExportDefaultDeclaration(node)) {
          return;
        }

        const isMemoized =
          node.declaration.type === "CallExpression" &&
          node.declaration.callee.type === "Identifier" &&
          node.declaration.callee.name === "memo";

        if (!isMemoized) {
          const componentName = getComponentName(node.declaration);

          if (componentName) {
            context.report({
              node,
              messageId: "memoizeExport",
              data: { componentName },
              fix(fixer) {
                const sourceCode = context.sourceCode;
                const programNode = sourceCode.ast;

                const importAnalysis = analyzeReactImport(programNode);
                const envDetection = detectIconEnvironment(
                  programNode,
                  svg || undefined
                );
                const memoStrategy = selectMemoStrategy(importAnalysis);
                const typeStrategy = getTypeAnnotationStrategy(
                  envDetection.environment,
                  importAnalysis.style
                );

                const fixes: ReturnType<typeof fixer.replaceTextRange>[] = [];

                const importUpdate = updateImports(
                  memoStrategy,
                  importAnalysis.importNode,
                  programNode
                );

                importUpdate.fixes.forEach((fix) => {
                  fixes.push(fixer.replaceTextRange(fix.range, fix.text));
                });

                if (node.declaration.type === "FunctionDeclaration") {
                  const functionNode = node.declaration;
                  let functionText = sourceCode.getText(functionNode);

                  if (functionNode.params.length > 0) {
                    const firstParam = functionNode.params[0];
                    if (
                      firstParam.type === "Identifier" &&
                      !firstParam.typeAnnotation
                    ) {
                      const paramName = firstParam.name;
                      const paramPattern = new RegExp(
                        `\\(\\s*${paramName}\\s*\\)`
                      );
                      functionText = functionText.replace(
                        paramPattern,
                        `(${paramName}: ${typeStrategy.propsType})`
                      );
                    }
                  } else {
                    const emptyParamsPattern = /\(\s*\)/;
                    functionText = functionText.replace(
                      emptyParamsPattern,
                      `(props: ${typeStrategy.propsType})`
                    );
                  }

                  fixes.push(
                    fixer.replaceText(
                      node,
                      `${functionText}\n\nexport default ${memoStrategy.memoReference}(${componentName});`
                    )
                  );
                } else {
                  fixes.push(
                    fixer.replaceText(
                      node,
                      `export default ${memoStrategy.memoReference}(${componentName});`
                    )
                  );
                }

                return fixes;
              },
            });
          }
        }
      } catch (error) {
        console.error("Error in memoized-export rule:", error);
      }
    }

    return {
      JSXElement(node: TSESTree.JSXElement) {
        if (
          node.openingElement.name.type === "JSXIdentifier" &&
          (node.openingElement.name.name === "svg" ||
            node.openingElement.name.name === "Svg")
        ) {
          svgNode = node;

          if (exportNode) {
            checkExport(exportNode, svgNode);
            exportNode = null;
          }
        }
      },

      ExportDefaultDeclaration(node: TSESTree.ExportDefaultDeclaration) {
        exportNode = node;
      },

      "Program:exit"() {
        if (exportNode) {
          checkExport(exportNode, svgNode);
        }
      },
    };
  },
});

export default {
  "single-svg-per-file": singleSvgPerFile,
  "svg-currentcolor": svgCurrentcolor,
  "memoized-export": memoizedExport,
};






