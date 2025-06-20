import { getGoogleOAuthURL, GoogleOauthClient, verifyGoogleToken } from "@tezx/google-oauth2";
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
const client = GoogleOauthClient({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    redirectUri: 'http://localhost:3000/auth/callback',
});

// 2. Route to start Google login
app.get('/auth/google', getGoogleOAuthURL({
    authClient: client,
    scopes: ['openid', 'email', 'profile'],
}), (ctx) => {
    return ctx.redirect(ctx.state.get('google'));
});

// 3. Callback route, verify token and establish session
app.get('/auth/callback', verifyGoogleToken({
    authClient: client,
    onError: (err, ctx) => {
        console.error('OAuth Error:', err);
        return ctx.json({ success: false, message: err })
    },
    onSuccess: (tokens) => {
        console.log('Tokens:', tokens);
    },
    Callbacks: (ctx) => {
        return {
            signIn: async (user) => {
                // e.g. allow only users from a domain
                return user.email.endsWith('@yourcompany.com');
            },
            jwt: async (token, user) => {
                // attach roles or custom claims
                token.role = user?.email_verified ? 'member' : 'guest';
                return token;
            },
            session: async (session, user) => {
                // persist user profile in session
                session.user = {
                    id: user.sub,
                    email: user.email,
                    name: user.name,
                    picture: user.picture
                };
                return session;
            }
        }
    }
}), async (ctx) => {
    // Now ctx.session is populated
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


