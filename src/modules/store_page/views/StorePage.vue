<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" md="10" sm="12" offset-md="1" class="pt-12">
                <v-row align="stretch" dense>
                    <!-- Skeleton loaders — shown while products are loading -->
                    <template v-if="isLoading">
                        <v-col
                            v-for="n in 4"
                            :key="'skeleton-' + n"
                            cols="12"
                            lg="3"
                            md="4"
                            sm="6"
                            class="product-col pa-1 pa-sm-2"
                        >
                            <div
                                class="skeleton-card"
                                :style="{ animationDelay: (n - 1) * 0.12 + 's' }"
                            >
                                <!-- Image area — matches the 3:4 media-slot -->
                                <div class="skeleton-media skeleton-shimmer"></div>
                                <!-- Title/price lines -->
                                <div class="skeleton-body">
                                    <div
                                        class="skeleton-line skeleton-shimmer"
                                        style="width: 38%"
                                    ></div>
                                    <div
                                        class="skeleton-line skeleton-shimmer"
                                        style="width: 70%"
                                    ></div>
                                </div>
                            </div>
                        </v-col>
                    </template>

                    <!-- Empty state -->
                    <v-col
                        cols="12"
                        v-else-if="!productsArray.length"
                        class="py-8 text-medium-emphasis"
                    >
                        {{ $t("noProducts") || "No products found." }}
                    </v-col>

                    <!-- Products -->
                    <v-col
                        v-for="product in productsArray"
                        v-else
                        :key="product.internalProductId"
                        cols="12"
                        lg="3"
                        md="4"
                        sm="6"
                        xs="12"
                        class="product-col pa-1 pa-sm-2"
                    >
                        <router-link
                            class="grid-card"
                            :to="{ name: 'productPage', params: { id: product.internalProductId } }"
                            @mouseenter="onEnter(product)"
                            @mouseleave="onLeave(product)"
                            @touchstart.passive="onTouchStart(product)"
                            @touchend.passive="onTouchEnd(product)"
                        >
                            <!-- Media row -->
                            <div class="media-slot">
                                <v-img
                                    :src="currentImage(product)"
                                    :alt="
                                        product.translations?.[pageLang]?.productName ||
                                        product.internalProductId
                                    "
                                    :class="[
                                        'media-img',
                                        'image-round-corners',
                                        {
                                            'img-loaded':
                                                !!imageLoadedById[product.internalProductId],
                                        },
                                    ]"
                                    cover
                                    position="center center"
                                    :transition="false"
                                    @load="onImageLoad(product.internalProductId)"
                                />
                                <div
                                    v-if="isFullyOutOfStock(product)"
                                    class="oos-overlay"
                                >
                                    {{ $t("out_of_stock") || "Out of Stock" }}
                                </div>
                            </div>

                            <!-- Body row -->
                            <v-card-text
                                class="product-body"
                                :style="{
                                    backgroundColor: productBodyUsePageBg
                                        ? 'var(--global-containers-background-color)'
                                        : 'transparent',
                                }"
                            >
                                <div class="price text-medium-emphasis">
                                    {{ formatProductPrice(product.price_eur) }} EUR
                                </div>
                                <div class="product-title">
                                    {{
                                        product.translations?.[pageLang]?.productName ||
                                        product.internalProductId
                                    }}
                                </div>
                            </v-card-text>
                        </router-link>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "StorePage",
    data() {
        return {
            // image cycling state
            cycleDelayMs: 1200,
            activeCardId: null,
            cycleTimerById: {},
            imgIndexById: {},
            touchActiveById: {},
            prefersReducedMotion:
                window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
            // If true, the product body (title/price area) will match the page background
            productBodyUsePageBg: true,
            // Tracks which product images have finished their first load (used for fade-in)
            imageLoadedById: {},
        };
    },
    computed: {
        // Read the products-specific loading flag rather than the global isLoading.
        // The global flag controls App.vue's router-view; using it here would mean the
        // component is never mounted while loading, so skeletons would never show.
        isLoading() {
            return this.$store.state.products.productsLoading;
        },
        ...mapGetters({
            productsArray: "productsArray",
            errorMessage: "errorMessage",
            pageLang: "pageLang",
        }),
    },
    mounted() {},
    methods: {
        formatProductPrice(val) {
            const formatted = (Math.floor(Number(val) * 100) / 100).toFixed(2);
            return Number(formatted) % 1 === 0 ? String(Math.floor(Number(val))) : formatted;
        },
        isFullyOutOfStock(product) {
            if (!product.stock) return false;
            return Object.values(product.stock).every((qty) => qty === 0);
        },
        filterComponentTitle(item) {
            if (!item) return "";
            return item.translations?.[this.pageLang] || item.translations?.en || item.name;
        },
        currentImage(product) {
            const idx = this.imgIndexById[product.internalProductId] ?? 0;
            const arr =
                Array.isArray(product.images) && product.images.length ? product.images : [""];
            return arr[idx] || arr[0] || "";
        },

        // Called when a v-img finishes loading — triggers the CSS fade-in for that product.
        // We never reset this flag, so subsequent cycling swaps stay at full opacity.
        onImageLoad(productId) {
            this.imageLoadedById = { ...this.imageLoadedById, [productId]: true };
        },

        // Preload the next image before swapping to avoid a flash
        preload(src) {
            return new Promise((resolve) => {
                if (!src) return resolve();
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => resolve();
                img.src = src;
            });
        },

        stopAllExcept(keepId = null) {
            for (const [id, t] of Object.entries(this.cycleTimerById)) {
                clearTimeout(t);
                delete this.cycleTimerById[id];
                if (id !== keepId) this.imgIndexById[id] = 0;
            }
        },

        // Desktop/hover: loop while hovered; one card at a time
        startCycleLoop(product) {
            const id = product.internalProductId;
            const imgs = Array.isArray(product.images) ? product.images : [];
            if (!imgs.length) return;

            if (this.prefersReducedMotion) {
                this.imgIndexById[id] = Math.min(1, imgs.length - 1);
                return;
            }

            if (this.cycleTimerById[id]) return;

            this.activeCardId = id;
            this.stopAllExcept(id);
            if (this.imgIndexById[id] == null) this.imgIndexById[id] = 0;

            const tick = async () => {
                if (this.activeCardId !== id) return this.stopCycle(product);

                const cur = this.imgIndexById[id] || 0;
                const next = (cur + 1) % imgs.length;
                await this.preload(imgs[next]);
                this.imgIndexById[id] = next;
                this.cycleTimerById[id] = setTimeout(tick, this.cycleDelayMs);
            };

            this.cycleTimerById[id] = setTimeout(tick, this.cycleDelayMs);
        },

        // Mobile/touch: run exactly one pass, then stop and reset
        startCycleOnce(product) {
            const id = product.internalProductId;
            const imgs = Array.isArray(product.images) ? product.images : [];
            if (!imgs.length) return;

            if (this.prefersReducedMotion) {
                this.imgIndexById[id] = Math.min(1, imgs.length - 1);
                return;
            }

            this.activeCardId = id;
            this.stopAllExcept(id);
            if (this.imgIndexById[id] == null) this.imgIndexById[id] = 0;

            let stepsRemaining = Math.max(0, imgs.length - 1);

            const tick = async () => {
                if (this.activeCardId !== id) return this.stopCycle(product);
                if (stepsRemaining <= 0) {
                    this.stopCycle(product, { resetToFirst: true });
                    return;
                }
                const cur = this.imgIndexById[id] || 0;
                const next = (cur + 1) % imgs.length;
                await this.preload(imgs[next]);
                this.imgIndexById[id] = next;
                stepsRemaining--;
                this.cycleTimerById[id] = setTimeout(tick, this.cycleDelayMs);
            };

            this.cycleTimerById[id] = setTimeout(tick, this.cycleDelayMs);
        },

        stopCycle(product, opts = {}) {
            const id = product.internalProductId;
            const t = this.cycleTimerById[id];
            if (t) {
                clearTimeout(t);
                delete this.cycleTimerById[id];
            }
            if (opts.resetToFirst) this.imgIndexById[id] = 0;
            if (this.activeCardId === id) this.activeCardId = null;
        },

        onEnter(p) {
            this.startCycleLoop(p);
        },
        onLeave(p) {
            this.stopCycle(p, { resetToFirst: true });
        },

        onTouchStart(p) {
            const id = p.internalProductId;
            this.touchActiveById[id] = true;
            this.startCycleOnce(p);
        },
        onTouchEnd(p) {
            const id = p.internalProductId;
            delete this.touchActiveById[id];
        },
    },
};
</script>

<style scoped>
.product-col {
    display: flex;
    min-width: 0;
}

/* ── Skeleton loaders ───────────────────────────────────────────────────────── */

/* Each skeleton card fades in and slides up slightly, staggered via inline animation-delay */
.skeleton-card {
    width: 100%;
    opacity: 0;
    animation: skeleton-appear 0.35s ease forwards;
}

@keyframes skeleton-appear {
    from {
        opacity: 0;
        transform: translateY(6px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* The shimmer sweep — a gradient that moves left-to-right */
.skeleton-shimmer {
    background: linear-gradient(90deg, #e2e2e2 25%, #ececec 50%, #e2e2e2 75%);
    background-size: 200% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
}

@keyframes shimmer {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

/* Image placeholder — matches the real media-slot aspect ratio */
.skeleton-media {
    aspect-ratio: 3 / 4;
    width: 100%;
    border-radius: 4px;
}

/* Text line placeholders below the image */
.skeleton-body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 10px 2px;
}

.skeleton-line {
    height: 0.8rem;
    border-radius: 4px;
}

/* ── Product cards ──────────────────────────────────────────────────────────── */

.grid-card {
    --card-aspect: 3 / 4;
    --media-fr: 7fr;
    --body-fr: 3fr;

    display: grid;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    transition: transform 180ms ease, box-shadow 180ms ease;
    cursor: pointer;
}

.grid-card:hover {
    transform: translateY(-4px);
}
.grid-card:hover .product-title {
    text-decoration: underline;
    text-underline-offset: 3px;
}

.product-media {
    width: 100%;
    height: 100%;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.image-round-corners {
    border-radius: 4px;
}

.product-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 12px;
    min-width: 0;
    min-height: 0;
}

.product-title {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    font-size: 0.95rem;
    line-height: 1.3;
    font-weight: 600;
    --title-lines: 2;
    --title-lh: 1.3em;
    min-height: calc(var(--title-lines) * var(--title-lh));
    overflow-wrap: break-word;
    word-break: normal;
    hyphens: auto;
}

.price {
    font-size: 1rem;
    line-height: 1.2;
    font-weight: 500;
}

.media-slot {
    aspect-ratio: 3 / 4;
    width: 100%;
    position: relative;
}
.oos-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.52);
    color: #fff;
    text-align: center;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    padding: 6px 0;
    border-radius: 0 0 4px 4px;
}

/* Image starts invisible; fades in once loaded via the img-loaded class */
.media-img {
    width: 100%;
    height: 100%;
    background-color: transparent;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    opacity: 0;
    transition: opacity 0.45s ease;
}

/* Force GPU compositing layer and high-quality downsampling to eliminate
   banding/line artifacts that appear when a high-res image is scaled small */
.media-img :deep(.v-img__img) {
    image-rendering: high-quality;
    transform: translateZ(0);
}

.media-img.img-loaded {
    opacity: 1;
}

@media (max-width: 959px) {
    .product-col {
        margin-bottom: 16px;
    }
}
</style>
