import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
export const baseConfigs = [
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.stylistic,
    ...tseslint.configs.strict,
    ...tseslint.configs.strictTypeChecked,
    ...tseslint.configs.strictTypeCheckedOnly,
];
//# sourceMappingURL=base.js.map