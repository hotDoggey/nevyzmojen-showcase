// Authentication-specific validation helpers
// Generic rules live in mainjsHelpers/form_validation_rules.js but are
// re-exported here for backwards compatibility with existing imports.

import {
    validateRequiredField,
    validateEmail,
    validateName,
    validatePhoneNumberCountryCode,
    validatePhoneNumber,
} from "@/mainjsHelpers/form_validation_rules.js";

export {
    validateRequiredField,
    validateEmail,
    validateName,
    validatePhoneNumberCountryCode,
    validatePhoneNumber,
};

// Password rule remains here since it's specific to auth flows.
export function validatePassword(v, t) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(v)
        ? true
        : t
        ? t("invalid_password_format")
        : "Password must be at least 8 characters and contain numbers and both cases.";
}

// only needed if we want to export all rules as a single object and access it like this in a component:
// import validators from "../auth_helper_functions/auth_field_rules.js";
// in code: validators.validateEmail(...)

// export default {
//     validateEmail,
//     validateName,
//     validatePassword,
//     validatePhoneNumber,
//     validateRequiredField,
// };
// not using it at the moment so commenting out
