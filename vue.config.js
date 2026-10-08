const { defineConfig } = require("@vue/cli-service");
const webpack = require("webpack");
// Create WebSocket connection
// const socket = new WebSocket("ws://localhost:8080");

// // Listen for possible errors
// socket.addEventListener("error", (event) => {
//     console.log("WebSocket error: ", event);
// });

module.exports = defineConfig({
    productionSourceMap: false,
    // "transpileDependencies": [
    //     "vuetify",
    //     "vue-tel-input-vuetify"
    //   ]
    transpileDependencies: true,
    // devServer: {
    //     hot: true,
    //     watchOptions: {
    //         poll: 1000, // Use polling instead of WebSocket, every second
    //     },
    // },
    configureWebpack: {
        // Module concatenation (scope hoisting) causes "Unexpected end of JSON input"
        // with this webpack/vue-cli version combination — disabled as a workaround.
        optimization: { concatenateModules: false },
        plugins: [
            new webpack.DefinePlugin({
                // Vue 3.4+ expects this flag to be defined by the bundler for optimal tree-shaking.
                // Set to false so detailed hydration mismatch messages are excluded from the prod bundle.
                __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: "false",
            }),
        ],
    },
    chainWebpack: (config) => {
        config.plugin("html").tap((args) => {
            args[0].title = "Nevyzmojen";
            return args;
        });
    },
});
