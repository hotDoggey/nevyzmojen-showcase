const debug = 0;
const Module = () => import("./Module.vue");
const authed_OrdersPage = () => import("./views/AuthedOrdersPage.vue");
import store from "@/store.js"; // Import the Vuex store

const moduleRoute = {
    path: "/authed_orders",
    component: Module,
    children: [
        /* fk me! the below path in the children should be idek what, ig the whole path starting from first /slash */
        {
            name: "authed_orders",
            path: "/authed_orders",
            component: authed_OrdersPage,
        },
    ],
};

export default (router) => {
    router.addRoute(moduleRoute);
};
