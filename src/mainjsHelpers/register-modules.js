const debug = 0;
import router from "../router.js";
import store from "../store.js"; // Import the Vuex store

// private helper function used to register the store and router of a module on the global store and router
const registerModule = (name, module) => {
    if (debug) console.log("name: ", name);
    if (module.store) {
        store.registerModule(name, module.store);
    }
    if (debug) console.log("registerModule is running.");

    if (module.router) {
        if (debug) console.log("registerModule entered router clause.");
        module.router(router);
    }
};

// exported and used in main.js
export const registerModules = (modules) => {
    if (debug) console.log("registerModules started..");
    // get name of each module
    Object.keys(modules).forEach((moduleKey) => {
        if (debug) console.log("registerModules inisde modules object forEach loop");
        // get the module itself loaded
        const module = modules[moduleKey];
        // use function above to register each part of the module that is present
        registerModule(moduleKey, module);
    });
};
