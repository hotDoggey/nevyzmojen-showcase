const debug = 0;
const Module = () => import("./Module.vue");
const Page = () => import("./views/ThemePackPage.vue");

const moduleRoute = {
    path: "/theme-pack",
    component: Module,
    children: [
        /* fk me! the below path in the children should be idek what, ig the whole path starting from first /slash */
        { name: "theme-pack", path: "/theme-pack", component: Page },
    ],
};

export default (router) => {
    router.addRoute(moduleRoute);
};
