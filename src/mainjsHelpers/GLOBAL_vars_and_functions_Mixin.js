// this helper exports a mixin, this is used for setting global properties and methods that can be used
// in all other places in the App. For example the textVar method can be used directly in the template of pages to fetch
// the correct translation for the given text Example: <router-link to="/about">{{ textVar("about") }} | </router-link>

import store from "../store.js"; // Import the Vuex store
// import textVar from "@/assets/xlang.js";

export default {
    data() {
        return {
            // moved to store module appConfig.js
            // prodHasDiffSizes: ["Mens T-shirts", "Womens T-shirts"],
            // globalContactEmail: "support@nevyzmojen.com",
            // contactNumber: "+359 777777788",
            // globalCommunications_Email: true, // Set to true to enable global communications email functionality
        };
    },
    computed: {
        // User details composite to be used later when fetching data from the store as this contains the
        // auth token that should stop users from accessing data that doesnt belong to them
        prodHasDiffSizes() {
            return this.$store.state.prodHasDiffSizes;
        },
        globalContactEmail() {
            return this.$store.state.globalContactEmail;
        },
        contactNumber() {
            return this.$store.state.contactNumber;
        },
        globalCommunications_Email() {
            return this.$store.state.globalCommunications_Email;
        },

        userDetails() {
            return store.getters.userDetails;
        },

        isLoading() {
            return store.getters.isLoading;
        },

        // Get the user lang value
        userLang() {
            return this.userDetails?.language || this.$store.getters.pageLang || "bg";
        },

        pageLang() {
            return this.$store.getters.pageLang;
        },
        authReady() {
            return this.$store.getters.authReady;
        },

        type_of_user_auth() {
            return this.$store.getters.authType; // "full_user" | "anon_user" | "null_user" | "unknown"
        },

        is_signed_in() {
            return this.$store.getters.is_signed_in;
        },

        full_user_authed() {
            return this.$store.getters.full_user_authed;
        },

        anon_user_authed() {
            return this.$store.getters.anon_user_authed;
        },

        null_user_authed() {
            return this.$store.getters.null_user_authed;
        },
    },
    methods: {
        // make the textVar function global to be used to get the correct translation for all text on the pages
        // textVar: textVar,
    },
};
