<template>
    <!-- HERO -->
    <v-container fluid class="pa-0">
        <v-img
            ref="heroImg"
            src="https://hotDoggey.github.io/nevyzmojen-assets/promo-art/hero-image-2.png"
            alt="Hero Poster"
            cover
            gradient="to bottom, rgba(255,255,255,0.50) 0%, rgba(255,255,255,0.30) 10%, rgba(255,255,255,0.10) 20%, rgba(0,0,0,0.12) 60%, rgba(0,0,0,0.45) 100%"
            class="hero"
        >
            <div class="hero-content" aria-hidden="false">
                <div class="hero-title-block">
                    <h1 class="hero-title">{{ $t("why_we_exist_pt1") }}</h1>
                    <h1 class="hero-title">{{ $t("why_we_exist_pt2") }}</h1>
                </div>
            </div>
        </v-img>
    </v-container>

    <!-- BRAND STORY -->
    <div class="light-section">
        <v-container>
            <v-row>
                <v-col cols="12" md="8" class="py-10 mx-auto text-center about-text">
                    <p class="reveal">{{ $t("about_message_pt1") }}</p>
                    <p class="reveal">{{ $t("about_message_pt2") }}</p>
                    <p class="reveal">{{ $t("about_message_pt3") }}</p>
                    <p class="reveal">{{ $t("about_message_pt4") }}</p>
                </v-col>
            </v-row>
        </v-container>
    </div>

    <hr class="section-divider" />

    <!-- TEAM -->
    <div class="light-section">
        <v-container>
            <v-row>
                <v-col cols="12" md="7" class="py-10 mx-auto text-center who-are-we-text">
                    <h2 class="section-title reveal">{{ $t("team_section_title") }}</h2>
                    <p class="team-body reveal reveal--delay">{{ $t("team_section_body_pt1") }}</p>
                    <p class="team-body reveal reveal--delay">{{ $t("team_section_body_pt2") }}</p>
                    <p class="team-body reveal reveal--delay">{{ $t("team_section_body_pt3") }}</p>
                </v-col>
            </v-row>
        </v-container>
    </div>

    <hr class="section-divider" />

    <!-- CTA -->
    <div class="light-section">
        <v-container class="py-12 text-center">
            <p class="cta-tagline reveal">{{ $t("cta_heading") }}</p>
            <div class="reveal reveal--delay">
                <router-link to="/store">
                    <button class="cta-btn">{{ $t("shop_the_collection") }}</button>
                </router-link>
            </div>
        </v-container>
    </div>

    <hr class="section-divider" />

    <!-- CONTACT / SOCIAL -->
    <div class="contact-section">
        <v-container>
            <v-row justify="center" class="py-10">
                <!-- Contact -->
                <v-col cols="12" sm="4" class="text-center pb-8 pb-sm-0 reveal">
                    <h3 class="contact-heading">{{ $t("contact_us") }}</h3>
                    <a :href="'mailto:' + globalContactEmail" class="contact-email-link">{{
                        globalContactEmail
                    }}</a>
                    <!-- <p class="contact-detail">{{ contactNumber }}</p> -->
                </v-col>

                <!-- Language switcher -->
                <v-col cols="12" sm="4" class="text-center pb-8 pb-sm-0 reveal reveal--delay">
                    <h3 class="contact-heading">{{ $t("language") }}</h3>
                    <div class="d-flex justify-center align-center mt-3">
                        <span @click="changeLang('bg')" class="lang-flag-click">
                            <img
                                class="contact-lang-flag"
                                src="@/assets/bg_lang_flag.png"
                                alt="Site Language Option - Bulgarian"
                            />
                        </span>
                        <span @click="changeLang('en')" class="lang-flag-click">
                            <img
                                class="contact-lang-flag"
                                src="@/assets/en_lang_flag.png"
                                alt="Site Language Option - English"
                            />
                        </span>
                    </div>
                </v-col>

                <!-- Follow Us -->
                <v-col cols="12" sm="4" class="text-center reveal reveal--delay">
                    <h3 class="contact-heading">{{ $t("follow_us") }}</h3>
                    <div class="d-flex justify-center align-center mt-3">
                        <a
                            href="https://www.instagram.com/nevyzmojen.clothing"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="mr-5"
                        >
                            <img
                                class="contact-social-icon"
                                src="@/assets/instagram-logo-transparent.png"
                                alt="Instagram"
                            />
                        </a>
                        <a
                            href="https://www.tiktok.com/@nevyzmojen.clothing"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <img
                                class="contact-social-icon"
                                src="@/assets/tiktok-logo-transparent.png"
                                alt="TikTok"
                            />
                        </a>
                    </div>
                </v-col>
            </v-row>
        </v-container>
    </div>

    <!-- Hidden for now -->
    <!-- <v-container class="info-section" fluid>
        <v-row>
            <v-col cols="12" md="4" class="info-col">
                <div class="thin-cols">
                    <img
                        class="info-image"
                        src="https://cdn.webshopapp.com/shops/259039/files/325761705/100-cotton-black.jpg"
                        alt="Materials"
                    />
                    <h3>Materials</h3>
                    <p>
                        We use premium textiles and carefully selected fabrics — high quality
                        materials, responsibly sourced and tested for durability and comfort.
                    </p>
                </div>
            </v-col>

            <v-col cols="12" md="4" class="info-col">
                <div class="thin-cols">
                    <img
                        class="info-image"
                        src="https://hotdoggey.github.io/nevyzmojen-assets/promo-art/hero-image-1.png"
                        alt="Craftsmanship"
                    />
                    <h3>Donation</h3>
                    <p>
                        Each piece is made with attention to detail — local production partners,
                        strict QC and traditional techniques blended with modern precision.
                    </p>
                </div>
            </v-col>

            <v-col cols="12" md="4" class="info-col">
                <div class="thin-cols">
                    <img
                        class="info-image"
                        src="https://hotdoggey.github.io/nevyzmojen-assets/promo-art/hero-image-1.png"
                        alt="Sustainability"
                    />
                    <h3>Sustainability</h3>
                    <p>
                        We prioritise sustainable practices — reduced waste, eco-friendly finishes
                        and transparent sourcing to minimise our footprint.
                    </p>
                </div>
            </v-col>
        </v-row>
    </v-container> -->
</template>

<script>
export default {
    mounted() {
        // Observe .reveal elements and .section-divider elements; add .is-visible when they enter the viewport
        this._observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        this._observer.unobserve(entry.target); // animate once only
                    }
                });
            },
            { threshold: 0.15 },
        );

        document.querySelectorAll(".reveal, .section-divider").forEach((el) => {
            this._observer.observe(el);
        });

        // Parallax scroll listener for the hero image
        window.addEventListener("scroll", this._handleParallax, { passive: true });
    },

    beforeUnmount() {
        if (this._observer) this._observer.disconnect();
        window.removeEventListener("scroll", this._handleParallax);
    },

    methods: {
        // Delegate language change to the store, which updates i18n and Firestore (if full_user)
        changeLang(newLang) {
            this.$store.dispatch("changeLang", newLang);
        },

        // Move the hero image upward at 25% of the scroll speed so it lags behind the page (parallax)
        _handleParallax() {
            if (!this.$refs.heroImg) return;
            const heroEl = this.$refs.heroImg.$el;
            const scrollY = window.scrollY;

            // Stop applying once the hero has fully scrolled out of view
            if (scrollY > heroEl.offsetHeight) return;

            const img = heroEl.querySelector(".v-img__img");
            if (!img) return;

            // Clamp at 60px to match the extra height buffer set in CSS
            const offset = Math.min(scrollY * 0.25, 60);
            img.style.transform = `translateY(${-offset}px)`;
        },
    },
};
</script>

<style scoped>
/* ======= HERO ======= */
.hero {
    height: 100vh;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;
}

/* content block inside the image */
.hero-content {
    color: #111;
    z-index: 1;
    max-width: 540px;
    width: 45%; /* keeps content narrow on large screens */
    margin-left: 10%; /* offset to the left of center (subject is on the right) */
    text-align: left;
    display: flex;
    align-items: center;
    height: 100%;
    padding-top: var(--header-height);
}

/* Wrapper — becomes the single flex child of .hero-content so positioning is unchanged */
.hero-title-block {
    display: block;
}

/* title — slides in from the left on page load */
.hero-title {
    margin: 0;
    font-size: clamp(2rem, 6vw, 3.25rem);
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: -0.02em;
    line-height: 1.05;
    color: #2a2a2a;
    animation: heroTitleIn 1s cubic-bezier(0.16, 1, 0.3, 1) both;
    animation-delay: 0.25s;
}

@keyframes heroTitleIn {
    from {
        opacity: 0;
        transform: translateX(-40px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Parallax: give the inner image extra height so it doesn't clip when translated upward */
.hero :deep(.v-img__img) {
    height: calc(100% + 60px) !important;
    will-change: transform;
    filter: grayscale(100%);
}

/* ======= SHARED LIGHT SECTIONS (brand story, team, CTA) ======= */
.light-section {
    background: var(--global-containers-background-color);
}

/* ======= SECTION DIVIDER ======= */
.section-divider {
    /* xs default */
    width: 80%;
    margin: 0 auto;
    border: none;
    border-top: 1px solid var(--secondary-color);
    /* draw animation — starts collapsed, expands when .is-visible is added */
    transform: scaleX(0);
    transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}

.section-divider.is-visible {
    transform: scaleX(1);
}

@media (min-width: 600px) {
    /* sm */
    .section-divider {
        width: 70%;
    }
}

@media (min-width: 960px) {
    /* md */
    .section-divider {
        width: 55%;
    }
}

@media (min-width: 1280px) {
    /* lg and above */
    .section-divider {
        width: 50%;
    }
}

/* ======= SCROLL REVEAL ======= */

/* Base state: hidden and shifted down */
.reveal {
    opacity: 0;
    transform: translateY(22px);
    transition: opacity 0.5s ease, transform 0.5s ease;
}

/* Visible state added by IntersectionObserver */
.reveal.is-visible {
    opacity: 1;
    transform: translateY(0);
}

/* Stagger the three brand story paragraphs so they arrive in sequence */
.about-text .reveal:nth-child(2) {
    transition-delay: 0.15s;
}
.about-text .reveal:nth-child(3) {
    transition-delay: 0.3s;
}

/* Generic delay class for paired elements (team body, CTA button, social col) */
.reveal--delay {
    transition-delay: 0.18s;
}

/* ======= BRAND STORY ======= */
.about-text p {
    font-size: 1.15rem;
    line-height: 1.8;
    color: var(--text-color);
    margin: 0 0 1.75rem;
    padding: 0 0.5rem;
}

.about-text p:last-child {
    margin-bottom: 0;
}

/* ======= TEAM ======= */
.section-title {
    font-size: clamp(1.4rem, 3vw, 2rem);
    margin-bottom: 1.25rem;
    color: var(--primary-color);
}

.team-body {
    font-size: 1.1rem;
    line-height: 1.8;
    color: var(--primary-color);
    margin: 0;
    padding: 0 0.5rem;
}
/* ======= WHO ARE WE ======= */
.who-are-we-text p {
    font-size: 1.15rem;
    line-height: 1.8;
    color: var(--text-color);
    margin: 0 0 1.75rem;
    padding: 0 0.5rem;
}

/* ======= CTA ======= */
.cta-tagline {
    font-size: clamp(1rem, 2.5vw, 1.5rem);
    margin-bottom: 2rem;
    font-weight: 500;
    /* font-style: italic; */
    color: var(--primary-color);
}

/* filled dark button — sits on the light grey background */
.cta-btn {
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0.85rem 2.75rem;
    border: 2px solid var(--primary-color);
    border-radius: 4px;
    background: var(--primary-color);
    color: #fff;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}

.cta-btn:hover {
    background: transparent;
    color: var(--primary-color);
}

/* ======= CONTACT / SOCIAL ======= */
.contact-section {
    background: var(--primary-color);
}

.contact-heading {
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 0.75rem;
    color: #fff;
}

.contact-detail {
    font-size: 0.95rem;
    color: var(--secondary-color);
    margin: 0.3rem 0;
}

/* email mailto link — matches contact-detail style, underline on hover */
.contact-email-link {
    display: block;
    font-size: 0.95rem;
    color: var(--secondary-color);
    margin: 0.3rem 0;
    text-decoration: none;
}

.contact-email-link:hover {
    text-decoration: underline;
}

.contact-social-icon {
    width: 2rem;
    height: 2rem;
    object-fit: contain;
    display: block;
    transition: transform 0.2s ease;
}

.contact-social-icon:hover {
    transform: scale(1.18);
}

.contact-lang-flag {
    max-width: 1.6rem;
    height: auto;
    display: block;
    transition: transform 0.2s ease;
}

.contact-lang-flag:hover {
    transform: scale(1.18);
}

/* clickable area around each flag */
.lang-flag-click {
    padding: 0 0.35rem;
    cursor: pointer;
}

/* ======= INFO SECTION (styles kept for commented-out block above) ======= */
.info-section {
    padding-top: 2.5rem;
    padding-bottom: 3rem;
    background: #fff;
}

.thin-cols {
    max-width: 360px;
    margin: 0 auto;
}

.info-col {
    text-align: center;
    padding: 1.25rem;
}

.info-image {
    width: 100%;
    max-width: 360px;
    height: auto;
    display: block;
    margin: 0 auto 1rem;
    border-radius: 6px;
    object-fit: cover;
}

.info-col h3 {
    margin: 0.5rem 0;
    font-size: 1.15rem;
}

.info-col p {
    color: #444;
    font-size: 0.95rem;
    line-height: 1.45;
    margin: 0.5rem 0 0;
}

/* ======= RESPONSIVE ======= */

/* MEDIUM DEVICES */
@media (max-width: 1279px) {
    .hero {
        height: 100vh;
    }
    .hero-content {
        width: 55%;
        margin-left: 8%;
    }
}

/* MOBILE: make hero shorter and keep text vertically centered and slightly left-shifted */
@media (max-width: 600px) {
    .hero {
        height: 110vh;
    }
    .hero :deep(.v-img__img) {
        object-position: 60% center; /* smaller % = more left */
    }
    .hero-content {
        width: 88%;
        max-width: 640px;
        margin-left: 50%;
        transform: translateX(-53%); /* center inside image area then shift a bit left */
        text-align: center;
        padding: 0 2rem;
    }

    /* columns become full width with padding on mobile */
    .info-col {
        padding-left: 1rem;
        padding-right: 1rem;
    }
    .thin-cols {
        max-width: none;
    }

    .info-image {
        max-width: 100%;
    }
}
</style>
