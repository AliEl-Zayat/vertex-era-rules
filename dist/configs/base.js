import eslint from '@eslint/js';
import pluginImport from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unusedImportsPlugin from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';
/**
 * Base configuration preset for @vertex-era-rules
 *
 * Includes:
 * - Core ESLint recommended rules
 * - TypeScript recommended, stylistic, and strict rules
 * - Import management and sorting
 * - Prettier integration
 *
 * This preset does NOT include any custom rules.
 * Use 'recommended' or 'strict' presets to enable custom rules.
 */
export const baseConfig = [
    // ESLint and TypeScript base configs
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...tseslint.configs.stylistic,
    ...tseslint.configs.strict,
    // TypeScript configuration
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            // Non-type-aware rules (safe to use without project config)
            '@typescript-eslint/consistent-generic-constructors': 'error',
            '@typescript-eslint/array-type': 'error',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/ban-tslint-comment': 'error',
            // Disable base rules in favor of TS versions
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
        },
    },
    // Import management
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            'import': pluginImport,
            'simple-import-sort': simpleImportSortPlugin,
            'unused-imports': unusedImportsPlugin,
        },
        rules: {
            // Unused imports & variables
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    varsIgnorePattern: '^(_|k)',
                    args: 'after-used',
                    argsIgnorePattern: '^(_|k)',
                },
            ],
            // Import sorting
            'import/order': 'off',
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        ['^react$', '^react-dom$', '^react', '^@?\\w'],
                        [
                            '^@(?:assets|constants|types|lib|hooks|store|services|pages|components|ui|forms|contexts|providers)(?:/.*)?$',
                            '^@/',
                        ],
                        ['^\\u0000'],
                        ['^\\.\\.(?!/?$)', '^\\./(?=.*/)(?!/?$)', '^\\./?$'],
                        ['^.+\\.s?css$', '^.+\\.(?:svg|png|jpe?g|gif|ico|ttf|woff2?)$'],
                    ],
                },
            ],
            'simple-import-sort/exports': 'error',
            // Type imports
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'separate-type-imports',
                },
            ],
            // Node protocol
            'import/enforce-node-protocol-usage': ['error', 'always'],
        },
        settings: {
            'import/internal-regex': '^@(?:assets|constants|types|lib|hooks|store|services|pages|components|ui|forms|contexts|providers)(?:/.*)?$',
            'import/resolver': {
                typescript: {
                    project: './tsconfig.json',
                },
            },
        },
    },
    // Prettier integration
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: {
            prettier: prettierPlugin,
        },
        rules: {
            'prettier/prettier': 'error',
        },
    },
    // React configuration
    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        rules: {
            'react/react-in-jsx-scope': 'off',
            'no-console': 'error',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
];
//# sourceMappingURL=base.js.map