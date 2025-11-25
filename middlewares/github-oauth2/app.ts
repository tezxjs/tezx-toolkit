import { TezX } from "tezx";
import { logger } from "tezx/middleware/logger";
import { getGithubOAuthURL, GitHubOauthClient, verifyGithubToken } from "./src/index.js";

const app = new TezX({
    debugMode: true,
});
app.use([logger()]);

// app.get("/", (ctx) => {
//     return ctx.redirect("/index.html");
// });

// 1. Initialize OAuth2 client
const client = GitHubOauthClient({
    clientId: "981f90254c4d3279f224",
    clientSecret: "7fb7bff7cdbdf545d89de943d3a953d2302e8772",
    redirectUri: 'http://localhost:3000'
});

// Step 1: Redirect user to GitHub login
app.get('github', getGithubOAuthURL({
    authClient: client,
}), (ctx) => {
    return ctx.redirect(ctx.github.oauth_url);
});

// Step 2: Verify GitHub token and handle user session
app.get('/', verifyGithubToken({
    authClient: client,
    Callbacks: (ctx) => {
        return {
            session: async (session, user) => {
                console.log('Session:', session);
                console.log('User:', user);
                return session;
            }
        };
    }
}), async (ctx) => {
    return ctx.json({ success: true });
});

// Use for node
// nodeAdapter(app).listen(3001, (message) => {
//     console.log(message)
// })
// use it for bun
Bun.serve({
    port: 3001,
    fetch: app.serve
})
console.log("PORT:3001")

// use it for deno

// denoAdapter(app).listen(3001, (message) => {
//     console.log(message)
// })


