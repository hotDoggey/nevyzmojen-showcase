<template>
    <div>
        <h1 class="pt-4 page-title text-center">{{ $t("admin_orders_title") }}</h1>

        <LoadingSpinner v-if="isLoading" />

        <v-container v-else fluid class="px-4 px-sm-8 py-6">
            <!-- Empty state -->
            <p v-if="ordersSorted.length === 0" class="text-center py-10 empty-state">
                {{ $t("no_orders_yet_admin") }}
            </p>

            <template v-else>
                <!-- ── Desktop layout (md+) ── -->
                <div class="d-none d-md-block">
                    <div class="admin-row admin-header">
                        <div class="a-col col-ref">{{ $t("order_ref") }}</div>
                        <div class="a-col col-date">{{ $t("date") }}</div>
                        <div class="a-col col-customer">{{ $t("customer") }}</div>
                        <div class="a-col col-total">{{ $t("total") }}</div>
                        <div class="a-col col-status">{{ $t("status") }}</div>
                        <div class="a-col col-toggle"></div>
                    </div>
                    <v-divider />

                    <template v-for="order in ordersSorted" :key="order.id">
                        <v-card
                            variant="flat"
                            class="order-card"
                        >
                            <!-- Clickable summary row -->
                            <div class="admin-row admin-data-row" @click="toggleOrder(order.id)">
                                <div class="a-col col-ref">#{{ shortOrderId(order) }}</div>
                                <div class="a-col col-date">
                                    {{ formatOrderDate(order) }}
                                </div>
                                <div class="a-col col-customer">
                                    <div>{{ order.customer_details.full_name }}</div>
                                    <div class="customer-email">
                                        {{ order.customer_details.email }}
                                    </div>
                                </div>
                                <div class="a-col col-total">
                                    €{{
                                        Number(order.client_order_details.order_total_eur).toFixed(
                                            2,
                                        )
                                    }}
                                </div>
                                <div class="a-col col-status">
                                    <v-chip
                                        :color="statusColor(order.order_status)"
                                        variant="tonal"
                                        size="small"
                                    >
                                        {{ $t(order.order_status) }}
                                    </v-chip>
                                </div>
                                <div class="a-col col-toggle">
                                    <v-icon
                                        class="chevron-icon"
                                        :class="{ 'rotate-180': expandedOrders[order.id] }"
                                    >
                                        mdi-chevron-down
                                    </v-icon>
                                </div>
                            </div>

                            <!-- Expanded detail panel -->
                            <v-expand-transition>
                                <div
                                    v-show="expandedOrders[order.id]"
                                    class="order-expanded"
                                    :style="{
                                        borderLeftColor: statusBorderColor(order.order_status),
                                    }"
                                >
                                    <div class="expanded-grid">
                                        <!-- Left: Customer + Delivery + Status form -->
                                        <div>
                                            <div class="expanded-label">{{ $t("customer") }}</div>
                                            <div class="detail-line">
                                                {{ order.customer_details.full_name }}
                                            </div>
                                            <div class="detail-line">
                                                {{ order.customer_details.email }}
                                            </div>
                                            <div class="detail-line">
                                                {{
                                                    formatPhone(order.customer_details.phone_number)
                                                }}
                                            </div>

                                            <!-- Home delivery: show delivery type + address -->
                                            <template
                                                v-if="order.delivery_method === 'home_delivery'"
                                            >
                                                <div class="expanded-label mt-3">
                                                    {{ $t("delivery_home_label") }}
                                                </div>
                                                <div class="detail-line">
                                                    {{ order.customer_details.address_line_1 }}
                                                </div>
                                                <div
                                                    v-if="order.customer_details.address_line_2"
                                                    class="detail-line"
                                                >
                                                    {{ order.customer_details.address_line_2 }}
                                                </div>
                                                <div class="detail-line">
                                                    {{ order.customer_details.city }},
                                                    {{ order.customer_details.zip }},
                                                    {{ order.customer_details.country }}
                                                </div>
                                            </template>

                                            <!-- Speedy office: show office name + address only -->
                                            <template v-else>
                                                <div class="expanded-label mt-3">
                                                    {{ $t("delivery_speedy_label") }}
                                                </div>
                                                <div class="detail-line font-weight-medium">
                                                    {{ order.selected_office_details?.office_name }}
                                                </div>
                                                <div class="detail-line">
                                                    {{
                                                        order.selected_office_details
                                                            ?.office_address?.fullAddressString
                                                    }}
                                                </div>
                                            </template>

                                            <div class="expanded-label mt-3">
                                                {{ $t("update_status_label") }}
                                            </div>
                                            <v-select
                                                v-model="order.order_status"
                                                :items="[
                                                    'Pending',
                                                    'Shipped',
                                                    'Delivered',
                                                    'Returned',
                                                ]"
                                                density="compact"
                                                variant="outlined"
                                                hide-details
                                                class="status-select mt-1"
                                            />
                                            <v-btn
                                                class="mt-2"
                                                color="primary"
                                                size="small"
                                                @click="updateStatus(order)"
                                            >
                                                {{ $t("update_status_label") }}
                                            </v-btn>
                                        </div>

                                        <!-- Right: Products -->
                                        <div>
                                            <div class="expanded-label">{{ $t("products") }}</div>
                                            <div
                                                v-for="(product, idx) in order.products_in_order"
                                                :key="idx"
                                                class="product-line"
                                            >
                                                {{ productLabel(product) }}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </v-expand-transition>
                        </v-card>
                        <v-divider />
                    </template>
                </div>

                <!-- ── Mobile layout (sm-) ── -->
                <div class="d-md-none">
                    <template v-for="order in ordersSorted" :key="'m-' + order.id">
                        <v-card
                            variant="flat"
                            class="mobile-order-card mb-3"
                        >
                            <!-- Tappable header -->
                            <div class="mobile-header" @click="toggleOrder(order.id)">
                                <div>
                                    <div class="mobile-ref">#{{ shortOrderId(order) }}</div>
                                    <div class="mobile-sub">
                                        {{ formatOrderDate(order) }} · €{{
                                            Number(
                                                order.client_order_details.order_total_eur,
                                            ).toFixed(2)
                                        }}
                                    </div>
                                </div>
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

                            <!-- Expanded detail panel -->
                            <v-expand-transition>
                                <div
                                    v-show="expandedOrders[order.id]"
                                    class="mobile-expanded"
                                    :style="{
                                        borderLeftColor: statusBorderColor(order.order_status),
                                    }"
                                >
                                    <div class="expanded-label">{{ $t("customer") }}</div>
                                    <div class="detail-line">
                                        {{ order.customer_details.full_name }}
                                    </div>
                                    <div class="detail-line">
                                        {{ order.customer_details.email }}
                                    </div>
                                    <div class="detail-line">
                                        {{ formatPhone(order.customer_details.phone_number) }}
                                    </div>

                                    <!-- Home delivery: show delivery type + address -->
                                    <template v-if="order.delivery_method === 'home_delivery'">
                                        <div class="expanded-label mt-3">
                                            {{ $t("delivery_home_label") }}
                                        </div>
                                        <div class="detail-line">
                                            {{ order.customer_details.address_line_1 }}
                                        </div>
                                        <div
                                            v-if="order.customer_details.address_line_2"
                                            class="detail-line"
                                        >
                                            {{ order.customer_details.address_line_2 }}
                                        </div>
                                        <div class="detail-line">
                                            {{ order.customer_details.city }},
                                            {{ order.customer_details.zip }},
                                            {{ order.customer_details.country }}
                                        </div>
                                    </template>

                                    <!-- Speedy office: show office name + address only -->
                                    <template v-else>
                                        <div class="expanded-label mt-3">
                                            {{ $t("delivery_speedy_label") }}
                                        </div>
                                        <div class="detail-line font-weight-medium">
                                            {{ order.selected_office_details?.office_name }}
                                        </div>
                                        <div class="detail-line">
                                            {{
                                                order.selected_office_details?.office_address
                                                    ?.fullAddressString
                                            }}
                                        </div>
                                    </template>

                                    <div class="expanded-label mt-3">{{ $t("products") }}</div>
                                    <div
                                        v-for="(product, idx) in order.products_in_order"
                                        :key="idx"
                                        class="product-line"
                                    >
                                        {{ productLabel(product) }}
                                    </div>

                                    <div class="expanded-label mt-3">
                                        {{ $t("update_status_label") }}
                                    </div>
                                    <v-select
                                        v-model="order.order_status"
                                        :items="['Pending', 'Shipped', 'Delivered', 'Returned']"
                                        density="compact"
                                        variant="outlined"
                                        hide-details
                                        class="status-select mt-1"
                                    />
                                    <v-btn
                                        class="mt-2 mb-1"
                                        color="primary"
                                        size="small"
                                        @click="updateStatus(order)"
                                    >
                                        {{ $t("update_status_label") }}
                                    </v-btn>
                                </div>
                            </v-expand-transition>
                        </v-card>
                    </template>
                </div>
            </template>
        </v-container>

        <!-- ── Site Visits ── -->
        <v-container fluid class="px-4 px-sm-8 pb-10">
            <h2 class="visits-title">{{ $t("recent_site_visits") }}</h2>

            <LoadingSpinner v-if="siteVisitsLoading" />

            <template v-else>
                <p v-if="siteVisits.length === 0" class="text-center py-6 empty-state">
                    {{ $t("no_visits_yet") }}
                </p>

                <template v-else>
                    <!-- Desktop (md+) -->
                    <div class="d-none d-md-block">
                        <div class="visit-row visit-header">
                            <div class="v-col col-vid">{{ $t("visit_id_label") }}</div>
                            <div class="v-col col-vdate">{{ $t("date_time_label") }}</div>
                            <div class="v-col col-vloc">{{ $t("location_label") }}</div>
                            <div class="v-col col-vauth">{{ $t("auth_label") }}</div>
                            <div class="v-col col-vdevice">{{ $t("device_label") }}</div>
                            <div class="v-col col-vbrowser">{{ $t("browser_label") }}</div>
                            <div class="v-col col-vviewport">{{ $t("viewport_label") }}</div>
                        </div>
                        <v-divider />
                        <template v-for="visit in siteVisits" :key="visit.id">
                            <div class="visit-row visit-data-row">
                                <div class="v-col col-vid">{{ visit.id.slice(0, 8).toUpperCase() }}</div>
                                <div class="v-col col-vdate">{{ formatVisitDate(visit) }}</div>
                                <div class="v-col col-vloc">{{ visit.timezone }}</div>
                                <div class="v-col col-vauth">{{ visit.auth_type }}</div>
                                <div class="v-col col-vdevice">{{ visit.device_type }}</div>
                                <div class="v-col col-vbrowser">{{ visit.browser }}</div>
                                <div class="v-col col-vviewport">{{ visit.viewport }}</div>
                            </div>
                            <v-divider />
                        </template>
                    </div>

                    <!-- Mobile (sm-) -->
                    <div class="d-md-none">
                        <div
                            v-for="visit in siteVisits"
                            :key="'mv-' + visit.id"
                            class="visit-mobile-card mb-2"
                        >
                            <div class="visit-mobile-id">{{ visit.id.slice(0, 8).toUpperCase() }}</div>
                            <div class="visit-mobile-sub">{{ formatVisitDate(visit) }}</div>
                            <div class="visit-mobile-sub">{{ visit.timezone }} · {{ visit.auth_type }} · {{ visit.device_type }}</div>
                            <div class="visit-mobile-sub">{{ visit.browser }} · {{ visit.viewport }}</div>
                        </div>
                    </div>
                </template>
            </template>
        </v-container>

        <!-- Dev tools — uncomment to use -->
        <v-container>
            <v-row>
                <v-col>
                    <!-- <v-btn @click="sendTestEmail">SEND test email to refresh api key</v-btn>
                    <v-btn @click="createProduct">create product</v-btn> -->
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
export default {
    name: "AdminOrdersPage",
    data() {
        return {
            expandedOrders: {}, // { [orderId]: boolean }
        };
    },
    computed: {
        isAdmin() {
            return this.$store.getters.is_admin;
        },
        siteVisits() {
            return this.$store.state.siteVisits;
        },
        siteVisitsLoading() {
            return this.$store.state.siteVisitsLoading;
        },
        // Orders sorted newest first by server-generated timestamp
        ordersSorted() {
            const list = [...(this.$store.state.orders || [])];
            return list.sort((a, b) => {
                const tsA = a.server_generated_timestamp ?? 0;
                const tsB = b.server_generated_timestamp ?? 0;
                return tsB - tsA;
            });
        },
    },
    async mounted() {
        if (!this.isAdmin) return;
        this.fetchOrders();
        this.$store.dispatch("fetchSiteVisits");

        // Ensure products are loaded so product names resolve, even if an admin
        // navigates directly to this page without visiting /store first
        if (!this.$store.getters.productsArray?.length) {
            await this.$store.dispatch("products/fetchProductsFromFirestore");
        }
    },
    methods: {
        async fetchOrders() {
            await this.$store.dispatch("fetchOrdersFromFirestore");
        },

        // Format the stored ISO timestamp in the visitor's recorded timezone
        formatVisitDate(visit) {
            if (!visit.timestamp_iso) return "—";
            return new Date(visit.timestamp_iso).toLocaleString("en-GB", {
                timeZone: visit.timezone || "UTC",
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                timeZoneName: "short",
            });
        },

        // Toggle expanded state for a given order row
        toggleOrder(orderId) {
            this.expandedOrders[orderId] = !this.expandedOrders[orderId];
        },

        // First 8 chars of the Firestore document ID used as a short order reference
        shortOrderId(order) {
            return order.id.slice(0, 8).toUpperCase();
        },

        // Resolve a product's display name from its translations map, matching
        // the pattern used in AccountOrdersPanel.vue
        productName(internal_product_id) {
            const product = this.$store.getters.productsArray?.find(
                (p) => p.internalProductId === internal_product_id,
            );
            return product?.translations?.[this.pageLang]?.productName ?? null;
        },

        // Format: first 8 chars of product_id — Name (internal_product_id) — Qty: X — Size: Y
        productLabel(product) {
            const shortId = (product.product_id || "").slice(0, 8).toUpperCase();
            const name = this.productName(product.internal_product_id);
            const idLabel = name
                ? `${name} (${product.internal_product_id})`
                : product.internal_product_id;
            return `${shortId} — ${idLabel} — Qty: ${product.quantity} — ${product.size}`;
        },

        // Normalise phone field which can be a string or { country_code, number } object
        formatPhone(phone) {
            if (!phone) return "—";
            if (phone?.country_code) return `${phone.country_code} ${phone.number}`;
            return phone;
        },

        // Vuetify colour name for the status chip (matches AccountOrdersPanel)
        statusColor(status) {
            const map = { Pending: "blue", Shipped: "orange", Delivered: "green", Returned: "red" };
            return map[status] ?? "grey";
        },

        // Muted accent bar colour for the expanded panel (matches AccountOrdersPanel)
        statusBorderColor(status) {
            const map = {
                Pending:   "rgba(33,  150, 243, 0.35)",
                Shipped:   "rgba(255, 152,   0, 0.35)",
                Delivered: "rgba(76,  175,  80, 0.35)",
                Returned:  "rgba(244,  67,  54, 0.35)",
            };
            return map[status] ?? "rgba(0, 0, 0, 0.18)";
        },

        // Update order status and show a snackbar on success/failure
        async updateStatus(order) {
            try {
                await this.$store.dispatch("updateOrderStatus", order);
                this.$store.dispatch("triggerSnackbar", {
                    snackbarText: `${this.$t("order")} ${order.id} ${this.$t(
                        "updated_to",
                    )} ${this.$t(order.order_status)}.`,
                    snackbarDuration: 3000,
                });
            } catch (err) {
                const code = err?.code ? `(${err.code}) ` : "";
                const message = err?.message || String(err);
                this.$store.dispatch("triggerSnackbar", {
                    snackbarText:
                        this.$t("snackbar_failed_update_order_status") || `${code}${message}`,
                    snackbarDuration: 5000,
                });
            }
        },

        // Format Unix ms timestamp as "Sat Apr 11 2026, HH:MM"; falls back to legacy field
        formatOrderDate(order) {
            const ts = order.server_generated_timestamp;
            if (!ts) return order.client_order_details?.order_date_readable || "—";
            const d = new Date(ts);
            const weekday = d.toLocaleString("en-GB", { weekday: "short" });
            const month = d.toLocaleString("en-GB", { month: "short" });
            const day = d.getDate();
            const year = d.getFullYear();
            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            return `${weekday} ${month} ${day} ${year}, ${hh}:${mm}`;
        },

        // Send a test email to verify email functionality and refresh the API key
        sendTestEmail() {
            this.$store.dispatch("sendTestEmail", "admin@example.com");
        },

        // Create a product with hardcoded test data
        createProduct() {
            const product = {
                availableSizes: ["S", "M", "L", "XL"],
                brand: "Nevyzmojen",
                category: ["t-shirts", "casual"],
                currency: "EUR",
                dimensions: { height: "5cm", length: "30cm", width: "20cm" },
                discount: { amount: 0, type: "fixed" },
                gender: ["male"],
                imageSizeChart:
                    "https://hotdoggey.github.io/nevyzmojen-assets/product-images/p1-mens-oversize-1/size-chart.jpg",
                images: [
                    "https://hotdoggey.github.io/nevyzmojen-assets/product-images/p1-mens-oversize-1/white/front.jpeg",
                    "https://hotdoggey.github.io/nevyzmojen-assets/product-images/p1-mens-oversize-1/white/front2.jpeg",
                    "https://hotdoggey.github.io/nevyzmojen-assets/product-images/p1-mens-oversize-1/white/back.jpeg",
                ],
                inStockSizes: ["S", "M", "L", "XL"],
                internalProductId: "firstProduct",
                isActive: true,
                isFeatured: true,
                price_eur: "45.51",
                rating: { average: 4.5, reviewsCount: 125 },
                releaseDate: "2024-08-01",
                season: ["autumn", "spring"],
                sizeChartImgUrl: "https://i.imgur.com/SEaH07T.jpeg",
                store_order: 2,
                tags: ["new", "limited"],
                translations: {
                    bg: {
                        careInstructions: "??",
                        colorOptions: [
                            { color: "??", image: "https://example.com/red-image.jpg" },
                            { color: "??", image: "https://example.com/blue-image.jpg" },
                        ],
                        description: "??",
                        material: "??",
                        productName: "??",
                    },
                    en: {
                        careInstructions: "Machine wash cold. Do not bleach.",
                        colorOptions: [
                            { color: "White", image: "https://example.com/red-image.jpg" },
                            { color: "Blue", image: "https://example.com/blue-image.jpg" },
                        ],
                        description:
                            "Comfortable cotton t-shirt embroidered with unique high quality design of our logo front and center.",
                        material: "cotton",
                        productName: "НЕВЪЗМОЖЕН - Oversize T-shirt White",
                    },
                },
                weight: "0.5kg",
                data_created: new Date().toLocaleString(),
                transparent_thumbnail:
                    "https://hotdoggey.github.io/nevyzmojen-assets/product-images/p1-mens-oversize-1/black/front_tr.png",
            };

            this.$store.dispatch("createProductInFirestore", product);
        },
    },
};
</script>

<style scoped>
/* ── Page ── */
.empty-state {
    font-size: 1rem;
    opacity: 0.5;
}

/* ── Desktop table ── */

.admin-row {
    display: grid;
    grid-template-columns: 120px 130px 1fr 90px 100px 36px;
    align-items: center;
    gap: 0 12px;
    padding: 10px 12px;
}

.admin-header {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.55;
    cursor: default;
    padding-bottom: 8px;
}

.order-card {
    border-radius: 0;
    margin: 0;
}

.admin-data-row {
    cursor: pointer;
    transition: opacity 0.15s ease;
}

.admin-data-row:hover {
    opacity: 0.75;
}

.col-ref {
    font-family: monospace;
    font-size: 0.88rem;
}

.customer-email {
    font-size: 0.8rem;
    opacity: 0.6;
}

.col-total {
    font-variant-numeric: tabular-nums;
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

/* Expanded detail panel — left accent bar, 2-col grid */
.order-expanded {
    border-left: 5px solid rgba(0, 0, 0, 0.18);
    padding: 12px 16px 16px 20px;
    margin: 0 4px 8px;
    background: rgba(0, 0, 0, 0.02);
    text-align: left;
}

.expanded-grid {
    display: grid;
    grid-template-columns: 55% 45%;
    gap: 0 24px;
}

.expanded-label {
    font-size: 0.73rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.5;
    margin-bottom: 5px;
}

.detail-line {
    font-size: 0.88rem;
    line-height: 1.5;
    opacity: 0.85;
}

.product-line {
    font-size: 0.85rem;
    font-family: monospace;
    line-height: 1.7;
    opacity: 0.85;
}

.status-select {
    max-width: 220px;
}

/* ── Mobile layout ── */

.mobile-order-card {
    border-radius: 6px;
    padding: 12px 14px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.mobile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}

.mobile-ref {
    font-family: monospace;
    font-size: 0.95rem;
    font-weight: 600;
}

.mobile-sub {
    font-size: 0.82rem;
    opacity: 0.6;
    margin-top: 2px;
}

.mobile-expanded {
    border-left: 4px solid rgba(0, 0, 0, 0.18);
    margin-top: 12px;
    padding-left: 14px;
    font-size: 0.88rem;
    text-align: left;
}

/* ── Site Visits table ── */
.visits-title {
    font-size: 1.1rem;
    font-weight: 600;
    opacity: 0.7;
    margin-bottom: 12px;
    text-align: left;
}

.visit-row {
    display: grid;
    grid-template-columns: 100px 220px 1fr 110px 80px 90px 90px;
    align-items: center;
    gap: 0 12px;
    padding: 8px 12px;
}

.visit-header {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    opacity: 0.55;
    padding-bottom: 6px;
}

.visit-data-row {
    font-size: 0.85rem;
}

.col-vid {
    font-family: monospace;
    font-size: 0.82rem;
}

.col-vdate {
    font-variant-numeric: tabular-nums;
    font-size: 0.82rem;
}

/* Mobile visit card */
.visit-mobile-card {
    background: rgba(0, 0, 0, 0.03);
    border-radius: 6px;
    padding: 10px 12px;
}

.visit-mobile-id {
    font-family: monospace;
    font-size: 0.9rem;
    font-weight: 600;
}

.visit-mobile-sub {
    font-size: 0.8rem;
    opacity: 0.65;
    margin-top: 2px;
}
</style>
