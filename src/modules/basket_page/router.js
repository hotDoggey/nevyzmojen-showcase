const debug = 0;
const Module = () => import("./Module.vue");
const BasketPage = () => import("./views/BasketPage.vue");

const moduleRoute = {
    path: "/",
    component: Module,
    children: [
        /* if path starts with a / it will indicate to the router that its from the lowest level and not treated as relative */
        { name: "basket", path: "basket", component: BasketPage, meta: { fullWidth: false } },
        {
            name: "checkout",
            path: "checkout",
            component: () => import("./views/CheckOutPage.vue"),
            meta: { fullWidth: true },
        },
        {
            name: "guest_signup",
            path: "guest_signup",
            component: () => import("./views/GuestSignUpPage.vue"),
        },
        // { name: "return", path: "return", component: () => import("./views/xxxReturnPage.vue") },
    ],
};

export default (router) => {
    router.addRoute(moduleRoute);
};
