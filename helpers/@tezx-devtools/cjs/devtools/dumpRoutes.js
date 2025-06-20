"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpRoutes = dumpRoutes;
const helper_1 = require("tezx/helper");
function collectRoutes(node, basePath = "/") {
    const routes = [];
    let fullPath = basePath;
    if (node.isParam && node.paramName) {
        fullPath = `${basePath.replace(/\/+$/, "")}${node.paramName}`;
    }
    const pathname = (0, helper_1.sanitizePathSplit)("/", fullPath).join("/");
    for (const [method, handler] of node.handlers.entries()) {
        routes.push({
            method,
            endpoint: node.pathname,
            pattern: `/${pathname}`,
            appliedMiddlewares: [...(handler?.middlewares || [])].map((r) => r?.name || "anonymous"),
        });
    }
    for (const [childPath, childNode] of node.children.entries()) {
        const newPath = (0, helper_1.sanitizePathSplit)(fullPath, childPath).join("/");
        routes.push(...collectRoutes(childNode, newPath));
    }
    return routes;
}
function dumpRoutes(TezX) {
    let app = TezX;
    const triRoutes = collectRoutes(app.triRouter);
    const staticRoutes = [];
    for (const [path, handlers] of app.routers) {
        for (const [method, handler] of handlers) {
            staticRoutes.push({
                endpoint: `/${path}`,
                pattern: `/${path}`,
                method,
                appliedMiddlewares: [...(handler?.middlewares || [])].map((r) => r?.name || "anonymous"),
            });
        }
    }
    return [...triRoutes, ...staticRoutes];
}
