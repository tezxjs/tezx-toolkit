import { getGithubOAuthURL, GitHubOauthClient, verifyGithubToken } from "@tezx/github-oauth2";
import { TezX } from "tezx";
import { nodeAdapter } from "tezx/adapter";
import { loadEnv } from "tezx/helper";
import { logger } from "tezx/middleware";

const env = loadEnv();

const app = new TezX({
    debugMode: true,

});
app.use([logger()]);

app.static("/", "./static");

// app.get("/", (ctx) => {
//     return ctx.redirect("/index.html");
// });

// 1. Initialize OAuth2 client
const client = GitHubOauthClient({
    clientId: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    redirectUri: 'http://localhost:3000'
});

// Step 1: Redirect user to GitHub login
app.get('github', getGithubOAuthURL({
    authClient: client,
}), (ctx) => {
    return ctx.redirect(ctx.state.get('github_oauth_url'));
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
nodeAdapter(app).listen(3002)

// use it for deno

// denoAdapter(app).listen(3001, (message) => {
//     console.log(message)
// })


