// store_modules/filters.js
import { firestoreDB, collection, getDocs } from "@/mainjsHelpers/FirestoreSetup";

export default {
    namespaced: true,

    state: () => ({
        // Available options fetched from Firestore
        categories: [],
        tags: [],

        // User-selected filters
        selectedCategories: [],
        selectedTags: [],
        selectedGender: [],
        selectedMaterial: [],
        selectedSeason: [],
        selectedFeatured: false,
    }),

    mutations: {
        SET_CATEGORIES(state, categories) {
            state.categories = categories;
        },
        SET_TAGS(state, tags) {
            state.tags = tags;
        },
        SET_SELECTED_CATEGORIES(state, selection) {
            state.selectedCategories = selection;
        },
        SET_SELECTED_TAGS(state, selection) {
            state.selectedTags = selection;
        },
        SET_SELECTED_GENDER(state, selection) {
            state.selectedGender = selection;
        },
        SET_SELECTED_MATERIAL(state, selection) {
            state.selectedMaterial = selection;
        },
        SET_SELECTED_SEASON(state, selection) {
            state.selectedSeason = selection;
        },
        SET_SELECTED_FEATURED(state, selection) {
            state.selectedFeatured = selection;
        },
    },

    actions: {
        async fetchCategories({ commit }) {
            try {
                const snapshot = await getDocs(collection(firestoreDB, "categories"));
                const categories = snapshot.docs
                    .map((doc) => doc.data())
                    .sort((a, b) => {
                        const ao = a.order ?? 9999; // fallback if missing
                        const bo = b.order ?? 9999;
                        return ao - bo;
                    });
                commit("SET_CATEGORIES", categories);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        },

        async fetchTags({ commit }) {
            try {
                const snapshot = await getDocs(collection(firestoreDB, "tags"));
                const tags = snapshot.docs
                    .map((doc) => doc.data())
                    .sort((a, b) => {
                        const ao = a.order ?? 9999; // fallback if missing
                        const bo = b.order ?? 9999;
                        return ao - bo;
                    });
                commit("SET_TAGS", tags);
            } catch (error) {
                console.error("Error fetching tags:", error);
            }
        },
        // async fetchFilter({ commit }, cfg) {
        //     // cfg: { collectionName, mutation, map, sortBy }
        //     const items = await getStandardFilterCollection(firestoreDB, cfg.collectionName, {
        //         map: cfg.map,
        //         sortBy: cfg.sortBy,
        //     });
        //     commit(cfg.mutation, items);
        // },
    },

    getters: {
        categories: (state) => state.categories,
        tags: (state) => state.tags,
        selectedCategories: (state) => state.selectedCategories,
        selectedTags: (state) => state.selectedTags,
        selectedGender: (state) => state.selectedGender,
        selectedMaterial: (state) => state.selectedMaterial,
        selectedSeason: (state) => state.selectedSeason,
        selectedFeatured: (state) => state.selectedFeatured,
    },
};
