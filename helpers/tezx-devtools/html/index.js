import { CookiesInspector } from "./cookies.js";
import { EnvInspector } from "./env.js";
import { Middlewares } from "./middlewares.js";
import { Routes } from "./routes.js";
export function html(ctx, app) {
    let tabDb = [
        {
            doc_title: "DevTools - Route Inspector",
            label: "Routes",
            tab: "routes",
            content: Routes(ctx, app),
        },
        {
            doc_title: "DevTools - Middleware Inspector",
            label: "Middlewares",
            tab: "middleware",
            content: Middlewares(ctx, app),
        },
        {
            tab: "cookies",
            label: "Cookies",
            doc_title: "DevTools - Cookie Inspector",
            content: CookiesInspector(ctx),
        },
        {
            tab: ".env",
            label: "Environment",
            doc_title: "DevTools - Environment",
            content: EnvInspector(ctx),
        },
    ];
    return tabDb;
}
