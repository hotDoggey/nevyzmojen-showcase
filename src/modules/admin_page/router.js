const Module = () => import("./Module.vue");
const AdminPage = () => import("./views/AdminPage.vue");

const moduleRoute = {
    path: "/admin",
    component: Module,
    children: [
        { name: "admin", path: "/admin", component: AdminPage },
    ],
};

export default (router) => {
    router.addRoute(moduleRoute);
};
