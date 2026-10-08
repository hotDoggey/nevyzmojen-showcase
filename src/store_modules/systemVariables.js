// store_modules/systemVariables.js
import { firestoreDB, collection, getDocs } from "@/mainjsHelpers/FirestoreSetup";

export default {
    namespaced: true,

    state: () => ({
        firstOrderDiscountPercent: 0, // 0 = feature disabled
        orderToAddressEnabled: false, // false = address delivery hidden
        freeDeliveryOverAmount: 0, // 0 = feature disabled
        shippingCostEUR: 4.99, // fallback flat shipping fee until Firestore value loads
        loaded: false, // becomes true once the fetch resolves (success or failure)
    }),

    mutations: {
        SET_SYSTEM_VARIABLES(
            state,
            {
                firstOrderDiscountPercent,
                orderToAddressEnabled,
                freeDeliveryOverAmount,
                shippingCostEUR,
            },
        ) {
            state.firstOrderDiscountPercent = firstOrderDiscountPercent;
            state.orderToAddressEnabled = orderToAddressEnabled;
            state.freeDeliveryOverAmount = freeDeliveryOverAmount;
            state.shippingCostEUR = shippingCostEUR;
        },
        SET_SYSTEM_VARIABLES_LOADED(state, val) {
            state.loaded = val;
        },
    },

    actions: {
        // Fetches the /system_variables collection (custom doc IDs, each holding a single
        // "value" field) and maps doc id -> value into flat state.
        async fetchSystemVariables({ commit }) {
            try {
                const snapshot = await getDocs(collection(firestoreDB, "system_variables"));
                const map = {};
                snapshot.docs.forEach((doc) => {
                    map[doc.id] = doc.data().value;
                });

                commit("SET_SYSTEM_VARIABLES", {
                    firstOrderDiscountPercent: Number(map.first_order_discount_percent) || 0,
                    orderToAddressEnabled: map.order_to_address === true,
                    freeDeliveryOverAmount: Number(map.free_delivery_over_amount) || 0,
                    // Explicit undefined/null check (not `||`) so an intentional 0 (free shipping
                    // for everyone) isn't silently overridden by the fallback fee.
                    shippingCostEUR:
                        map.shipping_cost_eur !== undefined && map.shipping_cost_eur !== null
                            ? Number(map.shipping_cost_eur)
                            : 4.99,
                });
            } catch (error) {
                console.error("Error fetching system variables:", error);
                // leave safe defaults (all features disabled) on failure
            } finally {
                commit("SET_SYSTEM_VARIABLES_LOADED", true);
            }
        },
    },

    getters: {
        firstOrderDiscountPercent: (state) => state.firstOrderDiscountPercent,
        orderToAddressEnabled: (state) => state.orderToAddressEnabled,
        freeDeliveryOverAmount: (state) => state.freeDeliveryOverAmount,
        shippingCostEUR: (state) => state.shippingCostEUR,
        isLoaded: (state) => state.loaded,
        firstOrderDiscountEnabled: (state) => state.firstOrderDiscountPercent > 0,
        freeDeliveryEnabled: (state) => state.freeDeliveryOverAmount > 0,
    },
};
