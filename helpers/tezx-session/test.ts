import { TezX } from "tezx";
import { SessionManager } from "@tezx/session";
import { logger } from "tezx/middleware";

const app = new TezX();
app.use(logger())
const sessionManager = new SessionManager({
    sessionName: "tezx.sid",
    cookie: { maxAge: 1000 * 60 * 30, httpOnly: true, secure: true, sameSite: "Lax" },
});

// Load session before routes
app.use(sessionManager.useSession());

// Login route → create session
app.post("/login", async (ctx) => {
    await sessionManager.createSession({ userId: 99, role: "admin" }, ctx);
    return ctx.json({ success: true });
});

// Protected route → read session
app.get("/profile", (ctx) => {
    return ctx.json({ session: ctx.session?.data });
});

// Logout → destroy session
app.post("/logout", async (ctx) => {
    await ctx.session?.destroy();
    return ctx.json({ loggedOut: true });
});
