import { ESLintUtils } from "@typescript-eslint/utils";

/**
 * Creates a typed ESLint rule with proper type inference.
 *
 * This utility uses ESLintUtils.RuleCreator from @typescript-eslint/utils
 * to provide full type safety for rule creation, including:
 * - Typed context object with report, options, etc.
 * - Typed AST node visitors
 * - Proper message ID inference
 * - Schema validation
 *
 * @example
 * ```typescript
 * import { createRule } from '../utils/create-rule.js';
 *
 * export const myRule = createRule({
 *   name: 'my-rule',
 *   meta: {
 *     type: 'problem',
 *     docs: { description: 'My rule description' },
 *     schema: [],
 *     messages: { error: 'Error message' },
 *   },
 *   defaultOptions: [],
 *   create(context) {
 *     // context is fully typed!
 *     return {
 *       Identifier(node) {
 *         context.report({ node, messageId: 'error' });
 *       },
 *     };
 *   },
 * });
 * ```
 */
export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/AliEl-Zayat/eslint-rules-zayat/blob/main/docs/rules/${name}.md`
);

export default createRule;

