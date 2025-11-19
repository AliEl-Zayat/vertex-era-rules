import eslint from '@eslint/js';
import type { Linter } from 'eslint';
import tseslint from 'typescript-eslint';

export const baseConfigs: Linter.Config[] = [
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	...tseslint.configs.stylistic,
	...tseslint.configs.strict,
	...tseslint.configs.strictTypeChecked,
	...tseslint.configs.strictTypeCheckedOnly,
];
