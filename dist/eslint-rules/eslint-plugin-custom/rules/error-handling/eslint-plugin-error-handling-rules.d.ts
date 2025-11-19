import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
declare const errorHandlingRules: {
    'no-empty-catch': {
        meta: {
            type: "problem";
            docs: {
                description: string;
                category: string;
                recommended: string;
                url: string;
            };
            fixable: "code";
            schema: never[];
            messages: {
                emptyCatch: string;
                unusedParam: string;
            };
        };
        create(context: TSESLint.RuleContext<"emptyCatch" | "unusedParam", never[]>): {
            CatchClause(node: TSESTree.CatchClause): void;
        };
        defaultOptions: never[];
    };
};
export default errorHandlingRules;
//# sourceMappingURL=eslint-plugin-error-handling-rules.d.ts.map