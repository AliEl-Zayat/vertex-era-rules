import globals from 'globals';
export const javascriptConfig = {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.node,
        },
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
            projectService: true,
        },
    },
    rules: {
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/consistent-type-imports': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/naming-convention': 'off',
    },
};
//# sourceMappingURL=javascript.js.map