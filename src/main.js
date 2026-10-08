import { createApp } from "vue";
import RootComponentApp from "./App.vue";
// create a vue app
const app = createApp(RootComponentApp);

//-- <MODULES> --//
// giving just the folder will automatically find and exec the index.js
import home_page from "./modules/xhome_page_disabled";
import about_page from "./modules/about_page";
import store_page from "./modules/store_page";
import basket_page from "./modules/basket_page";
import authed_orders_page from "./modules/authed_orders_page";
import auth_and_accounts from "./modules/auth_and_accounts";
import theme_pack from "./modules/3theme_pack";
import stock_admin_page from "./modules/stock_admin_page";
import admin_page from "./modules/admin_page";

// import modules utility function:
import { registerModules } from "./mainjsHelpers/register-modules.js";

// run the util function with my object of modules:
registerModules({
    home_page: home_page,
    about_page: about_page,
    store_page: store_page,
    basket_page: basket_page,
    authed_orders_page: authed_orders_page,
    auth_and_accounts: auth_and_accounts,
    theme_pack: theme_pack,
    stock_admin_page: stock_admin_page,
    admin_page: admin_page,
});
//-- </MODULES> --//

// Adding a global function/object to the Vue prototype, this is accessible anywhere in the rest of the app and components using this.$xxx
// TODO: remove if not needed due to doing most of auth stuff in the store.js // app.config.globalProperties.$firebaseApp = firebaseApp;

// Add golobal components to the app before mounting it
import "@mdi/font/css/materialdesignicons.css";
import { FontAwesomeIcon } from "./mainjsHelpers/FontAwesomeSetup"; // Import from the FontAwesomeSetup module
import LoadingSpinner from "./components/LoadingSpinner.vue"; // Add a custom loading spinner component to be used anywhere
app.component("font-awesome-icon", FontAwesomeIcon);
app.component("LoadingSpinner", LoadingSpinner);

// Add Router
import router from "./router";
app.use(router);

// Use the Vuex store
import store from "./store.js"; // Import the Vuex store
app.use(store);

//-- <Vuetify> --//
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vue3-tel-input/dist/vue3-tel-input.css";

const vuetify = createVuetify({
    components,
    directives,
});
// Add Vuetify to vue app
app.use(vuetify);
//-- </Vuetify> --//

// Use the translation module from i18n
import i18n from "./assets/text_translations/i18n.js";
app.use(i18n);

// Mixins - basically global functions and vars accesible anywhere - make all methods and computed props in the mixin
// file available throughout the whole application
import GLOBAL_vars_and_functions_Mixin from "./mainjsHelpers/GLOBAL_vars_and_functions_Mixin.js";
app.mixin(GLOBAL_vars_and_functions_Mixin);

// Mount the app, prob dont need to assign to vm variable
const vm = app.mount("#app");
