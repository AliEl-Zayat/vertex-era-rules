import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
declare const servicesRules: {
    'no-response-data-return': {
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
                directResponseDataReturn: string;
            };
        };
        create(context: TSESLint.RuleContext<"directResponseDataReturn", never[]>): {
            ReturnStatement?: undefined;
        } | {
            ReturnStatement(node: TSESTree.ReturnStatement): void;
        };
        defaultOptions: never[];
    };
};
export default servicesRules;
//# sourceMappingURL=eslint-plugin-services-rules.d.ts.map