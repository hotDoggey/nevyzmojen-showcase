<template>
    <v-snackbar v-model="snackbarShow" timeout="3000" location="top" class="snackbar">
        {{ snackbarText || "" }}

        <template v-slot:actions>
            <v-btn color="white" variant="text" size="small" @click="hideSnackbar">
                {{ $t("close") }}
            </v-btn>
        </template>
    </v-snackbar>

    <v-toolbar
        id="site-header"
        :class="[
            'toolbar pl-md-6 pr-md-8 header pt-12',
            { 'header--overlay': isHeaderOverlayRoute },
        ]"
    >
        <!-- Logo -->
        <div class="logo-container">
            <router-link to="/about">
                <img
                    class="nevyzmojen-page-logo"
                    src="@/assets/nevyzmojen_text_logo_noBG.png"
                    alt="Site Header Logo - Link to Home"
                />
            </router-link>
        </div>

        <!-- Debug: show current vuetify breakpoint (temporary) -->
        <div v-if="showBreakpointDebug" class="breakpoint-debug">{{ currentBreakpoint }}</div>

        <v-spacer></v-spacer>

        <!-- Navigation Links -->
        <div class="navigation">
            <!-- Normal nav links for big screens -->
            <nav class="nav-links desktop-view">
                <router-link to="/about">{{ $t("about") || "About" }}</router-link>
                <router-link to="/store">{{ $t("store") || "Store" }}</router-link>
            </nav>

            <!-- Account icon and badge -->
            <router-link to="/account">
                <div class="icon-container" id="account-icon">
                    <font-awesome-icon
                        icon="fa-solid fa-user"
                        class="header-icon desktop-view account-icon"
                    />
                </div>
            </router-link>

            <!-- Basket icon and badge -->
            <router-link to="/basket">
                <div class="icon-container" id="basket-icon">
                    <font-awesome-icon
                        icon="fa-solid fa-cart-shopping"
                        class="header-icon basket-icon"
                    />
                    <span
                        v-if="basketCount > 0"
                        class="badge"
                        :class="{ 'basket-badge--wide': basketCount > 9 }"
                        >{{ basketCount }}</span
                    >
                </div>
            </router-link>

            <!-- Hamburger menu icon for mobile screens -->
            <font-awesome-icon
                icon="fa-solid fa-bars"
                class="header-icon mobile-view toggle-menu-icon"
                @click="toggleMenu"
            />
        </div>
    </v-toolbar>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer v-model="showMenuMobile" location="right" temporary :width="400">
        <!-- Drawer header: same height as the main toolbar -->
        <div class="drawer-header">
            <img src="@/assets/logo-simple-black-ink.svg" class="drawer-logo" alt="Site Logo" />
            <font-awesome-icon
                icon="fa-solid fa-bars"
                class="header-icon drawer-close-icon"
                size="lg"
                @click="showMenuMobile = false"
            />
        </div>

        <v-list class="drawer-nav-list" @click="showMenuMobile = false">
            <v-list-item to="/about">{{ $t("about") || "About" }}</v-list-item>
            <v-list-item :to="full_user_authed ? '/account' : '/login'">{{
                $t("account") || "Account"
            }}</v-list-item>
            <v-list-item to="/store">{{ $t("store") || "Store" }}</v-list-item>
        </v-list>
    </v-navigation-drawer>
</template>

<script>
export default {
    // Suppress Vue's "extraneous non-props attributes" warning — PageHeader has a
    // fragment root so class passed from App.vue can't be auto-inherited. The overlay
    // behavior is already handled internally via isHeaderOverlayRoute.
    inheritAttrs: false,
    data() {
        return {
            showMenuMobile: false,
            // Toggle this to show/hide the small breakpoint debug label
            showBreakpointDebug: false,
        };
    },
    watch: {
        showMenuMobile(isOpen) {
            // Prevent background scrolling while the mobile menu is open.
            // Targets .v-application since v-app makes it the scroll container.
            const appEl = document.querySelector(".v-application");
            if (appEl) appEl.style.overflowY = isOpen ? "hidden" : "";
        },
    },
    unmounted() {
        // Clean up in case the component is destroyed while the menu is open
        const appEl = document.querySelector(".v-application");
        if (appEl) appEl.style.overflowY = "";
    },
    methods: {
        toggleMenu() {
            this.showMenuMobile = !this.showMenuMobile;
        },
        hideSnackbar() {
            this.$store.commit("hideSnackbar", {
                show: false,
                text: "",
            });
        },
    },
    computed: {
        basketCount() {
            const basket = this.$store.getters.getBasket || [];
            return basket.reduce((total, item) => total + item.quantity, 0);
        },
        snackbarShow() {
            return this.$store.state.snackbarState.show;
        },
        snackbarText() {
            return this.$store.state.snackbarState.text;
        },
        isHeaderOverlayRoute() {
            return !!this.$route?.matched?.some((r) => r.meta?.headerOverlay);
        },
        currentBreakpoint() {
            // Prefer the explicit breakpoint `name` if available (Vuetify 2)
            const vb = this.$vuetify && (this.$vuetify.breakpoint || this.$vuetify.display);
            if (!vb) return "";
            if (vb.name) return vb.name;

            // Check common flags (fallbacks for different Vuetify versions)
            if (vb.xl || vb.xlOnly || vb.xlAndUp) return "xl";
            if (vb.lg || vb.lgOnly || vb.lgAndUp) return "lg";
            if (vb.md || vb.mdOnly || vb.mdAndUp) return "md";
            if (vb.sm || vb.smOnly || vb.smAndUp) return "sm";
            if (vb.xs || vb.xsOnly) return "xs";

            return "";
        },
    },
};
</script>

<style scoped>
.header {
    background-color: var(--global-containers-background-color);
}
/* overlay + transparent */
.header--overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    z-index: 200;

    background: transparent !important;
    box-shadow: none !important;
}

/* IMPORTANT: your .header class currently forces a background-color.
   We override it when overlay is active. */
.header--overlay.header {
    background-color: transparent !important;
}

.toolbar {
    padding: 1.25rem;
    font-size: 1.5rem;
    color: var(--text-color);
    display: flex;
    padding: 0pt 10pt 0pt 10pt;
    height: var(--header-height);
    justify-content: center;
    z-index: 100;
}

.logo-container {
    max-width: 325px;
    height: 100%;
    padding: 5px;
    overflow: hidden;
    display: flex;
    align-items: center;
}

.nevyzmojen-page-logo {
    width: 100%;
    max-width: 100%;
    height: auto;
}

.nav-links {
    margin: auto;
    padding-right: 1rem;
    font-weight: 600;
}

.navigation a {
    margin: 0 0.5rem;
}

.header-icon {
    padding: 0 0.6rem 0 0.6rem;
    /* Scale icons smoothly across viewport widths */
    font-size: clamp(1.75rem, 3.5vw, 2rem);
}

.navigation {
    display: flex;
    align-items: center;
}

/* Hide hamburger menu by default on big screens */
.mobile-view {
    display: none;
}

@media screen and (max-width: 768px) {
    /* Show hamburger menu icon */
    .mobile-view {
        display: block;
    }

    /* Hide nav links on small devices */
    .desktop-view {
        display: none;
    }
}

/* Ensure the badge is positioned correctly and styled */
.icon-container {
    position: relative;
    display: inline-block;
}

.badge {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(0%, -50%);
    background-color: red;
    color: white;
    font-size: 0.75rem;
    font-weight: bold;
    padding: 0.1rem 0.25rem;
    border-radius: 50%;
    line-height: 1;
    z-index: 10;
}
.basket-badge--wide {
    border-radius: 45px;
    padding: 2px 6px;
    min-width: auto;
}
/* Drawer header: mirrors the main toolbar in height and background */
.drawer-header {
    height: var(--header-height);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    /* Match toolbar font-size so .header-icon renders at the same size inside the drawer */
    font-size: 1.5rem;
    background-color: var(--global-containers-background-color);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}
.drawer-logo {
    max-height: 60px;
    width: auto;
}
/* Absolutely positioned so the logo stays truly centered */
.drawer-close-icon {
    position: absolute;
    right: 0;
    cursor: pointer;
}

/* Mobile navigation drawer */
.drawer-nav-list .v-list-item {
    font-size: 1.5rem;
    font-weight: 500;
    color: var(--text-color);
}
.drawer-nav-list .v-list-item:hover {
    background-color: var(--accent-color);
    cursor: pointer;
}

/* Snackbar styles */
.snackbar-text {
    font-size: 1rem;
    font-weight: 400;
}

/* Debug breakpoint label (temporary) */
.breakpoint-debug {
    font-size: 0.8rem;
    color: var(--text-color);
    opacity: 0.7;
    margin-left: 0.5rem;
    align-self: center;
}
</style>
