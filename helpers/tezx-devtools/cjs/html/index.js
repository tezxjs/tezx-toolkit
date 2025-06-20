"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.html = html;
const cookies_js_1 = require("./cookies.js");
const env_js_1 = require("./env.js");
const middlewares_js_1 = require("./middlewares.js");
const routes_js_1 = require("./routes.js");
function html(ctx, app) {
    let tabDb = [
        {
            doc_title: "DevTools - Route Inspector",
            label: "Routes",
            tab: "routes",
            content: (0, routes_js_1.Routes)(ctx, app),
        },
        {
            doc_title: "DevTools - Middleware Inspector",
            label: "Middlewares",
            tab: "middleware",
            content: (0, middlewares_js_1.Middlewares)(ctx, app),
        },
        {
            tab: "cookies",
            label: "Cookies",
            doc_title: "DevTools - Cookie Inspector",
            content: (0, cookies_js_1.CookiesInspector)(ctx),
        },
        {
            tab: ".env",
            label: "Environment",
            doc_title: "DevTools - Environment",
            content: (0, env_js_1.EnvInspector)(ctx),
        },
    ];
    return tabDb;
}
