import { TezX } from "tezx";
import { logger } from "tezx/middleware";
import {
    SessionManager
} from "./src/index.js";

const app = new TezX({
});

let x = new SessionManager<{ userId: number }>({
    sessionName: "tezx",
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 30 // 30 min
    }
})

app.use([logger()]);

app.get('/', x.useSession(), async (ctx) => {
    await x.createSession({ userId: 5345, name: 534 }, ctx)
    ctx.session!.data.userId = 353453
    return ctx.json(ctx.session?.data || {})
})

Bun.serve({
    fetch: app.serve
})
console.log("🚀 TezX running on http://localhost:3000");