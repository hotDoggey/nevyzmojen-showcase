// store_modules/products.js
import { firestoreDB, collection, getDocs, doc, updateDoc } from "@/mainjsHelpers/FirestoreSetup";
import i18n from "@/assets/text_translations/i18n.js";

export default {
    namespaced: true,

    state: () => ({
        productsArray: [],
        // Local loading flag — does NOT touch the global isLoading so App.vue's
        // router-view stays mounted and StorePage can display its own skeleton loaders
        productsLoading: false,
    }),

    mutations: {
        SET_PRODUCTS(state, products) {
            state.productsArray = products;
        },
        SET_PRODUCTS_LOADING(state, value) {
            state.productsLoading = value;
        },
        // Update a single product's stock map in the local store after a successful Firestore write
        UPDATE_PRODUCT_STOCK(state, { productFirestoreId, stock }) {
            const product = state.productsArray.find((p) => p.id === productFirestoreId);
            if (product) product.stock = { ...stock };
        },
    },

    actions: {
        async fetchProductsFromFirestore({ commit }) {
            commit("SET_PRODUCTS_LOADING", true);
            try {
                const querySnapshot = await getDocs(collection(firestoreDB, "products"));

                const productsArray = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data() || {};
                    // skip products explicitly marked inactive (undefined or true => include)
                    if (data.isActive === false) return;
                    const product = { ...data, id: doc.id };
                    productsArray.push(product);
                });

                commit("SET_PRODUCTS", productsArray);

                // inject translations into i18n
                productsArray.forEach((product) => {
                    if (!product.translations) return;
                    const availLangs = Object.keys(product.translations);
                    availLangs.forEach((lang) => {
                        if (!i18n.global.messages[lang]) {
                            i18n.global.messages[lang] = {};
                        }
                        i18n.global.messages[lang][product.internalProductId + "ProductName"] =
                            product.translations[lang].productName;
                        i18n.global.messages[lang][
                            product.internalProductId + "ProductDescription"
                        ] = product.translations[lang].description;
                    });
                });
            } catch (error) {
                commit("setErrorMessage", error.message || error, { root: true });
                console.error("Error fetching products:", error);
                return error;
            } finally {
                commit("SET_PRODUCTS_LOADING", false);
            }
        },

        // Write a new stock map for a product to Firestore and sync to local state
        async updateProductStock({ commit }, { productFirestoreId, stock }) {
            await updateDoc(doc(firestoreDB, "products", productFirestoreId), { stock });
            commit("UPDATE_PRODUCT_STOCK", { productFirestoreId, stock });
        },
    },

    getters: {
        productsArray: (state) => state.productsArray,
    },
};
