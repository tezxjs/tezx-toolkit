import { TezX } from "tezx";
import { logger } from "tezx/middleware/logger";
import { loadEnv } from "tezx/node";
import { createRotatingFileStorage, profiler } from "./src/index.ts";
const app = new TezX({
    env: loadEnv(),
    // debugMode: true,
    // Additional options
});
app.use(profiler({
    // route: '/_',
    storage: createRotatingFileStorage('test.json', 5453),
    metrics: ["time", "memory", "cpu"]
}))
app.use([logger()]);

const routes = [
    { path: '/api/users', handler: ctx => ctx.json({ users: [] }) },
    { path: '/api/users/:id', handler: ctx => ctx.json({ userId: ctx.req.params.id }) },
    { path: '/api/products', handler: ctx => ctx.json({ products: [] }) },
    { path: '/api/products/:id', handler: ctx => ctx.json({ productId: ctx.req.params.id }) },
    { path: '/api/orders', handler: ctx => ctx.json({ orders: [] }) },
    { path: '/api/orders/:id', handler: ctx => ctx.json({ orderId: ctx.req.params.id }) },
    { path: '/api/categories', handler: ctx => ctx.json({ categories: [] }) },
    { path: '/api/categories/:id', handler: ctx => ctx.json({ categoryId: ctx.req.params.id }) },
    { path: '/api/auth/login', handler: ctx => ctx.json({ token: 'dummy-token' }) },
    { path: '/api/auth/logout', handler: ctx => ctx.json({ message: 'Logged out' }) },
    { path: '/api/profile', handler: ctx => ctx.json({ profile: {} }) },
    { path: '/api/settings', handler: ctx => ctx.json({ settings: {} }) },
    { path: '/api/notifications', handler: ctx => ctx.json({ notifications: [] }) },
    { path: '/api/notifications/:id', handler: ctx => ctx.json({ notificationId: ctx.req.params.id }) },
    { path: '/api/dashboard/stats', handler: ctx => ctx.json({ stats: {} }) },
    { path: '/api/dashboard/activity', handler: ctx => ctx.json({ activities: [] }) },
    { path: '/api/reports/sales', handler: ctx => ctx.json({ report: 'sales' }) },
    { path: '/api/reports/traffic', handler: ctx => ctx.json({ report: 'traffic' }) },
    { path: '/api/health', handler: ctx => ctx.json({ status: 'ok' }) },
    { path: '/api/version', handler: ctx => ctx.json({ version: '1.0.0' }) },
];
routes.forEach(({ path, handler }) => app.get(path, handler));

Bun.serve({
    port: 3001,
    reusePort: true, // Enables clustering support
    fetch(req, server) {
        return app.serve(req, server); // TezX handles the request
    },
    websocket: {
        open(ws) {
            console.log("WebSocket connected");
            return (ws.data as any)?.open?.(ws);
        },
        message(ws, msg) {
            return (ws.data as any)?.message?.(ws, msg);
        },
        close(ws, code, reason) {
            return (ws.data as any)?.close?.(ws, { code, reason });
        },
        ping(ws, data) {
            return (ws.data as any)?.ping?.(ws, data);
        },
        pong(ws, data) {
            return (ws.data as any)?.pong?.(ws, data);
        },
        drain(ws) {
            return (ws.data as any)?.drain?.(ws);
        },
    },
});

console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);