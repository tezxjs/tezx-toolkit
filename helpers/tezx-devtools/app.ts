import { Router, TezX } from "tezx";
import { serveStatic } from "tezx/static";
import { cors, } from "tezx/middleware/cors";
import { logger } from "tezx/middleware/logger";

import DevTools from "./src/index.js";
import requestID from "tezx/middleware/request-id";

export const app = new TezX({
  debugMode: true,
  // basePath: 'v1',
});
app.use([logger()]);
app.get("/", (ctx) => {
  return ctx.json({});
});
app.use(
  cors({
    origin: ["http://localhost:5500"],
  }),
);
app.static(serveStatic("."))
app.use("/xx", [
  async (ctx, next) => {
    console.log("Middleware 1");
    await next();
  },
  async (ctx, next) => {
    console.log("Middleware 2");
    return next();
  },
]);
app.use([
  requestID(),
  async (ctx, next) => {
    return next();
  },
]);
app.use("/xxxxxxxxxxxxxxxxxxxxxxxxxx/:rakib?", async function rakib(ctx, next) {
  next();
});
app.use("/xxxxxxxxxxxxxxxxxxxxxxxxx/:rakib", async function rakib(ctx, next) {
  next();
});
app.use("/fdg/:rakib/*", async function rakib(ctx, next) {
  next();
});
app.get("/:rakib/:xxx?/test", async (ctx) => {
  return ctx.json(ctx.req.params);
});

app.get("/contact", async (ctx) => {
  return ctx.json({})
})
app.get("/test/xxx/fff", async (ctx) => {
  return ctx.json(ctx.req.params);
});

app.delete(
  "/delete/",
  function test(ctx, next) {
    return next();
  },
  async (ctx) => {
    return ctx.json(ctx.req.params);
  },
);
let x = new Router();
x.use("/", function router(ctx, next) {
  return next();
});
x.get(
  "/test/*test",
  function xxxx(ctx, next) {
    return next();
  },
  async (ctx) => {
    return ctx.json({});
  },
);

app.use("/", x);

app.get(
  "/devtools",
  DevTools(app, {
    enable: true
  }),
);
// app.list();
// console.log(router)
Bun.serve({
  port: 3001,
  fetch: app.serve
})