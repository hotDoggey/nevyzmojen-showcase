<template>
    <div>
        <!-- Loading orders -->
        <div v-if="ordersLoading" class="d-flex justify-center py-6">
            <v-progress-circular indeterminate size="28" />
        </div>

        <!-- No orders message -->
        <p v-else-if="userOrders.length === 0" class="mb-0 pt-2">
            {{ $t("noOrdersPt1") }}
            <router-link class="internal-link store-page-link" to="/store">
                {{ $t("here") || "here" }}
            </router-link>
            {{ $t("noOrdersPt2") }}
        </p>

        <!-- Orders list -->
        <div v-else class="mt-4">
            <!-- ── Desktop table (md+) ── -->
            <div class="d-none d-md-block">
                <!-- Header row -->
                <div class="order-row order-header">
                    <div class="order-col col-id">{{ $t("order_ref") }}</div>
                    <div class="order-col col-date">{{ $t("date") }}</div>
                    <div class="order-col col-items">{{ $t("items") }}</div>
                    <div class="order-col col-total">{{ $t("total") }}</div>
                    <div class="order-col col-status">{{ $t("status") }}</div>
                    <div class="order-col col-toggle"></div>
                </div>

                <v-divider />

                <template v-for="order in userOrders" :key="order.id">
                    <!-- Summary row -->
                    <div
                        class="order-row order-data-row"
                        :class="{ 'order-open': expandedOrders[order.id] }"
                        @click="toggleOrder(order.id)"
                    >
                        <div class="order-col col-id">
                            #{{ shortOrderId(order) }}
                        </div>
                        <div class="order-col col-date">
                            {{ order.client_order_details.order_date_readable }}
                        </div>
                        <div class="order-col col-items">
                            {{ order.products_in_order.length }}
                            {{
                                order.products_in_order.length === 1
                                    ? $t("item")
                                    : $t("items")
                            }}
                        </div>
                        <div class="order-col col-total">
                            {{ formatTotal(order.client_order_details.order_total_eur) }}
                        </div>
                        <div class="order-col col-status">
                            <v-chip
                                :color="statusColor(order.order_status)"
                                variant="tonal"
                                size="small"
                            >
                                {{ $t(order.order_status) }}
                            </v-chip>
                        </div>
                        <div class="order-col col-toggle">
                            <v-icon
                                class="chevron-icon"
                                :class="{ 'rotate-180': expandedOrders[order.id] }"
                            >
                                mdi-chevron-down
                            </v-icon>
                        </div>
                    </div>

                    <!-- Expanded detail -->
                    <v-expand-transition>
                        <div
                            v-show="expandedOrders[order.id]"
                            class="order-expanded"
                            :style="{ borderLeftColor: statusBorderColor(order.order_status) }"
                        >
                            <!-- Products section -->
                            <div class="expanded-section">
                                <div class="expanded-label">{{ $t("products") }}</div>
                                <div class="product-row product-header">
                                    <span class="product-col-name">{{ $t("product") }}</span>
                                    <span class="product-col-size">{{ $t("size") }}</span>
                                    <span class="product-col-qty">{{ $t("quantity") }}</span>
                                    <span class="product-col-price">{{ $t("price") }}</span>
                                </div>
                                <div
                                    v-for="(item, idx) in order.products_in_order"
                                    :key="idx"
                                    class="product-row"
                                >
                                    <span class="product-col-name">{{ productName(item.internal_product_id) }}</span>
                                    <span class="product-col-size">{{ item.size }}</span>
                                    <span class="product-col-qty">×{{ item.quantity }}</span>
                                    <span class="product-col-price">{{ productPrice(item.internal_product_id) }}</span>
                                </div>
                            </div>

                            <v-divider class="my-3" />

                            <!-- Delivery section -->
                            <div class="expanded-section">
                                <div class="expanded-label">{{ $t("delivery_details") }}</div>
                                <div v-if="order.delivery_method === 'home_delivery'">
                                    <div>{{ $t("home_delivery") }}</div>
                                    <div class="delivery-address">
                                        {{ order.customer_details.address_line_1
                                        }}<template v-if="order.customer_details.address_line_2"
                                            >, {{ order.customer_details.address_line_2 }}</template
                                        >, {{ order.customer_details.city }},
                                        {{ order.customer_details.zip }},
                                        {{ order.customer_details.country }}
                                    </div>
                                </div>
                                <div v-else>
                                    <div class="font-weight-bold">
                                        {{ order.selected_office_details.office_name }}
                                    </div>
                                    <div class="delivery-address">
                                        {{
                                            order.selected_office_details.office_address
                                                ?.fullAddressString ||
                                            $t("no_address_available")
                                        }}
                                    </div>
                                    <div class="delivery-hours">
                                        {{ $t("opening_hours") }}:
                                        {{ order.selected_office_details.working_time_from }}
                                        -
                                        {{ order.selected_office_details.working_time_to }}
                                    </div>
                                </div>
                            </div>

                            <div class="expanded-spacer"></div>
                        </div>
                    </v-expand-transition>

                    <v-divider />
                </template>
            </div>

            <!-- ── Mobile layout (sm-) ── -->
            <div class="d-md-none">
                <template v-for="order in userOrders" :key="'m-' + order.id">
                    <div
                        class="mobile-order py-3"
                        :class="{ 'mobile-order--open': expandedOrders[order.id] }"
                    >
                        <!-- Top row: order # + status + toggle -->
                        <div class="mobile-order-top" @click="toggleOrder(order.id)">
                            <span class="mobile-order-id">#{{ shortOrderId(order) }}</span>
                            <div class="d-flex align-center ga-2">
                                <v-chip
                                    :color="statusColor(order.order_status)"
                                    variant="tonal"
                                    size="small"
                                >
                                    {{ $t(order.order_status) }}
                                </v-chip>
                                <v-icon
                                    class="chevron-icon"
                                    :class="{ 'rotate-180': expandedOrders[order.id] }"
                                >
                                    mdi-chevron-down
                                </v-icon>
                            </div>
                        </div>

                        <!-- Subtitle: date · items · total -->
                        <div class="mobile-order-sub">
                            {{ order.client_order_details.order_date_readable }} ·
                            {{ order.products_in_order.length }}
                            {{
                                order.products_in_order.length === 1
                                    ? $t("item")
                                    : $t("items")
                            }}
                            ·
                            {{ formatTotal(order.client_order_details.order_total_eur) }}
                        </div>

                        <!-- Expanded detail -->
                        <v-expand-transition>
                            <div
                                v-show="expandedOrders[order.id]"
                                class="mobile-expanded mt-3"
                                :style="{ borderLeftColor: statusBorderColor(order.order_status) }"
                            >
                                <div class="expanded-label">{{ $t("products") }}</div>
                                <div
                                    v-for="(item, idx) in order.products_in_order"
                                    :key="idx"
                                    class="mobile-product-row"
                                >
                                    {{ productName(item.internal_product_id) }} ·
                                    {{ item.size }} · ×{{ item.quantity }} ·
                                    {{ productPrice(item.internal_product_id) }}
                                </div>

                                <div class="expanded-label mt-3">{{ $t("delivery_details") }}</div>
                                <div v-if="order.delivery_method === 'home_delivery'">
                                    {{ $t("home_delivery") }} —
                                    {{ order.customer_details.address_line_1 }},
                                    {{ order.customer_details.city }}
                                </div>
                                <div v-else>
                                    <div class="font-weight-bold">
                                        {{ order.selected_office_details.office_name }}
                                    </div>
                                    <div>
                                        {{
                                            order.selected_office_details.office_address
                                                ?.fullAddressString ||
                                            $t("no_address_available")
                                        }}
                                    </div>
                                    <div class="delivery-hours">
                                        {{ $t("opening_hours") }}:
                                        {{ order.selected_office_details.working_time_from }}
                                        -
                                        {{ order.selected_office_details.working_time_to }}
                                    </div>
                                </div>
                            </div>
                        </v-expand-transition>
                    </div>
                    <v-divider />
                </template>
            </div>

            <!-- Support / returns note — shown only when the user has orders -->
            <p class="orders-support-note mt-6">
                {{ $t("orders_support_message") }}
                <a :href="`mailto:${globalContactEmail}`" class="orders-support-email">{{
                    globalContactEmail
                }}</a>
            </p>
        </div>

        <!-- First-order discount promo — shown only while the user is still eligible -->
        <div
            v-if="!ordersLoading && userOrders.length === 0 && firstOrderDiscountEnabled"
            class="first-order-promo mt-3"
        >
            {{ firstOrderDiscountPromoText }}
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            userOrders: [],
            ordersLoading: false,
            expandedOrders: {}, // { [orderId]: boolean }
        };
    },

    computed: {
        firstOrderDiscountEnabled() {
            return this.$store.getters["systemVariables/firstOrderDiscountEnabled"];
        },
        firstOrderDiscountPromoText() {
            return this.$t("first_order_discount_promo", {
                percent: this.$store.getters["systemVariables/firstOrderDiscountPercent"],
            });
        },
    },

    async mounted() {
        this.ordersLoading = true;
        try {
            await this.fetchUserOrders();
            // Ensure products are loaded so product names and prices resolve correctly,
            // even if the user navigates directly to /account without visiting /store first
            if (!this.$store.getters.productsArray?.length) {
                await this.$store.dispatch("products/fetchProductsFromFirestore");
            }
        } catch (error) {
            console.error("Error loading orders panel:", error);
        } finally {
            this.ordersLoading = false;
        }
    },

    methods: {
        async fetchUserOrders() {
            // Use the UID already stored in userDetails by the auth flow, avoiding a direct
            // firebaseAuth import. Falls back gracefully if userDetails isn't populated yet.
            const uid = this.userDetails?.user?.uid;
            try {
                this.userOrders = (await this.$store.dispatch("fetchUserOrders", uid)) || [];
            } catch (error) {
                console.error("Error fetching user orders:", error);
            }
        },

        // Toggle expanded state for a given order row
        toggleOrder(orderId) {
            this.expandedOrders[orderId] = !this.expandedOrders[orderId];
        },

        // First 8 chars of the Firestore document ID used as the order reference number
        shortOrderId(order) {
            return order.id.slice(0, 8);
        },

        // Map order status to a Vuetify colour name (used by the v-chip)
        statusColor(status) {
            const map = { Pending: "blue", Shipped: "orange", Delivered: "green", Returned: "red" };
            return map[status] ?? "grey";
        },

        // Muted rgba border colour matching the status badge, for the accent bar
        statusBorderColor(status) {
            const map = {
                Pending: "rgba(33,  150, 243, 0.35)",
                Shipped: "rgba(255, 152,   0, 0.35)",
                Delivered: "rgba(76,  175,  80, 0.35)",
                Returned: "rgba(244,  67,  54, 0.35)",
            };
            return map[status] ?? "rgba(0, 0, 0, 0.18)";
        },

        // Resolve product display name from its translations object, matching ProductPage's pattern
        productName(internal_product_id) {
            const product = this.$store.getters.productsArray?.find(
                (p) => p.internalProductId === internal_product_id,
            );
            return product?.translations?.[this.pageLang]?.productName ?? internal_product_id;
        },

        // Look up the current price for a product from the products store
        productPrice(internal_product_id) {
            const product = this.$store.getters.productsArray?.find(
                (p) => p.internalProductId === internal_product_id,
            );
            return product ? `€${Number(product.price_eur).toFixed(2)}` : "—";
        },

        // Format a EUR total string with the sign on the left
        formatTotal(total_eur) {
            return `€${Number(total_eur).toFixed(2)}`;
        },
    },
};
</script>

<style scoped>
.store-page-link {
    font: inherit;
    font-size: 0.9rem;
    opacity: 0.6;
}

/* ── Desktop table ── */

.order-row {
    display: grid;
    grid-template-columns: 120px 1fr 100px 80px 110px 36px;
    align-items: center;
    gap: 0 12px;
    padding: 10px 4px;
    cursor: pointer;
}

.order-header {
    font-size: 0.8rem;
    opacity: 0.6;
    font-weight: 500;
    cursor: default;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    padding-bottom: 8px;
}

.order-data-row {
    transition: background-color 0.15s ease, padding-left 0.15s ease, border-left-color 0.15s ease;
}

.order-data-row:hover {
    opacity: 0.75;
}

/* Tint only on the summary row when expanded — no border, so it sits flush */
.order-data-row.order-open {
    background: rgba(0, 0, 0, 0.025);
}

.col-id {
    font-family: monospace;
    font-size: 0.9rem;
}

.col-toggle {
    display: flex;
    justify-content: center;
}

.chevron-icon {
    transition: transform 0.2s ease;
}

.rotate-180 {
    transform: rotate(180deg);
}

/* Expanded detail panel — thick accent bar indents the content so it clearly belongs to the order above */
.order-expanded {
    border-left: 5px solid rgba(0, 0, 0, 0.18);
    background: rgba(0, 0, 0, 0.025);
    padding: 8px 4px 4px 18px;
}

.expanded-section {
    margin-bottom: 4px;
}

.expanded-label {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.55;
    margin-bottom: 6px;
}

.expanded-spacer {
    height: 8px;
}

/* Product mini-table inside expanded panel */
.product-row {
    display: grid;
    grid-template-columns: 1fr 60px 48px 80px;
    gap: 0 8px;
    padding: 3px 0;
    font-size: 0.9rem;
}

.product-header {
    font-size: 0.75rem;
    opacity: 0.55;
    font-weight: 500;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding-bottom: 4px;
    margin-bottom: 2px;
}

.delivery-address {
    font-size: 0.9rem;
    opacity: 0.75;
    margin-top: 2px;
}

.delivery-hours {
    font-size: 0.8rem;
    opacity: 0.6;
    margin-top: 4px;
}

/* ── Mobile layout ── */

.mobile-order {
    padding-left: 2px;
    padding-right: 2px;
    transition: background-color 0.15s ease, padding-left 0.15s ease, border-left-color 0.15s ease;
}

/* Tint the whole mobile order when open, border only on the expanded detail section */
.mobile-order.mobile-order--open {
    background: rgba(0, 0, 0, 0.025);
}

.mobile-order--open .mobile-expanded {
    border-left: 5px solid rgba(0, 0, 0, 0.18);
    padding-left: 14px;
}

.mobile-order-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}

.mobile-order-id {
    font-family: monospace;
    font-size: 0.95rem;
}

.mobile-order-sub {
    font-size: 0.85rem;
    opacity: 0.6;
    margin-top: 3px;
}

.mobile-expanded {
    font-size: 0.9rem;
}

.mobile-product-row {
    padding: 2px 0;
    opacity: 0.85;
}

.orders-support-note {
    font-size: 0.85rem;
    color: #9e9e9e;
}

.orders-support-email {
    color: #9e9e9e;
}

.first-order-promo {
    font-size: 0.9rem;
    font-weight: 500;
    color: #2e7d32;
    background: rgba(46, 125, 50, 0.08);
    border-radius: 0.5rem;
    padding: 10px 14px;
}
</style>
