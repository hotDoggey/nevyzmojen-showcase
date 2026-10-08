<template>
    <div class="basket-title">{{ $t("basket") }}</div>
    <BackToStoreLink />

    <div v-if="!isDataLoaded">
        <p>Loading basket...</p>
    </div>
    <div v-else>
        <!-- Basket rendering here -->

        <div class="center-contents">
            <v-row class="basket-items-container py-12 mx-2 mx-sm-4" cols="12" sm="12" md="12">
                <!-- empty basket message -->
                <v-row v-if="!enrichedBasket.length" class="empty-array" cols="12" sm="12" md="9">
                    <div class="px-4">
                        {{ $t("basket_is_empty_pt1") }}
                        <router-link class="here-text internal-link" to="/store">{{
                            $t("here")
                        }}</router-link>
                        {{ $t("basket_is_empty_pt2") }}
                    </div>
                </v-row>
                <!-- basket contents -->
                <div v-else class="basket-items">
                    <!-- columns row -->
                    <v-row class="column-titles d-none d-sm-flex pt-4 pb-2 mb-6">
                        <v-col class="title-image-url">{{ $t("item") || "Item" }}</v-col>
                        <v-col class="title-item"></v-col>
                        <v-col class="title-size">{{ $t("size") || "Size" }}</v-col>
                        <v-col class="title-quantity">{{ $t("quantity") || "Quantity" }}</v-col>
                        <v-col class="title-price">{{ $t("price") || "Price" }}</v-col>
                        <v-col class="title-delete-button"></v-col>
                    </v-row>
                    <!-- dynamic basket item rows -->
                    <div
                        class="py-4 my-2 my-sm-4"
                        v-for="item in enrichedBasket"
                        :key="item.internalProductId"
                    >
                        <v-row class="basket-item px-4">
                            <v-col class="basket-item-thumbnail" cols="2">
                                <router-link
                                    :to="{
                                        name: 'productPage',
                                        params: { id: item.internalProductId },
                                    }"
                                >
                                    <v-img
                                        class="basket-item-thumbnail-img"
                                        :src="item.images[0]"
                                        alt="Item Image"
                                        contain
                                    ></v-img>
                                </router-link>
                            </v-col>
                            <v-col class="basket-item-name">{{
                                item.translations[pageLang].productName
                            }}</v-col>
                            <v-col class="basket-item-size">
                                <span class="d-sm-none basket-mobile-label"
                                    >{{ $t("size") }}:
                                </span>
                                {{ item.size }}
                            </v-col>
                            <v-col class="basket-item-quantity">
                                <div class="qty-stepper">
                                    <button
                                        class="qty-btn"
                                        :disabled="item.quantity <= 1"
                                        @click="decrementQuantity(item)"
                                        aria-label="Decrease quantity"
                                    >
                                        <font-awesome-icon icon="fa-solid fa-minus" />
                                    </button>
                                    <span class="qty-count">{{ item.quantity }}</span>
                                    <button
                                        class="qty-btn"
                                        :disabled="isAtStockLimit(item)"
                                        @click="incrementQuantity(item)"
                                        aria-label="Increase quantity"
                                    >
                                        <font-awesome-icon icon="fa-solid fa-plus" />
                                    </button>
                                </div>
                                <div v-if="isLowStock(item)" class="basket-low-stock-hint">
                                    {{ stockForItem(item) }} {{ stockForItem(item) === 1 ? $t("left_singular") : $t("left") }}
                                </div>
                            </v-col>
                            <div class="basket-item-right-col">
                                <v-col class="basket-item-price">
                                    <div class="price-eur">
                                        {{ itemTotalPrice2DP(item.price_eur, item.quantity) }} EUR
                                    </div>
                                </v-col>
                                <v-col class="basket-item-delete">
                                    <button
                                        @click="
                                            removeProductFromBasket(
                                                item.internalProductId,
                                                item.size,
                                            )
                                        "
                                    >
                                        <font-awesome-icon
                                            icon="fa-solid fa-trash-can"
                                            class="delete-basket-item-icon"
                                        />
                                    </button>
                                </v-col>
                            </div>
                        </v-row>
                    </div>
                    <!-- line separator and container-->
                    <div class="line-separator mt-6 pt-10 pb-4">
                        <!-- Basket Summary Section -->
                        <v-row class="mx-0 mx-sm-4 summary-section">
                            <v-col
                                cols="12"
                                md="5"
                                offset-md="1"
                                lg="5"
                                offset-lg="1"
                                class="summary-left px-0 px-sm-3"
                            >
                                <div class="summary-line">
                                    <span>{{ $t("subtotal") || "Subtotal" }}:</span>
                                    <span>{{ Number(basketTotalEUR).toFixed(2) }} EUR</span>
                                </div>

                                <template v-if="eligibleForFirstOrderDiscount">
                                    <div class="summary-line discount-line">
                                        <span>{{ firstOrderDiscountLabelText }}</span>
                                        <span>-{{ discountAmountEUR }} EUR</span>
                                    </div>
                                    <div class="summary-line total-amount">
                                        <span>{{ $t("total") || "Total" }}:</span>
                                        <span>{{ discountedTotalEUR }} EUR</span>
                                    </div>
                                </template>
                            </v-col>
                            <v-col cols="12" md="5" lg="5" class="summary-right px-0 px-sm-3">
                                <v-btn
                                    color="black"
                                    size="large"
                                    class="checkout-button"
                                    rounded="lg"
                                    @click.prevent="checkout"
                                >
                                    <font-awesome-icon
                                        icon="fa-solid fa-credit-card"
                                        class="credit-card-icon"
                                    />
                                    {{ $t("checkout_button") || "Checkout" }}
                                </v-btn>
                            </v-col>
                        </v-row>
                    </div>
                </div>
            </v-row>
        </div>
    </div>

    <!-- Stock validation dialog — shown when checkout finds out-of-stock or reduced items -->
    <v-dialog v-model="stockDialog" max-width="600" persistent>
        <v-card class="sdc-card" rounded="0" elevation="12">
            <!-- Header -->
            <div class="sdc-header">
                <h2 class="sdc-heading">{{ $t("basket_updated_title") || "Basket Updated" }}</h2>
                <button class="sdc-close-btn" @click="stockDialog = false" aria-label="Close">
                    <font-awesome-icon icon="fa-solid fa-xmark" />
                </button>
            </div>

            <!-- Body -->
            <div class="sdc-body">
                <p class="sdc-subtitle">
                    {{
                        $t("basket_stock_adjusted_notice") ||
                        "Some items were adjusted to match available stock:"
                    }}
                </p>

                <!-- Items list -->
                <div class="sdc-items">
                    <!-- Removed items -->
                    <div
                        v-for="item in stockDialogRemovedItems"
                        :key="item.key"
                        class="sdc-item-row"
                    >
                        <div class="sdc-item-info">
                            <h4 class="sdc-item-name">{{ item.name }}</h4>
                            <div class="sdc-item-meta">
                                <span class="sdc-size-badge"
                                    >{{ $t("size") || "Size" }}: {{ item.size }}</span
                                >
                                <span class="sdc-removed-label">{{
                                    $t("out_of_stock") || "OUT OF STOCK"
                                }}</span>
                            </div>
                        </div>
                        <div class="sdc-icon-box">
                            <font-awesome-icon icon="fa-solid fa-box-open" />
                        </div>
                    </div>
                    <!-- Reduced items -->
                    <div
                        v-for="item in stockDialogReducedItems"
                        :key="item.key"
                        class="sdc-item-row"
                    >
                        <div class="sdc-item-info">
                            <h4 class="sdc-item-name">{{ item.name }}</h4>
                            <div class="sdc-item-meta">
                                <span class="sdc-size-badge"
                                    >{{ $t("size") || "Size" }}: {{ item.size }}</span
                                >
                                <div class="sdc-qty-change">
                                    <span class="sdc-qty-old"
                                        >{{ $t("quantity_short") || "QTY" }}:
                                        {{ item.oldQty }}</span
                                    >
                                    <font-awesome-icon
                                        icon="fa-solid fa-arrow-right"
                                        class="sdc-qty-arrow"
                                    />
                                    <span class="sdc-qty-new"
                                        >{{ $t("quantity_short") || "QTY" }}:
                                        {{ item.newQty }}</span
                                    >
                                </div>
                            </div>
                        </div>
                        <div class="sdc-icon-box">
                            <font-awesome-icon icon="fa-solid fa-box-open" />
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="sdc-actions">
                    <button class="sdc-btn-primary" @click="continueToCheckout">
                        <span>{{ $t("continue_to_checkout") || "Continue to Checkout" }}</span>
                        <font-awesome-icon icon="fa-solid fa-arrow-right" />
                    </button>
                    <button class="sdc-btn-secondary" @click="stockDialog = false">
                        {{ $t("review_basket") || "Return to Basket" }}
                    </button>
                </div>
            </div>

            <!-- Bottom accent bar -->
            <div class="sdc-accent-bar"></div>
        </v-card>
    </v-dialog>
</template>

<script>
import BackToStoreLink from "@/components/BackToStoreLink.vue";
export default {
    components: { BackToStoreLink },
    data() {
        return {
            windowWidth: window.innerWidth,
            stockDialog: false,
            stockDialogRemovedItems: [],
            stockDialogReducedItems: [],
        };
    },
    computed: {
        isDataLoaded() {
            return (
                this.$store.getters.productsArray.length > 0 &&
                this.$store.getters["systemVariables/isLoaded"]
            );
        },
        enrichedBasket() {
            return this.$store.getters.getEnrichedBasket;
        },
        basketTotalEUR() {
            return this.$store.getters.getBasketTotalEUR;
        },
        eligibleForFirstOrderDiscount() {
            return this.$store.getters.eligibleForFirstOrderDiscount;
        },
        discountAmountEUR() {
            return this.$store.getters.getDiscountAmountEUR;
        },
        discountedTotalEUR() {
            return this.$store.getters.getDiscountedBasketTotalEUR;
        },
        firstOrderDiscountLabelText() {
            return this.$t("first_order_discount_label", {
                percent: this.$store.getters["systemVariables/firstOrderDiscountPercent"],
            });
        },
    },

    methods: {
        removeProductFromBasket(internalProductId, size) {
            this.$store.dispatch("deleteProductFromBasket", { internalProductId, size });
        },
        stockForItem(item) {
            // Returns null when stock field is absent (old schema) — treated as unlimited
            if (!item.stock || !(item.size in item.stock)) return null;
            return item.stock[item.size];
        },
        isAtStockLimit(item) {
            const stock = this.stockForItem(item);
            return stock !== null && item.quantity >= stock;
        },
        isLowStock(item) {
            const stock = this.stockForItem(item);
            const threshold = this.$store.state.lowStockThreshold;
            return stock !== null && stock > 0 && stock < threshold;
        },
        incrementQuantity(item) {
            if (this.isAtStockLimit(item)) return;
            this.$store.dispatch("addProductToBasket", {
                internalProductId: item.internalProductId,
                size: item.size,
                quantity: 1,
            });
        },
        decrementQuantity(item) {
            if (item.quantity <= 1) return;
            this.$store.dispatch("removeProductFromBasket", {
                internalProductId: item.internalProductId,
                size: item.size,
            });
        },
        async checkout() {
            // Snapshot the basket before any mutations so iteration stays stable
            const basketSnapshot = [...this.enrichedBasket];
            const removed = [];
            const reduced = [];

            for (const item of basketSnapshot) {
                const available = this.stockForItem(item);
                // Skip items with no stock field (old schema) — let them through
                if (available === null) continue;

                if (available === 0) {
                    removed.push({
                        key: item.internalProductId + item.size,
                        name: item.translations[this.pageLang].productName,
                        size: item.size,
                    });
                    this.$store.dispatch("deleteProductFromBasket", {
                        internalProductId: item.internalProductId,
                        size: item.size,
                    });
                } else if (available < item.quantity) {
                    reduced.push({
                        key: item.internalProductId + item.size,
                        name: item.translations[this.pageLang].productName,
                        size: item.size,
                        oldQty: item.quantity,
                        newQty: available,
                    });
                    this.$store.dispatch("setBasketItemQuantity", {
                        internalProductId: item.internalProductId,
                        size: item.size,
                        quantity: available,
                    });
                }
            }

            if (removed.length || reduced.length) {
                this.stockDialogRemovedItems = removed;
                this.stockDialogReducedItems = reduced;
                this.stockDialog = true;
                return;
            }

            setTimeout(() => {
                this.$router.push("/checkout");
            }, 500);
        },
        continueToCheckout() {
            this.stockDialog = false;
            this.$router.push("/checkout");
        },
        itemTotalPrice2DP(price, quantity) {
            const formatted = (Math.floor(price * quantity * 100) / 100).toFixed(2);
            return Number(formatted) % 1 === 0 ? String(Math.floor(price * quantity)) : formatted;
        },
    },
};
</script>

<style scoped>
.empty-array {
    font-size: 1.25rem;
    font-weight: 600;
    display: flex;
    justify-content: center;
    padding-top: 2rem;
}
.here-text {
    font-weight: 600;
}
.center-contents {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
}
.basket-items-container {
    max-width: 1200px;
    width: 100%;
}
.column-titles > div {
    font-size: 0.95rem;
}
.basket-title {
    font-size: 2rem;
    font-weight: 600;
}
.basket-items {
    width: 100%;
    font-size: 1rem;
    padding: 0 1rem 1rem 1rem;
}
.basket-item {
    display: flex;
    align-items: center;
    font-weight: 500;
}
.column-titles {
    font-size: 1.25rem;
    font-weight: 600;
    border-bottom: 1px solid #ccc;
}
.item-card {
    border-radius: 0.75rem;
    width: 100%;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
}

.line-separator {
    border-top: 1px solid #ccc;
}

.summary-line {
    display: flex;
    justify-content: space-between;
    font-size: 1.5rem;
    font-weight: 500;
    margin: 0.3rem 0;
}
.discount-line {
    font-size: 1rem;
    color: #2e7d32;
}
.total-amount {
    font-weight: bold;
    margin-top: 0.5rem;
}
.credit-card-icon {
    margin-right: 8px; /* Adds space between the icon and text */
}

/* Summary Section Styles */
.summary-section {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
}

.summary-left {
    flex: 1;
    text-align: left;
}

.summary-right {
    flex: 1;
    text-align: right;
}

.checkout-button {
    width: 100%; /* Full width on mobile */
}

.basket-item-thumbnail-img {
    border-radius: 0.25rem;
}

/* On sm+, the wrapper is invisible to layout — v-cols behave as direct flex children of the row */
.basket-item-right-col {
    display: contents;
}

/* md and above — bump font size so the table looks substantial */
@media (min-width: 960px) {
    .basket-items {
        font-size: 1.1rem;
    }
    .column-titles > div {
        font-size: 1.05rem;
    }
}

/* xs only — aligns with Vuetify's xs breakpoint boundary */
@media (max-width: 599px) {
    .basket-title {
        font-size: 1.5rem;
        text-align: center;
    }
    .basket-items {
        padding: 0 4px;
    }

    /* CSS Grid card layout — overrides Vuetify v-row flex */
    .basket-item {
        display: grid !important;
        grid-template-columns: 72px 1fr 76px !important;
        grid-template-rows: auto auto auto !important;
        column-gap: 10px !important;
        row-gap: 3px !important;
        align-items: start !important;
        padding: 0 !important;
    }
    /* Reset v-col flex so the grid takes over */
    .basket-item > .v-col {
        padding: 0 !important;
        flex: unset !important;
        max-width: none !important;
        min-width: 0 !important;
    }

    /* Grid placement */
    .basket-item-thumbnail {
        grid-column: 1;
        grid-row: 1 / 4;
    }
    .basket-item-name {
        grid-column: 2;
        grid-row: 1;
        font-weight: 600;
        font-size: 1.125rem;
        text-align: left;
        white-space: normal;
        padding: 0 8px;
    }
    .basket-item-quantity {
        grid-column: 2;
        grid-row: 2;
        font-size: 0.875rem;
        text-align: left;
        padding: 0 8px;
        align-self: end;
    }
    .basket-item-size {
        grid-column: 2;
        grid-row: 3;
        font-size: 0.875rem;
        opacity: 0.65;
        text-align: left;
        padding: 0 8px;
        align-self: start;
    }
    /* Wrapper spans the full 3-row height of column 3.
       column-reverse so delete (2nd in DOM) appears at top, price (1st in DOM) at bottom.
       space-between pushes them to opposite ends of the span. */
    .basket-item-right-col {
        display: flex !important;
        grid-column: 3;
        grid-row: 1 / 4;
        align-self: stretch !important; /* override parent's align-items: start so wrapper fills full row span */
        flex-direction: column-reverse;
        justify-content: space-evenly;
        align-items: flex-end;
    }
    .basket-item-right-col > .v-col {
        padding: 0 !important;
        flex: unset !important;
        max-width: none !important;
        min-width: 0 !important;
    }
    .basket-item-price {
        font-size: 0.875rem;
        font-weight: 600;
    }

    /* Smaller stepper for mobile so it doesn't add unwanted row height */
    .qty-stepper {
        gap: 4px;
    }
    .qty-btn {
        width: 21px;
        height: 21px;
        font-size: 0.65rem;
    }
    .qty-count {
        font-size: 0.8rem;
    }

    /* Label prefix shown only on xs via d-sm-none span */
    .basket-mobile-label {
        font-weight: 600;
    }

    /* Smaller subtotal/total to match the now-smaller item text */
    .summary-line {
        font-size: 1.25rem;
    }
    .discount-line {
        font-size: 0.9rem;
    }

    .empty-array {
        font-size: 1rem;
        padding-top: 1rem;
    }
}

/* Quantity stepper — shared across all breakpoints */
.qty-stepper {
    display: flex;
    align-items: center;
    gap: 6px;
}
.qty-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: 1px solid #bbb;
    border-radius: 4px;
    background: transparent;
    cursor: pointer;
    font-size: 0.75rem;
    transition: opacity 0.15s;
    flex-shrink: 0;
}
.qty-btn:disabled {
    opacity: 0.3;
    cursor: default;
}
.qty-count {
    min-width: 18px;
    text-align: center;
    font-weight: 500;
}

/* Desktop: center the stepper horizontally and vertically within its column cell */
@media (min-width: 600px) {
    .basket-item-quantity {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
    }
}

.basket-low-stock-hint {
    font-size: 0.7rem;
    color: #c0392b;
    font-weight: 500;
    white-space: nowrap;
}

/* Stock validation dialog */
.sdc-card {
    background-color: #ffffff;
    overflow: hidden;
}
.sdc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 32px 32px 0;
}
.sdc-heading {
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: -0.04em;
    line-height: 1;
    color: #000;
    text-transform: uppercase;
    margin: 0;
}
.sdc-close-btn {
    padding: 8px 10px;
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    color: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
    flex-shrink: 0;
}
.sdc-close-btn:hover {
    background: #eeeeee;
}
.sdc-body {
    padding: 24px 32px 32px;
}
.sdc-subtitle {
    font-size: 0.8125rem;
    color: #777;
    font-weight: 500;
    margin-bottom: 28px;
}
.sdc-items {
    display: flex;
    flex-direction: column;
    gap: 26px;
}
.sdc-item-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}
.sdc-item-info {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.sdc-item-name {
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #000;
    margin: 0;
}
.sdc-item-meta {
    display: flex;
    gap: 16px;
    align-items: center;
    flex-wrap: wrap;
}
.sdc-size-badge {
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    font-weight: 800;
    background: #e2e2e2;
    padding: 3px 8px;
}
.sdc-removed-label {
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-weight: 800;
    color: #ba1a1a;
}
.sdc-qty-change {
    display: flex;
    align-items: center;
    gap: 10px;
}
.sdc-qty-old {
    font-size: 0.8125rem;
    color: #aaa;
    text-decoration: line-through;
}
.sdc-qty-arrow {
    font-size: 0.6rem;
    color: #999;
}
.sdc-qty-new {
    font-size: 0.9375rem;
    font-weight: 700;
    color: #000;
}
.sdc-icon-box {
    width: 44px;
    height: 44px;
    background: rgba(186, 26, 26, 0.08);
    color: #ba1a1a;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1rem;
}
.sdc-actions {
    margin-top: 44px;
}
.sdc-btn-primary {
    width: 100%;
    padding: 20px 28px;
    background: #000;
    color: #fff;
    border: none;
    font-weight: 700;
    font-size: 0.75rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: opacity 0.15s, transform 0.1s;
}
.sdc-btn-primary:hover {
    opacity: 0.88;
}
.sdc-btn-primary:active {
    transform: scale(0.98);
}
.sdc-btn-secondary {
    width: 100%;
    margin-top: 10px;
    padding: 14px;
    background: transparent;
    border: none;
    font-size: 0.625rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-weight: 700;
    color: #888;
    cursor: pointer;
    transition: color 0.15s;
}
.sdc-btn-secondary:hover {
    color: #000;
}
.sdc-accent-bar {
    height: 3px;
    width: 100%;
    background: rgba(0, 0, 0, 0.07);
}
</style>
