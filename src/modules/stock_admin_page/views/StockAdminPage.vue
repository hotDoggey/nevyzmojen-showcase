<template>
    <div class="stock-admin-page">
        <div class="stock-admin-header">
            <h1 class="stock-admin-title">{{ $t("stock_management") || "Stock Management" }}</h1>
        </div>

        <div v-if="!productsArray.length" class="stock-loading">
            {{ $t("loading") || "Loading..." }}
        </div>

        <div v-else class="product-list">
            <div
                v-for="product in productsArray"
                :key="product.id"
                class="product-stock-card"
            >
                <div class="product-stock-name">
                    {{ product.translations?.[pageLang]?.productName || product.internalProductId }}
                </div>

                <div v-if="!product.stock" class="no-stock-field">
                    No stock field — update Firestore document to add a <code>stock</code> map.
                </div>

                <div v-else class="size-inputs-row">
                    <div
                        v-for="size in sizeListFor(product)"
                        :key="size"
                        class="size-input-group"
                    >
                        <label class="size-label">{{ size }}</label>
                        <input
                            type="number"
                            min="0"
                            class="stock-input"
                            :class="{ 'stock-zero': localStock[product.id]?.[size] === 0 }"
                            :value="localStock[product.id]?.[size] ?? 0"
                            @change="onStockChange(product.id, size, $event.target.value)"
                        />
                    </div>
                </div>

                <div class="product-stock-actions">
                    <button
                        class="save-btn"
                        :disabled="saving[product.id] || !product.stock"
                        @click="saveProduct(product)"
                    >
                        {{ saving[product.id]
                            ? ($t("saving") || "Saving...")
                            : ($t("save") || "Save") }}
                    </button>
                    <span v-if="saved[product.id]" class="saved-indicator">
                        {{ $t("saved") || "Saved" }} ✓
                    </span>
                    <span v-if="saveError[product.id]" class="save-error">
                        Error — try again
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    data() {
        return {
            // Per-product editable stock: { [productFirestoreId]: { S: 3, M: 0, ... } }
            localStock: {},
            saving: {},
            saved: {},
            saveError: {},
        };
    },
    computed: {
        ...mapGetters({
            productsArray: "productsArray",
            pageLang: "pageLang",
        }),
    },
    watch: {
        productsArray: {
            handler() {
                this.initLocalStock();
            },
            immediate: true,
        },
    },
    methods: {
        // Copy product stock into localStock, skipping products already initialised
        initLocalStock() {
            this.productsArray.forEach((product) => {
                if (!product.stock || this.localStock[product.id]) return;
                this.localStock[product.id] = { ...product.stock };
            });
        },
        // Sizes sorted by canonical order from appConfig.sizeOrder
        sizeListFor(product) {
            if (!product.stock) return [];
            const order = this.$store.state.sizeOrder;
            return Object.keys(product.stock).sort((a, b) => {
                const ai = order.indexOf(a);
                const bi = order.indexOf(b);
                if (ai === -1 && bi === -1) return 0;
                if (ai === -1) return 1;
                if (bi === -1) return -1;
                return ai - bi;
            });
        },
        onStockChange(productId, size, rawValue) {
            const qty = Math.max(0, parseInt(rawValue, 10) || 0);
            if (!this.localStock[productId]) this.localStock[productId] = {};
            this.localStock[productId] = { ...this.localStock[productId], [size]: qty };
        },
        async saveProduct(product) {
            if (!product.stock) return;
            this.saving[product.id] = true;
            this.saved[product.id] = false;
            this.saveError[product.id] = false;
            try {
                const newStock = { ...this.localStock[product.id] };
                await this.$store.dispatch("products/updateProductStock", {
                    productFirestoreId: product.id,
                    stock: newStock,
                });
                this.saved[product.id] = true;
                setTimeout(() => {
                    this.saved[product.id] = false;
                }, 2500);
            } catch (e) {
                console.error("Error saving stock:", e);
                this.saveError[product.id] = true;
            } finally {
                this.saving[product.id] = false;
            }
        },
    },
};
</script>

<style scoped>
.stock-admin-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem 4rem;
}
.stock-admin-title {
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 2rem;
}
.product-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}
.product-stock-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}
.product-stock-name {
    font-size: 1rem;
    font-weight: 600;
}
.no-stock-field {
    font-size: 0.85rem;
    color: #999;
}
.no-stock-field code {
    background: #f4f4f4;
    padding: 1px 4px;
    border-radius: 3px;
}
.size-inputs-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 16px;
    align-items: flex-end;
}
.size-input-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}
.size-label {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    color: #555;
}
.stock-input {
    width: 60px;
    text-align: center;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 4px 6px;
    font-size: 0.95rem;
}
.stock-input.stock-zero {
    color: #bbb;
}
.stock-input:focus {
    outline: none;
    border-color: #555;
}
.product-stock-actions {
    display: flex;
    align-items: center;
    gap: 12px;
}
.save-btn {
    padding: 6px 20px;
    border: 1px solid #333;
    border-radius: 4px;
    background: #333;
    color: #fff;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s;
}
.save-btn:disabled {
    opacity: 0.4;
    cursor: default;
}
.saved-indicator {
    font-size: 0.85rem;
    color: #27ae60;
    font-weight: 500;
}
.save-error {
    font-size: 0.85rem;
    color: #c0392b;
    font-weight: 500;
}
</style>
