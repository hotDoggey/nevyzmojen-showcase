<template>
    <v-app>
        <!-- PRE-RELEASE GATE: shown until the correct password is entered -->
        <div v-if="!prereleaseAccessUnlocked" class="prerelease-gate">
            <div class="prerelease-content">
                <img
                    class="prerelease-logo"
                    src="@/assets/nevyzmojen_text_logo_noBG.png"
                    alt="Невъзможен"
                />

                <div class="prerelease-text">
                    <p class="prerelease-msg">
                        Задкулисно се случва нещо невъзможно.<br />
                        Шием, планираме, перфектизираме — и скоро отваряме врати.<br />
                        <strong>Очаквайте. Ще си заслужава.</strong>
                    </p>

                    <v-divider class="prerelease-divider"></v-divider>

                    <p class="prerelease-msg">
                        Something impossible is taking shape behind the scenes.<br />
                        We're stitching, planning, perfecting — and opening very soon.<br />
                        <strong>Stay tuned. It'll be worth it.</strong>
                    </p>
                </div>

                <!-- Hidden tap zone in bottom-right corner — tap 5× rapidly on mobile to reveal the password field -->
                <div
                    class="prerelease-tap-zone"
                    @click="handleTapZone"
                ></div>

                <!-- Password section — revealed by pressing p → w → d (desktop) or tapping the corner 5× (mobile) -->
                <div v-show="passwordFieldVisible" class="prerelease-password-section">
                    <input
                        ref="passwordInput"
                        v-model="passwordInput"
                        type="password"
                        class="prerelease-password-input"
                        placeholder="Password"
                        @keyup.enter="submitPassword"
                    />
                    <button class="primary-btn prerelease-submit-btn" @click="submitPassword">
                        Unlock
                    </button>
                    <p v-if="passwordError" class="error-message prerelease-error">
                        Nope. Try again.
                    </p>
                </div>
            </div>
        </div>

        <!-- NORMAL APP — rendered once unlocked -->
        <template v-else>
            <PageHeader :class="{ 'about-header-overlay': isHeaderOverlayRoute }" />

            <div v-if="isLoading" class="blank-page-with-spinner">
                <LoadingSpinner></LoadingSpinner>
            </div>

            <!-- default padding is added to each router view, but in some pages we dont need this so if their meta (in the router.js file is not defined with meta: { fullWidth: true } - see about page, then it will apply the padding ) -->
            <router-view
                v-else
                :class="[
                    'router-view',
                    { 'pa-4': !isFullWidthRoute },
                    { 'pa-md-6': !isFullWidthRoute },
                    // full width just has padding on top. don't push content down on overlay header routes
                    { 'pt-6': isFullWidthRoute && !isHeaderOverlayRoute },
                ]"
            />

            <PageFooter v-if="!isFooterHiddenRoute"></PageFooter>
        </template>
    </v-app>
</template>

<script>
import LoadingSpinner from "./components/LoadingSpinner";
import PageHeader from "./components/PageHeader.vue";
import PageFooter from "./components/PageFooter.vue";

// The key sequence a developer must press (in order) to reveal the password field
const UNLOCK_KEY_SEQUENCE = ["p", "w", "d"];

export default {
    components: {
        LoadingSpinner,
        PageHeader,
        PageFooter,
    },
    data() {
        return {
            passwordFieldVisible: false,
            passwordInput: "",
            passwordError: false,
            // Tracks the last N keypresses to detect the secret sequence
            keyBuffer: [],
            // Tracks rapid taps on the hidden corner zone for mobile unlock
            tapCount: 0,
            tapTimer: null,
        };
    },
    mounted() {
        document.addEventListener("keydown", this.handleKeyDown);

        // Record one visit per page load, fired once authReady is true so auth_type is accurate
        const unwatch = this.$watch(
            "authReady",
            (ready) => {
                if (!ready) return;
                unwatch();
                this.$store.dispatch("recordSiteVisit");
            },
            { immediate: true },
        );
    },
    beforeUnmount() {
        document.removeEventListener("keydown", this.handleKeyDown);
    },
    computed: {
        prereleaseAccessUnlocked() {
            return this.$store.state.prereleaseAccessUnlocked;
        },
        // use matched records to find meta on nested/dynamically added routes
        isFullWidthRoute() {
            return !!(
                this.$route &&
                this.$route.matched &&
                this.$route.matched.some((r) => r.meta && r.meta.fullWidth)
            );
        },
        isHeaderOverlayRoute() {
            return !!(
                this.$route &&
                this.$route.matched &&
                this.$route.matched.some((r) => r.meta && r.meta.headerOverlay)
            );
        },
        isFooterHiddenRoute() {
            return !!(
                this.$route &&
                this.$route.matched &&
                this.$route.matched.some((r) => r.meta && r.meta.hideFooter)
            );
        },
    },
    methods: {
        // Listen for the secret key sequence (p → w → d) to reveal the password field
        handleKeyDown(event) {
            if (this.prereleaseAccessUnlocked) return;

            this.keyBuffer.push(event.key);

            // Keep only the last N keys (same length as the target sequence)
            if (this.keyBuffer.length > UNLOCK_KEY_SEQUENCE.length) {
                this.keyBuffer.shift();
            }

            const sequenceMatched =
                this.keyBuffer.length === UNLOCK_KEY_SEQUENCE.length &&
                this.keyBuffer.every((key, i) => key === UNLOCK_KEY_SEQUENCE[i]);

            if (sequenceMatched) {
                this.passwordFieldVisible = true;
                this.keyBuffer = [];
                this.$nextTick(() => this.$refs.passwordInput?.focus());
            }
        },

        // Count rapid taps on the hidden corner zone; reveal password field after 5 taps within 2 seconds
        handleTapZone() {
            if (this.prereleaseAccessUnlocked) return;

            this.tapCount++;

            // Reset the count if the user goes quiet for 2 seconds
            clearTimeout(this.tapTimer);
            this.tapTimer = setTimeout(() => {
                this.tapCount = 0;
            }, 2000);

            if (this.tapCount >= 5) {
                this.tapCount = 0;
                clearTimeout(this.tapTimer);
                this.passwordFieldVisible = true;
                this.$nextTick(() => this.$refs.passwordInput?.focus());
            }
        },

        // Check the entered password against the store value and unlock if correct
        submitPassword() {
            if (this.passwordInput === this.$store.state.prereleasePassword) {
                this.$store.commit("SET_PRERELEASE_UNLOCKED");
            } else {
                this.passwordError = true;
                this.passwordInput = "";
            }
        },
    },
};
</script>

<style>
/* GLOBAL VARS AND STYLING */
:root {
    /* standard colors */
    --primary-color: #333;
    --secondary-color: #bfc1c3;
    --accent-color: #ffffff;
    --global-containers-background-color: rgb(240, 240, 240);
    --text-color: #05101b;
    --error-color: rgb(169, 6, 6);
    /* darker versions */
    --primary-color-darker: hsl(from var(--primary-color) h s calc(l - 10%));
    --secondary-color-darker: hsl(from var(--secondary-color) h s calc(l - 10%));
    /* lighter versions */
    --primary-color-lighter: #373737;
    /* --secondary-color-lighter: hsl(from var(--secondary-color) h s calc(l + 10%)); */
    /* additional global coloring */
    --primary-btn-text-color: #fff;

    /* gobal styling */
    color: var(--text-color);
    background-color: var(--global-containers-background-color);

    /* specific content sizing fixed height */
    --header-height: 115px; /* Header */
    --footer-height: 70px; /* Footer */
    --back-to-store-link-height: 55px; /* Back to store link */
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}
/* Make v-app fill the #app mount point */
.v-application {
    flex: 1;
    min-height: 100vh;
}
.hidden {
    display: none !important;
}
/* Desktop only */
@media (min-width: 960px) {
    /* Header becomes sticky only on this page */
    body.product-sticky #site-header {
        position: sticky;
        top: 0;
        z-index: 1000;
    }
}

.router-view {
    background-color: var(--global-containers-background-color);
    flex-grow: 1; /* Allow the main content to grow and fill remaining space */
}

/* Prevent unvisited links from showing blue */
a {
    color: var(--text-color); /* Same color as default */
}
/* Prevent visited links from showing the default purple color */
a:visited {
    color: var(--text-color); /* Same color as default */
}
/* BUTTON styles */

/* Primary Button Styles */
button.primary-btn {
    background-color: var(--primary-color);
    color: var(--primary-btn-text-color);
    border-width: 1px;
    border-radius: 4px;
    cursor: pointer;
}
/* Primary Button Styles */
button.secondary-btn {
    border-color: #000000;
}

/* on hover */
button.primary-btn:hover {
    background-color: var(--primary-color-lighter);
}
/* Disabled */
.btn.disabled {
    opacity: 0.35;
    cursor: not-allowed; /* Not-allowed cursor for disabled */
    pointer-events: none; /* prevents any clicks */
}

/* links should not have the default underline */
a {
    text-decoration: none;
}
/* an active router link or hovered ones should be underlined */
nav a.router-link-exact-active {
    text-decoration: underline;
}
nav a:hover {
    text-decoration: underline;
}

/* used to hide stuff all around the application */
.hidden {
    display: none !important;
}
.vis-bor {
    border: 1px solid rgb(247, 106, 12); /* for visualization */
}
.vis-bor2 {
    border: 1px solid rgb(67, 247, 12); /* for visualization */
}
.hint-text {
    color: rgb(196, 196, 197);
}
.error-message {
    color: var(--error-color);
}
.internal-link {
    font-weight: 500;
    text-decoration: underline;
    font-size: inherit;
    cursor: pointer;
}
@keyframes basket-bounce {
    0% {
        transform: translateY(0);
    }
    30% {
        transform: translateY(-8px);
    }
    60% {
        transform: translateY(4px);
    }
    100% {
        transform: translateY(0);
    }
}

.basket-bounce {
    animation: basket-bounce 0.4s ease;
}

.blank-page-with-spinner {
    display: flex;
    justify-content: center;
    height: 73vh; /* Full viewport height */
}

/* ── PRE-RELEASE GATE ─────────────────────────────────────────── */
.prerelease-gate {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--global-containers-background-color);
    padding: 2rem;
}

.prerelease-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 560px;
    width: 100%;
    text-align: center;
}

.prerelease-logo {
    width: 100%;
    max-width: 320px;
    height: auto;
    margin-bottom: 2.5rem;
}

.prerelease-text {
    width: 100%;
}

.prerelease-msg {
    font-size: 1rem;
    line-height: 1.75;
    color: var(--text-color);
    margin: 0;
}

.prerelease-divider {
    margin-top: 1.75rem;
    margin-bottom: 1.75rem;
}

/* Hidden tap zone — fixed in bottom-right corner, invisible to visitors */
.prerelease-tap-zone {
    position: fixed;
    bottom: 0;
    right: 0;
    width: 60px;
    height: 60px;
    z-index: 10;
    /* intentionally no background, border, or cursor — completely invisible */
}

/* Password field — only appears after the secret key combo or 5 corner taps */
.prerelease-password-section {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
}

.prerelease-password-input {
    border: 1px solid var(--secondary-color);
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    width: 100%;
    max-width: 280px;
    background: #fff;
    color: var(--text-color);
    outline: none;
}

.prerelease-password-input:focus {
    border-color: var(--primary-color);
}

.prerelease-submit-btn {
    padding: 0.5rem 1.5rem;
    font-size: 0.95rem;
}

.prerelease-error {
    font-size: 0.875rem;
    margin: 0;
}
</style>
