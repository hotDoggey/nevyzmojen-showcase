<template>
    <div class="admin-page">
        <h1 class="admin-title">{{ $t("admin_page_title") }}</h1>

        <div class="admin-nav">
            <v-btn
                variant="outlined"
                class="admin-nav-btn"
                :to="{ name: 'authed_orders' }"
            >
                {{ $t("admin_orders_nav") }}
            </v-btn>
            <v-btn
                variant="outlined"
                class="admin-nav-btn"
                :to="{ name: 'stock_admin' }"
            >
                {{ $t("stock_nav") }}
            </v-btn>
        </div>
    </div>
</template>

<script>
export default {};
</script>

<style scoped>
.admin-page {
    padding: 2rem 2rem 4rem;
}
.admin-title {
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 1.75rem;
}
.admin-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}
.admin-nav-btn {
    text-transform: none;
    letter-spacing: 0;
    font-weight: 500;
}
</style>
