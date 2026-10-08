const debug = false;

import { createRouter, createWebHistory } from "vue-router";
import NotFound404 from "./components/NotFound404.vue";
import store from "@/store";
import { firebaseAuth } from "@/mainjsHelpers/FirestoreSetup";
import { compile } from "vue";

// create the router instance
const router = createRouter({
    history: createWebHistory(),
    mode: "history",
    scrollBehavior(to, from, savedPosition) {
        return { top: 0, behavior: "smooth" }; // Scrolls to top with smooth effect
    },

    // define routes and a 404 catch all (dev fyi, the rest of the views/routes are found in the different modules)
    routes: [
        // redirect root to the store page
        { path: "/", redirect: "/store" },
        // 404 catch all
        {
            path: "/:catchAll", // if i want to void having to pass in a parameter when recirecting to a 404 page, i can replace with this "/:pathMatch(.*)*",
            name: "notFound404",
            component: NotFound404,
        },
    ],
});

// Global navigation guard
router.beforeEach(async (to, from, next) => {
    // Routes that require admin access (checked via is_admin getter below)
    const fullAuthOnlyRoutes = ["authed_orders", "stock_admin", "admin"];

    try {
        // 1) Ensure app/store finished initializing (products/auth/etc) — run in parallel
        await Promise.all([waitForLoadingToFinish(store), waitForAuthReady(store)]);

        // 2) Resolve auth state in ONE place — use the same dedicated getters the global mixin exposes
        const isAnonymous = store.getters.anon_user_authed;
        const isFullAccount = store.getters.full_user_authed;

        // ---------------------------
        // A) guest_signup route rules
        // ---------------------------
        // Only anonymous sessions should be able to access guest signup
        if (to.name === "guest_signup") {
            if (isFullAccount) {
                if (debug) console.log("[guard] full user -> redirect guest_signup -> account");
                next({ name: "account" });
                return;
            } else if (isAnonymous) {
                next();
                return;
            } else {
                next({ name: "about" });
                return;
            }
        }

        // ---------------------------
        // B) signup route rules
        // ---------------------------
        // - Full account user -> redirect to Account
        // - Anonymous user    -> redirect to GuestSignup to finish signup
        // - Signed out        -> allow to Signup
        if (to.name === "signup") {
            if (isFullAccount) {
                if (debug) console.log("[guard] full user -> redirect signup -> account");
                next({ name: "account" });
                return;
            }

            if (isAnonymous) {
                if (debug) console.log("[guard] anonymous user -> redirect signup -> guest_signup");
                next({ name: "guest_signup" });
                return;
            }

            // Not signed in at all -> allow signup
            next();
            return;
        }

        // ---------------------------
        // C) account route rules
        // ---------------------------
        // - Full account user -> allow
        // - Anonymous user    -> redirect to GuestSignup
        // - Signed out        -> redirect to Login
        if (to.name === "account") {
            if (isFullAccount) {
                next();
                return;
            }

            if (isAnonymous) {
                if (debug)
                    console.log("[guard] anonymous user -> redirect account -> guest_signup");
                next({ name: "guest_signup" });
                return;
            }

            if (debug) console.log("[guard] signed out -> redirect account -> login");
            next({ name: "login" });
            return;
        }

        // -----------------------------------------
        // D) Routes that require admin access
        // -----------------------------------------
        if (fullAuthOnlyRoutes.includes(to.name)) {
            const isAdmin = store.getters.is_admin;

            if (isAdmin) {
                next();
                return;
            }

            // Non-admin full users get sent to the store; anon/null go to login
            if (isFullAccount) {
                if (debug) console.log("[guard] non-admin full user -> redirect authed_orders -> store");
                next({ name: "store" });
                return;
            }

            if (isAnonymous) {
                if (debug) console.log("[guard] anonymous user -> redirect protected -> guest_signup");
                next({ name: "guest_signup" });
                return;
            }

            if (debug) console.log("[guard] signed out -> redirect protected -> login");
            next({ name: "login" });
            return;
        }

        // ---------------------------
        // E) Default: allow navigation
        // ---------------------------
        if (debug) console.log("[guard] allowed:", to.fullPath);
        next();
    } catch (e) {
        // If loading times out or something fails, send user to login as a safe fallback
        if (debug) console.log("[guard] error/loading timeout -> redirect to login", e);
        next({ name: "login" });
    }
});

// Waits for isLoading to become false in the store, with a timeout
function waitForLoadingToFinish(store, timeout = 3000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();
        function check() {
            if (!store.getters.isLoading) {
                resolve();
            } else if (Date.now() - start > timeout) {
                reject(new Error("Loading timeout"));
            } else {
                setTimeout(check, 50);
            }
        }
        check();
    });
}

// Waits for authReady to become true in the store, with a timeout
function waitForAuthReady(store, timeoutMs = 8000) {
    if (store.getters.authReady) return Promise.resolve();

    return new Promise((resolve, reject) => {
        const start = Date.now();
        const timer = setInterval(() => {
            if (store.getters.authReady) {
                clearInterval(timer);
                resolve();
                return;
            }
            if (Date.now() - start > timeoutMs) {
                clearInterval(timer);
                reject(new Error("Auth not ready (timeout)"));
            }
        }, 50);
    });
}

export default router;
