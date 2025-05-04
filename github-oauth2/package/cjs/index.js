"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGithubOAuthURL = getGithubOAuthURL;
exports.GitHubOauthClient = GitHubOauthClient;
exports.verifyGithubToken = verifyGithubToken;
const helper_1 = require("tezx/helper");
function getGithubOAuthURL({ authClient, scopes = ['read:user', 'user:email'], state, allowSignup = true, }) {
    return (ctx, next) => {
        const generatedState = state || `req-${(0, helper_1.generateID)()}`;
        ctx.header('state', generatedState);
        const scopeParam = encodeURIComponent(scopes.join(' '));
        const signupParam = allowSignup ? 'true' : 'false';
        const url = `https://github.com/login/oauth/authorize` +
            `?client_id=${authClient.clientId}` +
            `&redirect_uri=${encodeURIComponent(authClient.redirectUri)}` +
            `&scope=${scopeParam}` +
            `&state=${generatedState}` +
            `&allow_signup=${signupParam}`;
        ctx.state.set('github_oauth_url', url);
        if (next) {
            return next();
        }
        return ctx.redirect(url);
    };
}
function GitHubOauthClient(config) {
    return config;
}
function verifyGithubToken({ authClient, onError, onSuccess, Callbacks, }) {
    return async (ctx, next) => {
        try {
            const q = ctx.req.query;
            if (q?.error) {
                ctx.setStatus = 500;
                if (onError)
                    return onError(q.error, ctx);
                throw new Error(q.error);
            }
            if (!q.code) {
                ctx.setStatus = 400;
                const msg = "Missing authorization code";
                if (onError)
                    return onError(msg, ctx);
                throw new Error(msg);
            }
            const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_id: authClient.clientId,
                    client_secret: authClient.clientSecret,
                    code: q.code,
                    redirect_uri: authClient.redirectUri,
                }),
            });
            const tokens = await tokenRes.json();
            if (!tokens.access_token) {
                throw new Error("Failed to get access token");
            }
            const userRes = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                    'User-Agent': 'custom-oauth-client',
                },
            });
            const user = await userRes.json();
            if (!user.email) {
                const emailRes = await fetch('https://api.github.com/user/emails', {
                    headers: {
                        Authorization: `Bearer ${tokens.access_token}`,
                        'User-Agent': 'custom-oauth-client',
                    },
                });
                const emails = await emailRes.json();
                const primaryEmail = emails.find((e) => e.primary && e.verified);
                user.email = primaryEmail?.email;
            }
            ctx.state.set('user', user);
            const callback = Callbacks?.(ctx);
            if (callback?.signIn) {
                const allowed = await callback.signIn(user);
                if (!allowed) {
                    ctx.setStatus = 403;
                    if (onError)
                        return onError("Sign-in rejected", ctx);
                    throw new Error("Sign-in rejected");
                }
            }
            let finalToken = tokens;
            if (callback?.jwt) {
                finalToken = await callback.jwt(tokens, user);
            }
            if (callback?.session) {
                const session = await callback.session({ token: finalToken }, user);
                ctx.session = session;
            }
            await onSuccess?.(tokens);
            return await next();
        }
        catch (error) {
            ctx.setStatus = 500;
            if (onError)
                return onError(error.message, ctx);
            throw new Error(error.message);
        }
    };
}
