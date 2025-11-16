"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleOauthClient = GoogleOauthClient;
exports.getGoogleOAuthURL = getGoogleOAuthURL;
exports.verifyGoogleToken = verifyGoogleToken;
const oauth2_1 = require("@googleapis/oauth2");
const helper_1 = require("tezx/helper");
function GoogleOauthClient(config) {
    const { clientId, clientSecret, redirectUri } = config;
    const oauth2Client = new oauth2_1.auth.OAuth2(clientId, clientSecret, redirectUri);
    return oauth2Client;
}
function getGoogleOAuthURL({ scopes = ["openid", "email", "profile"], authClient, state, loginHint, prompt = "consent select_account", accessType = "offline", includeGrantedScopes = true, }) {
    return (ctx, next) => {
        let s = state || `req-${(0, helper_1.generateID)()}`;
        ctx.setHeader("state", s);
        const url = authClient.generateAuthUrl({
            access_type: accessType,
            scope: scopes,
            state: s,
            login_hint: loginHint,
            prompt,
            include_granted_scopes: includeGrantedScopes,
        });
        ctx.google = { ...ctx.google, oauth_url: url };
        if (next) {
            return next();
        }
        return ctx.redirect(url);
    };
}
function verifyGoogleToken({ authClient, onError, Callbacks, onSuccess, }) {
    return async (ctx, next) => {
        try {
            const q = ctx.req.query;
            if (q?.error) {
                ctx.setStatus = 500;
                if (onError) {
                    return onError(q.error, ctx);
                }
                throw new Error(q.error);
            }
            if (!q.code) {
                ctx.setStatus = 500;
                if (onError) {
                    return onError("Missing authorization code", ctx);
                }
                throw new Error("Missing authorization code");
            }
            else {
                const { tokens, res: gaxiosResponse } = await authClient.getToken(decodeURIComponent(q.code));
                authClient.setCredentials(tokens);
                const idToken = tokens?.id_token;
                const tokenRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
                const user = await tokenRes.json();
                if (user.aud !== authClient?._clientId) {
                    throw new Error("Invalid client ID");
                }
                ctx.google = {
                    ...ctx.google,
                    user: user
                };
                let callback = Callbacks?.(ctx);
                if (callback?.signIn) {
                    const allowed = await callback.signIn(user);
                    if (!allowed) {
                        ctx.setStatus = 500;
                        if (onError) {
                            return onError("Sign-in rejected", ctx);
                        }
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
                await onSuccess?.(finalToken, gaxiosResponse);
                return await next();
            }
        }
        catch (error) {
            ctx.setStatus = 500;
            if (onError) {
                return onError(error.message, ctx);
            }
            throw new Error(error?.message);
        }
    };
}
