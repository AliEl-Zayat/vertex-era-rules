import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
declare const formsRules: {
    'form-config-extraction': {
        meta: {
            type: "problem";
            docs: {
                description: string;
                category: string;
                recommended: string;
                url: string;
            };
            schema: never[];
            messages: {
                inlineConfig: string;
                invalidNaming: string;
                invalidImportSource: string;
            };
        };
        create(context: TSESLint.RuleContext<"inlineConfig" | "invalidNaming" | "invalidImportSource", never[]>): {
            ImportDeclaration(node: TSESTree.ImportDeclaration): void;
            CallExpression(node: TSESTree.CallExpression): void;
        };
        defaultOptions: never[];
    };
};
export default formsRules;
//# sourceMappingURL=eslint-plugin-forms-rules.d.ts.map