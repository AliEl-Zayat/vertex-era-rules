import { RuleTester } from "@typescript-eslint/rule-tester";
import { afterAll, describe, it } from "vitest";
import { formConfigExtraction } from "../../../rules/forms/form-config-extraction.js";

RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("form-config-extraction", formConfigExtraction, {
  valid: [
    // Imported config from constants file with proper naming
    {
      code: `
				import { USER_FORM_CONFIG } from './user-form-constants.ts';
				const form = useForm(USER_FORM_CONFIG);
			`,
    },
    // useFormik with imported config
    {
      code: `
				import { PROFILE_FORM_CONFIG } from './profile-constants.ts';
				const formik = useFormik(PROFILE_FORM_CONFIG);
			`,
    },
    // No form hooks
    {
      code: `
				const data = useQuery();
			`,
    },
    // useForm without config arguments
    {
      code: `
				const form = useForm();
			`,
    },
  ],
  invalid: [
    // Inline form config
    {
      code: `
				const form = useForm({
					defaultValues: {
						name: ''
					}
				});
			`,
      errors: [{ messageId: "inlineConfig" }],
    },
    // Inline useFormik config
    {
      code: `
				const formik = useFormik({
					initialValues: {
						email: ''
					}
				});
			`,
      errors: [{ messageId: "inlineConfig" }],
    },
    // Invalid naming convention (camelCase instead of UPPER_SNAKE_CASE)
    {
      code: `
				import { userFormConfig } from './user-form-constants.ts';
				const form = useForm(userFormConfig);
			`,
      errors: [{ messageId: "invalidNaming" }],
    },
    // Invalid import source (not a constants file)
    {
      code: `
				import { USER_FORM_CONFIG } from './user-form.ts';
				const form = useForm(USER_FORM_CONFIG);
			`,
      errors: [{ messageId: "invalidImportSource" }],
    },
  ],
});
