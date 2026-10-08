const debug = 0;
const Module = () => import("./Module.vue");
const LoginPage = () => import("./views/LoginPage.vue");
const AccountPage = () => import("./views/AccountPage.vue");
const SignupPage = () => import("./views/SignupPage.vue");

const loginModuleRoute = {
    path: "/",
    component: Module,
    children: [
        /* fk me! the below path in the children should be idek what, ig the whole path starting from first /slash */
        { name: "login", path: "/login", component: LoginPage },
        { name: "account", path: "/account", component: AccountPage },
        { name: "signup", path: "/signup", component: SignupPage },
    ],
};

export default (router) => {
    router.addRoute(loginModuleRoute);
};
