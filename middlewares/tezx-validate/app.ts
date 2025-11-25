import { TezX } from "tezx";
import { z } from "zod";
import { validate } from "./src/index";

const app = new TezX({
  debugMode: true,
});

const schema = z.object({
  name: z.string(),
  age: z.string()
});
// Usage
app.use(validate({
  source: 'query',
  adapter: {
    validate: (data: any) => schema.parse(data)
  }
}));


// 'create', 'update', 'delete', 'view'


// const roleHierarchy = {
//   admin: ['editor', 'viewer'],
//   editor: ['viewer'],
//   viewer: [],
// };

app.use((ctx, next) => {
  ctx.user = { role: 'admin' }
  return next();
})

type MyPermissions = ['user:create', 'user:delete', 'order:read'];



app.get('/', (ctx) => {
  return ctx.json(ctx?.validated)
})

Bun.serve({
  fetch: app.serve
})
console.log("🚀 TezX running on http://localhost:3000");