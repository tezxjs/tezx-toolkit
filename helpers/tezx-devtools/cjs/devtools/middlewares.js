"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpMiddlewares = dumpMiddlewares;
const helper_1 = require("tezx/helper");
function detectRouteType(pathname, isOptional) {
    if (pathname.includes("*"))
        return "wildcard";
    if (pathname.includes(":"))
        return "dynamic params";
    if (isOptional)
        return "optional params";
    return "static";
}
function collectMiddlewares(node, basePath = "/") {
    const routes = [];
    const fullPath = (0, helper_1.sanitizePathSplit)("/", basePath).join("/");
    const routeType = detectRouteType(fullPath, node.isOptional);
    routes.push({
        type: routeType,
        pattern: `/${fullPath}`,
        appliedMiddlewares: Array.isArray(node.middlewares)
            ? node.middlewares.map((mw) => mw?.name || "anonymous")
            : Array.from(node.middlewares).map((mw) => mw?.name || "anonymous"),
    });
    for (const [childPath, childNode] of node.children.entries()) {
        const newPath = (0, helper_1.sanitizePathSplit)(basePath, childPath).join("/");
        routes.push(...collectMiddlewares(childNode, newPath));
    }
    return routes;
}
function dumpMiddlewares(TezX) {
    return collectMiddlewares(TezX.triMiddlewares);
}
