<template>
    <v-container fluid>
        <!-- Product Details -->
        <div v-if="!productsArray.length">Loading product...</div>
        <div v-else>
            <div v-if="isValidProduct">
                <v-row>
                    <!-- LEFT: sticky block (back link + images together) -->
                    <v-col cols="12" md="5" class="sticky-left">
                        <BackToStoreLink />
                        <div class="carousel-shell">
                            <v-carousel
                                class="images-carousel h-100"
                                show-arrows="hover"
                                hide-delimiters
                                continuous
                            >
                                <v-carousel-item
                                    v-for="imgUrl in currentProduct.images"
                                    :key="imgUrl"
                                >
                                    <img :src="imgUrl" class="carousel-image" alt="Product image" />
                                </v-carousel-item>
                            </v-carousel>
                        </div>
                    </v-col>

                    <!-- product details -->
                    <!-- RIGHT: details / normal flow-->
                    <v-col cols="12" md="6" class="details-col details-offset-desktop">
                        <v-row class="buffer-padding"></v-row>
                        <!-- product title -->
                        <v-row class="pb-12 product-title text-left">
                            {{ currentProduct.translations[pageLang].productName }}
                        </v-row>

                        <!-- price -->
                        <v-row class="pb-4 product-price">
                            <div class="price text-medium-emphasis">
                                {{ formatProductPrice(currentProduct.price_eur) }} EUR
                            </div>
                        </v-row>

                        <!-- Item Description -->
                        <v-row class="item-description text-left pb-4">
                            {{
                                $t(currentProduct.internalProductId + "ProductDescription") ||
                                currentProduct.internalProductId
                            }}
                        </v-row>

                        <!-- Size Chart -->
                        <v-row v-if="currentProduct.imageSizeChart" class="mt-4">
                            <v-col cols="12" class="pa-0 pr-10">
                                <!-- Toggle header (full width, left-aligned on mobile) -->
                                <button
                                    class="size-toggle d-flex align-center w-100"
                                    type="button"
                                    @click="sizeChartIsOpen = !sizeChartIsOpen"
                                >
                                    <v-icon class="me-2" icon="mdi-ruler" />
                                    <span class="text-subtitle-1">
                                        {{ $t("size_chart") || "Size Chart" }}
                                    </span>
                                    <v-spacer />
                                    <v-icon
                                        :icon="
                                            sizeChartIsOpen ? 'mdi-chevron-up' : 'mdi-chevron-down'
                                        "
                                    />
                                </button>

                                <!-- Collapsible content -->
                                <v-expand-transition>
                                    <div v-show="sizeChartIsOpen" class="w-100">
                                        <v-card class="pa-4 mt-2 w-100">
                                            <!-- Desktop title only -->
                                            <v-card-title class="d-none d-md-block">
                                                {{ $t("size_chart") || "Size Chart" }}
                                            </v-card-title>
                                            <v-divider class="mb-4 d-none d-md-block" />
                                            <v-img
                                                :src="currentProduct.imageSizeChart"
                                                :alt="$t('size_chart') || 'Size Chart'"
                                                class="w-100 size-chart-img"
                                            />
                                        </v-card>
                                    </div>
                                </v-expand-transition>
                            </v-col>
                        </v-row>

                        <!-- size select -->
                        <v-row class="pt-6 pb-2 select-size">
                            <div class="size-title">{{ $t("select_size") || "SELECT SIZE:" }}</div>
                        </v-row>
                        <v-row>
                            <div class="size-buttons">
                                <div v-for="size in sizeList" :key="size" class="size-option-wrap">
                                    <button
                                        :data-btn-size="size"
                                        class="py-2 px-4 size-button btn secondary-btn"
                                        :class="{
                                            disabled: stockForSize(size) === 0,
                                            selected: selectedSize === size,
                                        }"
                                        @click="setSelectedSize(size)"
                                    >
                                        {{ size }}
                                    </button>
                                    <div
                                        v-if="
                                            stockForSize(size) > 0 &&
                                            stockForSize(size) < lowStockThreshold
                                        "
                                        class="low-stock-label"
                                    >
                                        {{ stockForSize(size) }}
                                        {{ stockForSize(size) === 1 ? $t("left_singular") : $t("left") }}
                                    </div>
                                    <div
                                        v-else-if="stockForSize(size) === 0"
                                        class="out-of-stock-label"
                                    >
                                        {{ $t("out_of_stock") || "Out of stock" }}
                                    </div>
                                </div>
                            </div>
                        </v-row>
                        <v-row class="pt-8">
                            <button
                                class="py-4 add-to-basket-btn btn primary-btn"
                                :class="{ disabled: !selectedSize }"
                                @click="addToBasket(currentProduct)"
                            >
                                {{ $t("add_to_basket") || "Add to Basket" }}
                            </button>
                        </v-row>
                    </v-col>
                    <v-col cols="0" md="1"></v-col>
                </v-row>
            </div>
        </div>
    </v-container>
</template>

<script>
import BackToStoreLink from "@/components/BackToStoreLink.vue";
import { useDisplay } from "vuetify";
import { mapGetters } from "vuex";

export default {
    setup() {
        const display = useDisplay();
        return { display };
    },
    components: { BackToStoreLink },
    props: ["id"],
    data() {
        return {
            isValidProduct: false,
            selectedSize: "",
            sizeChartIsOpen: false,
        };
    },
    mounted() {
        this.fetchProduct();
        this.applyStickyMode();
        window.addEventListener("resize", this.applyStickyMode, { passive: true });
    },
    beforeUnmount() {
        document.body.classList.remove("product-sticky");
        window.removeEventListener("resize", this.applyStickyMode);
    },
    watch: {
        id() {
            this.fetchProduct();
        },
    },
    methods: {
        formatProductPrice(val) {
            const formatted = (Math.floor(Number(val) * 100) / 100).toFixed(2);
            return Number(formatted) % 1 === 0 ? String(Math.floor(Number(val))) : formatted;
        },
        applyStickyMode() {
            // Vuetify md breakpoint ~ >= 960px
            if (this.display.mdAndUp.value) {
                document.body.classList.add("product-sticky");
            } else {
                document.body.classList.remove("product-sticky");
            }
        },
        setSelectedSize(size) {
            if (this.stockForSize(size) === 0) return;
            this.selectedSize = size;
        },
        fetchProduct() {
            if (!this.productsArray.length) {
                this.$store.dispatch("products/fetchProductsFromFirestore").then(() => {
                    this.checkProductExists();
                });
            } else {
                this.checkProductExists();
            }
        },
        checkProductExists() {
            const productExists = this.productsArray.some(
                (product) => product.internalProductId === this.id,
            );

            if (productExists) {
                this.isValidProduct = true;
            } else {
                if (this.$route.name != "notFound404") {
                    this.$router.replace({
                        name: "notFound404",
                        params: { catchAll: "product-not-found" },
                    });
                }
            }
        },
        stockForSize(size) {
            return this.currentProduct?.stock?.[size] ?? 0;
        },
        addToBasket(currentProduct) {
            if (!this.selectedSize) return;

            const available = this.stockForSize(this.selectedSize);
            if (available === 0) return;

            // Check how many of this product+size are already in the basket
            const basketItem = this.$store.getters.getBasket.find(
                (b) =>
                    b.internalProductId === currentProduct.internalProductId &&
                    b.size === this.selectedSize,
            );
            const currentQty = basketItem?.quantity ?? 0;

            if (currentQty >= available) {
                this.$store.dispatch("triggerSnackbar", {
                    snackbarText:
                        this.$t("stock_at_limit") ||
                        "Maximum available quantity already in basket.",
                    duration: 3000,
                });
                return;
            }

            this.$store.dispatch("addProductToBasket", {
                internalProductId: currentProduct.internalProductId,
                quantity: 1,
                size: this.selectedSize,
            });

            this.$store.dispatch("triggerSnackbar", {
                snackbarText:
                    this.$t("snackbar_added_to_basket_message") || "Item added to basket.",
                duration: 3000,
            });

            // Animate product image flying to basket icon
            const productImage = document.querySelector(".carousel-image");
            const basketIcon = document.querySelector("#basket-icon");

            if (productImage && basketIcon) {
                const imgClone = productImage.cloneNode(true);
                const imgRect = productImage.getBoundingClientRect();
                const basketRect = basketIcon.getBoundingClientRect();

                imgClone.style.position = "fixed";
                imgClone.style.left = imgRect.left + "px";
                imgClone.style.top = imgRect.top + "px";
                imgClone.style.width = imgRect.width + "px";
                imgClone.style.height = imgRect.height + "px";
                imgClone.style.transition = "all 0.8s cubic-bezier(0.65, -0.1, 0.3, 1.5)";
                imgClone.style.zIndex = 2000;

                document.body.appendChild(imgClone);

                requestAnimationFrame(() => {
                    imgClone.style.left = basketRect.left + "px";
                    imgClone.style.top = basketRect.top + "px";
                    imgClone.style.width = "20px";
                    imgClone.style.height = "20px";
                    imgClone.style.opacity = "0.6";
                });

                imgClone.addEventListener("transitionend", () => {
                    imgClone.remove();
                    basketIcon.classList.add("basket-bounce");
                    setTimeout(() => basketIcon.classList.remove("basket-bounce"), 400);
                });
            }
        },
    },
    computed: {
        ...mapGetters({
            productsArray: "productsArray",
            pageLang: "pageLang",
            errorMessage: "errorMessage",
        }),
        currentProduct() {
            return this.productsArray.find((p) => p.internalProductId == this.id);
        },
        // Sizes sorted by canonical order from appConfig.sizeOrder
        sizeList() {
            if (!this.currentProduct?.stock) return [];
            const order = this.$store.state.sizeOrder;
            return Object.keys(this.currentProduct.stock).sort((a, b) => {
                const ai = order.indexOf(a);
                const bi = order.indexOf(b);
                if (ai === -1 && bi === -1) return 0;
                if (ai === -1) return 1;
                if (bi === -1) return -1;
                return ai - bi;
            });
        },
        lowStockThreshold() {
            return this.$store.state.lowStockThreshold;
        },
    },
};
</script>

<style scoped>
.buffer-padding {
    height: var(--back-to-store-link-height);
}
/* Desktop only */
@media (min-width: 960px) {
    /* Make the entire LEFT column sticky */
    .sticky-left {
        position: sticky;
        top: var(--header-height); /* sticks right under header */
        align-self: flex-start;
    }

    .carousel-shell {
        /* Fill the available space beneath the back link */
        height: calc(
            100vh - var(--header-height) - var(--back-to-store-link-height) - var(--footer-height)
        );
        max-height: calc(
            100vh - var(--header-height) - var(--back-to-store-link-height) - var(--footer-height)
        );
    }
}

.images-carousel {
    height: 100%;
}

.carousel-image {
    width: 100%;
    height: 100%;
    object-fit: cover; /* or contain if you want no crop */
}

@media (max-width: 959.98px) {
    .sticky-left {
        position: static;
        top: auto;
    }
    .carousel-shell {
        height: auto;
        max-height: none;
    }
}

/* Full-width, button-like header without default button styles */
.size-toggle {
    background: transparent;
    border: 0;
    padding: 10px 0;
    text-align: left;
    cursor: pointer;
}

/* Make the image fill the card width, and scale nicely */
.size-chart-img :deep(.v-img__img) {
    width: 100%;
    height: auto;
    object-fit: contain; /* keep the entire chart visible */
}
.carousel-image {
    max-width: 500px;
    object-fit: contain;
}
.product-title {
    font-size: 2rem;
    font-weight: 600;
}
.product-price {
    font-size: 1.25rem;
    font-weight: 600;
}
.item-description {
    width: 90%;
    white-space: pre-wrap;
}
.size-buttons {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    font-weight: 600;
    flex-wrap: wrap;
    gap: 4px 0;
}
.size-option-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
}
.low-stock-label {
    font-size: 0.65rem;
    font-weight: 500;
    color: #c0392b;
    text-align: center;
    white-space: nowrap;
}
.out-of-stock-label {
    font-size: 0.6rem;
    font-weight: 400;
    color: #999;
    text-align: center;
    white-space: nowrap;
}
.select-size {
    font-weight: 500;
}
.size-button {
    background-color: #f0f0f0;
    color: #333;
    border: 2px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    margin: 0 0.75rem;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s, border-color 0.3s, transform 0.2s;
}
.size-button:hover {
    background-color: #333;
    color: var(--primary-btn-text-color);
    border-color: #333;
    transform: scale(1.05);
}
.size-button.selected {
    background-color: #565555;
    color: #fff;
    border-color: #333;
}
.add-to-basket-btn {
    width: 95%;
}
.add-to-basket-btn:hover {
    transform: scale(1.01);
}
.basket-bounce {
    animation: basket-bounce 0.4s ease;
}
@media screen and (max-width: 768px) {
    .carousel-image {
        max-width: 100%;
    }
}

@keyframes basket-bounce {
    0% {
        transform: scale(1);
    }
    30% {
        transform: scale(1.2);
    }
    60% {
        transform: scale(0.9);
    }
    100% {
        transform: scale(1);
    }
}
</style>
