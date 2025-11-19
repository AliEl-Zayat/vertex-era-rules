import { ESLintUtils } from '@typescript-eslint/utils';
type TOptions = [
    {
        prefix?: string;
        allowedPrefixes?: string[];
    }?
];
declare const namingRules: {
    'boolean-naming-convention': ESLintUtils.RuleModule<"booleanNaming", TOptions, unknown, ESLintUtils.RuleListener>;
};
export default namingRules;
//# sourceMappingURL=eslint-plugin-naming-rules.d.ts.map