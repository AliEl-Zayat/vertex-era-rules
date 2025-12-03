import type { Linter } from "eslint";

/**
 * Redux typed hooks enforcement
 * Prevents direct usage of useSelector and useDispatch
 * Enforces useAppSelector and useAppDispatch instead
 */
export const reduxConfig: Linter.Config = {
  files: ["**/*.{js,jsx,ts,tsx}"],
  rules: {
    // Prevent direct Redux hook usage
    "no-restricted-syntax": [
      "error",
      {
        selector: 'CallExpression[callee.name="useDispatch"]',
        message: "Use useAppDispatch instead of useDispatch",
      },
      {
        selector: 'CallExpression[callee.name="useSelector"]',
        message: "Use useAppSelector instead of useSelector",
      },
    ],
    // Prevent importing untyped hooks
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "react-redux",
            importNames: ["useSelector", "useDispatch"],
            message:
              "Use 'useAppSelector' and 'useAppDispatch' instead for proper typing.",
          },
        ],
      },
    ],
  },
};

export default reduxConfig;








