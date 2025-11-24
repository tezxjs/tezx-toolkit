"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.html = html;
const cookies_js_1 = require("./cookies.js");
const routes_js_1 = require("./routes.js");
const StaticFile_js_1 = require("./StaticFile.js");
function html(ctx, app) {
    let tabDb = [
        {
            doc_title: "DevTools - Route Inspector",
            label: "Routes",
            tab: "routes",
            content: (0, routes_js_1.Routes)(ctx, app),
        },
        {
            doc_title: "Static File",
            label: "Static File",
            tab: "static-file",
            content: (0, StaticFile_js_1.StaticFile)(ctx, app),
        },
        {
            tab: "cookies",
            label: "Cookies",
            doc_title: "DevTools - Cookie Inspector",
            content: (0, cookies_js_1.CookiesInspector)(ctx),
        },
    ];
    return tabDb;
}
