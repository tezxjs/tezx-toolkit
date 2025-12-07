import { TezX } from "tezx";
import { authorize, plugin } from './src/index';

const matrix = {
  admin: [
    'user:create', 'user:update', 'user:delete',
    'order:read', 'order:delete', 'property:approve'
  ],
  editor: ['user:update', 'property:read'],
  viewer: ['property:read'],
  user: ['user:update'],
  guest: []
};


// 'create', 'update', 'delete', 'view'


// const roleHierarchy = {
//   admin: ['editor', 'viewer'],
//   editor: ['viewer'],
//   viewer: [],
// };

const app = new TezX({
  // Additional options
});
app.use((ctx, next) => {
  ctx.user = { role: 'admin' }
  return next();
})

type MyPermissions = ['user:create', 'user:delete', 'order:read'];

app.use(plugin<MyPermissions>({
  isAuthorized(role, permissions, ctx) {
    console.log(role)
    return true;
  },
  loadPermissions: (ctx) => {
    return {
      'admin': ["order:read", "user:delete", "order:read",]
    }
  }
}))

// type SplitColon<T extends string> =
//   T extends `${infer _Left}:${infer Right}` ? Right : never;

// function x<T extends string>(p: T) {
//   type Key = SplitColon<T>; // compile-time right part after :
//   const key = p.split(':')[1] as Key;

//   return {
//     [key]: '35534',
//   } as Record<Key, string>;
// }
// const result = x('user:create');
// // result: { create: '35534' }
// console.log(result.create)

// // 🔹 Required types
// type ExtractParam<Path extends string> =
//   Path extends `${infer _Start}:${infer Param}/${infer Rest}`
//   ? Param extends `${infer Name}?`
//   ? { [K in Name]?: string } & ExtractParam<`/${Rest}`>
//   : { [K in Param]: string } & ExtractParam<`/${Rest}`>
//   : Path extends `${infer _Start}:${infer Param}`
//   ? Param extends `${infer Name}?`
//   ? { [K in Name]?: string }
//   : { [K in Param]: string }
//   : {};

// // 🔹 Wildcard support
// type ExtractWildcard<Path extends string> =
//   Path extends `${string}*${infer Wildcard}`
//   ? Wildcard extends ""
//   ? { "*": string }
//   : { [K in Wildcard]: string }
//   : {};

// // 🔹 Combined type
// type ExtractRouteParams<Path extends string> =
//   ExtractParam<Path> & ExtractWildcard<Path>;


// function getParams<Path extends string>(path: Path, actual: string): ExtractRouteParams<Path> {
//   // Actual runtime extractor here if needed
//   return {} as any;
// }

// console.log(getParams('/test/:hello/:rakib?/*hellof', ''))
// Hover over result — you'll see type: { create: string }

// app.get('/posts/delete', authorize(rbac, 'post', 'delete'), async (ctx) => {
//   ctx.body = 'Post deleted';
// });


// console.log(isAuthorized('admin', 'delete', "order"))

// app.use(allowRoles(['admin',]));

app.get('/', authorize<MyPermissions>('hello'), (ctx) => {
  console.log(ctx?.user?.permissions)
  return ctx.json({ method: ctx.method, permission: ctx?.user?.permissions })
})

Bun.serve({
  fetch: app.serve
})
console.log("🚀 TezX running on http://localhost:3000");