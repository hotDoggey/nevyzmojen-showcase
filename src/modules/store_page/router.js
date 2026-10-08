const debug = 0;
import store from "@/store";
const Module = () => import("./Module.vue");
const StorePage = () => import("./views/StorePage.vue");
const ProductPage = () => import("./views/ProductPage.vue");
const NotFound404 = () => import("@/components/NotFound404.vue");

const moduleRoute = {
    path: "/store",
    component: Module,
    children: [
        { name: "store", path: "/store", component: StorePage },
        {
            name: "productPage",
            path: "/store/:id",
            component: ProductPage,
            props: true,
        },
        // 404 path to redirect to
        // {
        //     path: "store/notFound404",
        //     name: "notFound404",
        //     component: NotFound404,
        // },
    ],
};

export default (router) => {
    router.addRoute(moduleRoute);
};
