<template>
    <footer class="site-footer">
        <v-container fluid class="py-3">
            <v-row justify="center" align="center">
                <!-- Contact Us -->
                <v-col cols="6" sm="4" class="text-center">
                    <div class="contact-footer-number">
                        {{ $t("contact_us") || "Contact Us: " + contactNumber }}
                    </div>
                    <div class="contact-footer-number">
                        <a :href="'mailto:' + globalContactEmail" class="email-link">{{
                            globalContactEmail
                        }}</a>
                    </div>
                </v-col>

                <!-- Language + Copyright -->
                <v-col cols="6" sm="4" class="text-center">
                    <div class="language-setting d-flex justify-center align-center">
                        <span @click="changeLang('bg')" class="flag-click">
                            <img
                                class="language-flag"
                                src="@/assets/bg_lang_flag.png"
                                alt="Site Language Option - Bulgarian"
                            />
                        </span>
                        <span @click="changeLang('en')" class="flag-click">
                            <img
                                class="language-flag"
                                src="@/assets/en_lang_flag.png"
                                alt="Site Language Option - English"
                            />
                        </span>
                    </div>

                    <div class="mt-1">© 2026 Nevyzmojen</div>
                </v-col>

                <!-- Follow Us -->
                <v-col cols="12" sm="4" class="text-center">
                    <div>{{ $t("follow_us") || "Follow Us:" }}</div>

                    <div class="d-flex justify-center align-center mt-1">
                        <a
                            href="https://www.instagram.com/nevyzmojen.clothing"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="mr-4"
                        >
                            <img
                                class="social-icon"
                                src="@/assets/instagram-logo-transparent.png"
                                alt="Instagram Logo"
                            />
                        </a>

                        <a
                            href="https://www.tiktok.com/@nevyzmojen.clothing"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                class="social-icon"
                                src="@/assets/tiktok-logo-transparent.png"
                                alt="TikTok Logo"
                            />
                        </a>
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </footer>
</template>

<script>
export default {
    // the purpose of this component is to show the footer at the bottom of the page if its content is
    // not enough to push it down to the bottom
    data() {},
    methods: {
        changeLang(newLang) {
            this.$store.dispatch("changeLang", newLang);
        },
    },
};
</script>

<style scoped>
.site-footer {
    background-color: var(--primary-color);
    color: white;
    width: 100%;
    min-height: var(--footer-height);
}

/* images */
.language-flag {
    max-width: 1.25rem;
    height: auto;
    display: block;
    transition: transform 0.2s ease;
}

.language-flag:hover {
    transform: scale(1.18);
}

.social-icon {
    width: 1.5rem;
    height: 1.5rem;
    object-fit: contain;
    display: block;
    transition: transform 0.2s ease;
}

.social-icon:hover {
    transform: scale(1.18);
}

/* email mailto link — inherits footer text colour, subtle underline on hover */
.email-link {
    color: inherit;
    text-decoration: none;
}

.email-link:hover {
    text-decoration: underline;
}

/* clickable area for flags */
.flag-click {
    padding: 0 0.25rem;
    cursor: pointer;
}
</style>
