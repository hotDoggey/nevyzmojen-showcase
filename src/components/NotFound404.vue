<template>
    <!-- had to wrap the below in a single div to create a single root component, prevents warning message: Extraneous non-props attributes (class) were passed to component -->
    <div>
        <h2>404</h2>
        <h3 class="page-title">{{ $t("page_not_found_title") }}</h3>
        <div v-if="isNotFound">
            <div>
                {{
                    $t("product_not_found_text") ||
                    "Product you searched for doesn't exist. Please visit the store to view our whole collection."
                }}
            </div>
            <router-link class="link" to="/store"> {{ $t("store") }} </router-link>
        </div>
        <div v-else>
            {{
                $t("you_seem_lost_404_text") ||
                "You seem a little lost, please find your way back Home by clicking"
            }}
            <router-link class="link" to="/about">{{ $t("here") }}</router-link
            >.
        </div>
    </div>
</template>

<script>
export default {
    computed: {
        isNotFound() {
            // Access the 'catchAll' route param and check if it's 'not-found'
            return this.$route.params.catchAll === "product-not-found";
        },
    },
};
</script>

<style>
.link {
    color: blue;
    text-decoration: underline;
    cursor: pointer;
    font-weight: bold;
}
.page-title {
    font-size: 2rem;
    margin-bottom: 1rem;
}
</style>
