"use strict";
// Test file for boolean naming convention rule
// ❌ These should trigger errors (no proper prefix)
const enabled = true;
const visible = false;
const nonIsNamed = true;
const active = true;
// ✅ These should be fine (proper prefixes)
const isEnabled = true;
const hasPermission = false;
const shouldShow = true;
const canEdit = false;
const willUpdate = true;
const asBoolean = true;
const withFlag = false;
//# sourceMappingURL=test-boolean-naming.js.map