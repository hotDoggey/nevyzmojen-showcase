// import i18n.js for localisation and translations
import { createI18n } from "vue-i18n";

// 1. Import translations
import translations from "./translations.json";
// import countries from "./countries.json";

// 2. Combine all sources into one big object
const allTranslations = {
    ...translations,
    // ...countries,
};

let debug = false;

// example of my translations file structure
// "account": {
//     "bg": "account_bg_text"
//     "en": "Account",
// },

// example of what is accepted by i18n
// bg: {
//     account: "account_bg_text";
// }
// en: {
//     account: "Account";
// }

const messages = {};

// Transform the consolidated allTranslations into the structure expected by vue-i18n
Object.keys(allTranslations).forEach((key) => {
    // for each lang entry in the object
    Object.keys(allTranslations[key]).forEach((lang) => {
        // if a new lang, add that lang as a new one to messages
        if (!messages[lang]) {
            messages[lang] = {};
        }
        // add the specific translation entry to each lang object
        messages[lang][key] = allTranslations[key][lang];
    });
});

if (debug) console.log("messages: ", messages);

// create a i18n instance
const i18n = createI18n({
    locale: "bg", // Set the default locale
    fallbackLocale: "en", // Set the fallback locale
    keySeparator: ".", // allow nesting
    // returnNull: true, TODO: check this works
    messages, // Set languages to use
});
if (debug) console.log("this ran and initiated i18n and set the default locale to bg");
export default i18n;
