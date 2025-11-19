export const reduxConfig = {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
        // Prevent direct Redux hook usage
        'no-restricted-syntax': [
            'error',
            {
                selector: 'CallExpression[callee.name="useDispatch"]',
                message: 'Use useAppDispatch instead of useDispatch',
            },
            {
                selector: 'CallExpression[callee.name="useSelector"]',
                message: 'Use useAppSelector instead of useSelector',
            },
        ],
        // Prevent importing untyped hooks
        'no-restricted-imports': [
            'error',
            {
                paths: [
                    {
                        name: 'react-redux',
                        importNames: ['useSelector', 'useDispatch'],
                        message: "Use 'useAppSelector' and 'useAppDispatch' instead for proper typing.",
                    },
                ],
            },
        ],
    },
};
//# sourceMappingURL=redux.js.map