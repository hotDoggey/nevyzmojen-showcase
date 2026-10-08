// Generic form validation helpers reusable across the app
// moved here from auth_helper_functions so they can be imported
// by non-auth modules such as the checkout page.

export function validateRequiredField(v, t) {
    if (!v) return t ? t("required_field") : "Required field.";
    return true;
}

export function validateEmail(v, t) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(v)
        ? true
        : t
        ? t("invalid_email_format")
        : "Please enter a valid email.";
}

export function validateName(v, t) {
    const msg = t ? t("invalid_name") : "Please enter a valid name.";
    if (v == null) return msg;

    const s = String(v).trim();
    if (s.length < 2) return msg;

    // Allow letters (Unicode), combining marks (accents),
    // Pattern: word (letters) optionally joined by (' or -) letter-groups, then optional more words prefixed by space
    // Examples allowed: De Martino, O'Connor, Jean-Luc, José María, Müller
    // Includes common hyphen variants: - ‐ - – (ASCII hyphen, U+2010, U+2011, U+2013)
    const regex =
        /^\p{L}[\p{L}\p{M}]*(?:[’'\-\u2010\u2011\u2013]\p{L}[\p{L}\p{M}]*)*(?: \p{L}[\p{L}\p{M}]*(?:[’'\-\u2010\u2011\u2013]\p{L}[\p{L}\p{M}]*)*)*$/u;

    return regex.test(s) ? true : msg;
}

export function validatePhoneNumberCountryCode(v, t) {
    // This allows an optional +, followed by 1 to 4 digits (e.g., +359, +1, +44)
    const phoneNumberCountryCodeRegex = /^\+?[1-9]\d{0,3}$/;

    return phoneNumberCountryCodeRegex.test(v)
        ? true
        : t
        ? t("invalid_phone_number_country_code_format")
        : "Country code must be in format +359";
}

export function validatePhoneNumber(v, t) {
    const phoneNumberRegex = /^[0-9]{4,}$/;
    return phoneNumberRegex.test(v)
        ? true
        : t
        ? t("invalid_phone_number_format")
        : "Please enter a valid phone number.";
}
