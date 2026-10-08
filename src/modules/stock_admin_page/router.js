const Module = () => import("./Module.vue");
const StockAdminPage = () => import("./views/StockAdminPage.vue");

const moduleRoute = {
    path: "/stock",
    component: Module,
    children: [
        { name: "stock_admin", path: "/stock", component: StockAdminPage },
    ],
};

export default (router) => {
    router.addRoute(moduleRoute);
};
