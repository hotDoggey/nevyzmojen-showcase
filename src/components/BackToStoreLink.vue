<template>
    <v-row>
        <!-- router link to the store -->
        <router-link to="/store" class="back-to-store-link pl-4 pl-md-8 pt--4 pt-md-0">
            <!-- Back Arrow Icon -->
            <font-awesome-icon icon="fa-solid fa-arrow-left" class="back-arrow-icon mr-4" />

            <!-- Back to Store Text -->
            <span class="back-to-store-text">{{ $t("back_to_store_link") }}</span>
        </router-link>
    </v-row>
</template>

<script>
export default {
    name: "BackToStoreRow",
};
</script>

<style scoped>
.back-to-store-link {
    height: var(--back-to-store-link-height);
    max-height: var(--back-to-store-link-height);
    box-sizing: border-box;
    display: flex;
    align-items: center; /* Vertically center the items  */
    font-weight: 600;
    font-size: 1.125rem;
}

.back-to-store-link:hover {
    text-decoration: underline;
}

.back-arrow-icon {
    transition: transform 0.3s ease; /* Smooth animation when moving */
}

.back-to-store-link:hover .back-arrow-icon {
    transform: translateX(-0.25rem); /* Move arrow to the left on hover */
}
</style>
