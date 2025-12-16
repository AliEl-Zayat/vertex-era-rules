import type { TSESTree } from "@typescript-eslint/utils";
import { createRule } from "../../utils/create-rule.js";

export const noNestedTernary = createRule({
  name: "no-nested-ternary",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Disallow nested ternary operators. Nested ternaries are difficult to read and understand. Use if-else statements or extract the logic into a well-named function for better code clarity.",
    },
    messages: {
      noNestedTernary:
        "Nested ternary operators reduce code readability. Refactor to if-else statements or extract to a descriptive function (e.g., getStatusColor, calculateDiscount).",
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    function containsNestedTernary(node: TSESTree.Node): boolean {
      if (node.type === "ConditionalExpression") {
        return true;
      }

      if (node.type === "TSAsExpression" || node.type === "TSTypeAssertion") {
        return containsNestedTernary(node.expression);
      }

      return false;
    }

    function hasNestedTernary(node: TSESTree.ConditionalExpression): boolean {
      return (
        containsNestedTernary(node.consequent) ||
        containsNestedTernary(node.alternate)
      );
    }

    return {
      ConditionalExpression(node: TSESTree.ConditionalExpression) {
        if (hasNestedTernary(node)) {
          context.report({
            node,
            messageId: "noNestedTernary",
          });
        }
      },
    };
  },
});

export default {
  "no-nested-ternary": noNestedTernary,
};









