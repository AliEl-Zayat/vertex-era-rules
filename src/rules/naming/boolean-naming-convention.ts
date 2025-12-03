import type { TSESTree } from "@typescript-eslint/utils";
import { isIdentifier, isVariableDeclarator } from "../../utils/ast-helpers.js";
import { createRule } from "../../utils/create-rule.js";
import {
  hasExplicitBooleanAnnotation,
  isBooleanType,
} from "../../utils/type-helpers.js";

export interface IRuleOptions {
  prefix?: string;
  allowedPrefixes?: string[];
  allowedNames?: string[];
}

export const booleanNamingConvention = createRule<
  [IRuleOptions],
  "booleanNaming"
>({
  name: "boolean-naming-convention",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce boolean variables to follow naming convention with prefixes: is, as, or with (e.g., isEnabled, asBoolean, withFlag). This makes code more readable by clearly indicating that a variable holds a boolean value.",
    },
    schema: [
      {
        type: "object",
        properties: {
          prefix: {
            type: "string",
            default: "is",
          },
          allowedPrefixes: {
            type: "array",
            items: {
              type: "string",
            },
          },
          allowedNames: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      booleanNaming:
        "Boolean variable '{{name}}' should start with one of [{{prefixes}}] followed by a capital letter for better readability. Example: '{{prefix}}{{suggestedName}}'",
    },
  },
  defaultOptions: [
    {
      prefix: "is",
      allowedPrefixes: [
        "has",
        "should",
        "can",
        "will",
        "as",
        "with",
        "show",
        "hide",
        "open",
        "close",
      ],
      allowedNames: ["inset", "viewport", "defaultOpen", "open"],
    },
  ],
  create(context) {
    const options = context.options[0] || {};
    const prefix = options.prefix || "is";
    const allowedPrefixes = options.allowedPrefixes || [
      "has",
      "should",
      "can",
      "will",
      "as",
      "with",
      "show",
      "hide",
      "open",
      "close",
    ];
    const allowedNames = options.allowedNames || [
      "inset",
      "viewport",
      "defaultOpen",
      "open",
    ];
    const allPrefixes = [prefix, ...allowedPrefixes];

    function checkBooleanNaming(name: string, node: TSESTree.Node): void {
      // First check if the name is in the allowed names list (exact match)
      if (allowedNames.includes(name)) {
        return;
      }

      // Then check prefix patterns
      const primaryPrefix = allPrefixes[0];

      if (name.length > primaryPrefix.length) {
        const nextChar = name.charAt(primaryPrefix.length);
        if (
          name.startsWith(primaryPrefix) &&
          nextChar >= "A" &&
          nextChar <= "Z"
        ) {
          return;
        }

        for (let i = 1; i < allPrefixes.length; i++) {
          const p = allPrefixes[i];
          if (name.length > p.length) {
            const nextCharAlt = name.charAt(p.length);
            if (
              name.startsWith(p) &&
              nextCharAlt >= "A" &&
              nextCharAlt <= "Z"
            ) {
              return;
            }
          }
        }
      }

      const suggestedName = name.charAt(0).toUpperCase() + name.slice(1);

      context.report({
        node,
        messageId: "booleanNaming",
        data: {
          name,
          prefix,
          prefixes: allPrefixes.map((p) => `'${p}'`).join(", "),
          suggestedName,
        },
      });
    }

    function checkIsBooleanType(node: TSESTree.Node): boolean {
      return isBooleanType(node, context);
    }

    function checkHasExplicitBooleanAnnotation(node: TSESTree.Node): boolean {
      return hasExplicitBooleanAnnotation(node);
    }

    function isBooleanLiteral(node: TSESTree.Node | null): boolean {
      if (!node) return false;

      if (
        node.type === "Literal" &&
        typeof (node as TSESTree.Literal).value === "boolean"
      ) {
        return true;
      }

      if (
        node.type === "UnaryExpression" &&
        (node as TSESTree.UnaryExpression).operator === "!"
      ) {
        return true;
      }

      return false;
    }

    return {
      VariableDeclarator(node: TSESTree.VariableDeclarator) {
        try {
          if (!isVariableDeclarator(node) || !node.id) {
            return;
          }

          if (isIdentifier(node.id)) {
            const name = node.id.name;

            if (checkHasExplicitBooleanAnnotation(node.id)) {
              checkBooleanNaming(name, node.id);
            } else if (node.init && isBooleanLiteral(node.init)) {
              checkBooleanNaming(name, node.id);
            } else if (node.init && checkIsBooleanType(node.init)) {
              checkBooleanNaming(name, node.id);
            }
          }
        } catch (error) {
          console.error(
            "Error in boolean-naming-convention rule (VariableDeclarator):",
            error
          );
        }
      },

      FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
        try {
          if (!node.params || node.params.length === 0) {
            return;
          }

          for (const param of node.params) {
            if (!isIdentifier(param)) continue;

            if (checkHasExplicitBooleanAnnotation(param)) {
              checkBooleanNaming(param.name, param);
            }
          }
        } catch (error) {
          console.error(
            "Error in boolean-naming-convention rule (FunctionDeclaration):",
            error
          );
        }
      },

      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression) {
        try {
          if (!node.params || node.params.length === 0) {
            return;
          }

          for (const param of node.params) {
            if (!isIdentifier(param)) continue;

            if (checkHasExplicitBooleanAnnotation(param)) {
              checkBooleanNaming(param.name, param);
            }
          }
        } catch (error) {
          console.error(
            "Error in boolean-naming-convention rule (ArrowFunctionExpression):",
            error
          );
        }
      },

      FunctionExpression(node: TSESTree.FunctionExpression) {
        try {
          if (!node.params || node.params.length === 0) {
            return;
          }

          for (const param of node.params) {
            if (!isIdentifier(param)) continue;

            if (checkHasExplicitBooleanAnnotation(param)) {
              checkBooleanNaming(param.name, param);
            }
          }
        } catch (error) {
          console.error(
            "Error in boolean-naming-convention rule (FunctionExpression):",
            error
          );
        }
      },

      TSPropertySignature(node: TSESTree.TSPropertySignature) {
        try {
          if (!node.key || !node.typeAnnotation) {
            return;
          }

          if (
            isIdentifier(node.key) &&
            node.typeAnnotation.typeAnnotation.type === "TSBooleanKeyword"
          ) {
            checkBooleanNaming(node.key.name, node.key);
          }
        } catch (error) {
          console.error(
            "Error in boolean-naming-convention rule (TSPropertySignature):",
            error
          );
        }
      },
    };
  },
});

export default {
  "boolean-naming-convention": booleanNamingConvention,
};





