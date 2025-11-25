import { Context, Middleware } from "tezx";
import { generateUUID } from "tezx/helper";

/**
 * Configuration object for initializing a GitHub OAuth client.
 */
export type GithubOauthClient = {
    /**
     * Your GitHub application's Client ID.
     *
     * This is available from your GitHub Developer Settings.
     * @example 'Iv1.0123456789abcdef'
     */
    clientId: string;

    /**
     * Your GitHub application's Client Secret.
     *
     * This value is used to securely exchange the authorization code for an access token.
     * @example 'abc123def456ghi789'
     */
    clientSecret: string;

    /**
     * The redirect URI where GitHub will send users after authentication.
     *
     * Must match the redirect URI registered in your GitHub OAuth app settings.
     * @example 'http://localhost:3000/auth/github/callback'
     */
    redirectUri: string;

};

/**
 * Parameters used to generate a GitHub OAuth authorization URL.
 */
type OAuthURLParams = {
    /**
     * The GitHub OAuth client configuration containing clientId, clientSecret, and redirectUri.
     */
    authClient: GithubOauthClient;

    /**
     * The scopes of access you are requesting from the user.
     *
     * Defaults to ['read:user', 'user:email'].
     * @example ['read:user', 'repo']
     */
    scopes?: string[];

    /**
     * An unguessable random string used to protect against cross-site request forgery (CSRF).
     *
     * This will be passed back by GitHub after authentication.
     * @example 'random-string-123'
     */
    state?: string;

    /**
     * Whether to allow GitHub sign-up on the login screen.
     *
     * Defaults to true if not set. Set to false to disable sign-up for new users.
     */
    allowSignup?: boolean;
};

export function getGithubOAuthURL<T extends Record<string, any> = {}, Path extends string = any>({
    authClient,
    scopes = ["read:user", "user:email"],
    state,
    allowSignup = true,
}: OAuthURLParams): Middleware<T, Path> {
    return (ctx: Context, next) => {
        const generatedState = state || `req-${generateUUID()}`;
        ctx.setHeader("state", generatedState);

        const scopeParam = encodeURIComponent(scopes.join(" "));
        const signupParam = allowSignup ? "true" : "false";

        const url =
            `https://github.com/login/oauth/authorize` +
            `?client_id=${authClient.clientId}` +
            `&redirect_uri=${encodeURIComponent(authClient.redirectUri)}` +
            `&scope=${scopeParam}` +
            `&state=${generatedState}` +
            `&allow_signup=${signupParam}`;

        ctx.github = { ...ctx.github, oauth_url: url };
        if (next) {
            return next();
        }
        return ctx.redirect(url);
    };
}

export function GitHubOauthClient(
    config: GithubOauthClient,
): GithubOauthClient {
    return config;
}
/**
 * Defines optional asynchronous callback functions
 * triggered during the OAuth authentication lifecycle.
 */
export type CallbacksReturn = {
    /**
     * Called after a user successfully signs in.
     *
     * Should return `true` to allow sign-in, or `false` to block access.
     *
     * @param user - The authenticated GitHub user.
     * @returns A Promise resolving to a boolean.
     */
    signIn?: (user: GithubUser) => Promise<boolean>;

    /**
     * Called when creating or updating the JWT token.
     *
     * Can be used to persist additional data in the token.
     *
     * @param token - The current token object.
     * @param user - The authenticated GitHub user (optional).
     * @returns A Promise resolving to a modified token.
     */
    jwt?: (token: any, user?: GithubUser) => Promise<any>;

    /**
     * Called when creating the session object sent to the client.
     *
     * Can be used to enrich the session with additional user data.
     *
     * @param session - The session object.
     * @param user - The authenticated GitHub user.
     * @returns A Promise resolving to a modified session.
     */
    session?: (session: any, user: GithubUser) => Promise<any>;
};

/**
 * A function that receives the current request context and
 * returns an object of optional OAuth lifecycle callbacks.
 *
 * @param ctx - The request context object.
 * @returns An object containing signIn, jwt, and/or session callbacks.
 */
export type Callbacks = (ctx: Context) => CallbacksReturn;

export type GithubUser = {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    user_view_type: string;
    site_admin: boolean;
    name: string;
    company: string;
    blog: string;
    location: string;
    email: string;
    hireable: string;
    bio: string;
    twitter_username: string;
    notification_email: string;
    public_repos: number;
    public_gists: number;
    followers: number;
    following: number;
    created_at: Date;
    updated_at: Date;
    private_gists: number;
    total_private_repos: number;
    owned_private_repos: number;
    disk_usage: number;
    collaborators: number;
    two_factor_authentication: boolean;
    plan: Plan;
};

declare module "tezx" {
    interface BaseContext<
        TPath extends string = any,
    > {
        github: {
            oauth_url: string;
            user?: GithubUser;
        }
    }
}

export interface Plan {
    name: string;
    space: number;
    collaborators: number;
    private_repos: number;
}

export type GitHubTokens = {
    access_token: string;
    token_type: "bearer";
    scope: string;
};
export function verifyGithubToken({
    authClient,
    onError,
    onSuccess,
    Callbacks,
}: {
    authClient: GithubOauthClient;
    onError?: (error: string, ctx: Context) => Promise<Response> | Response;
    onSuccess?: (tokens: GitHubTokens) => void | Promise<void>;
    Callbacks?: Callbacks;
}): Middleware<any> {
    return async (ctx: Context, next) => {
        try {
            const q = ctx.req.query;
            if (q?.error) {
                ctx.setStatus = 500;
                if (onError) return onError(q.error as string, ctx);
                throw new Error(q.error as string);
            }

            if (!q.code) {
                ctx.setStatus = 400;
                const msg = "Missing authorization code";
                if (onError) return onError(msg, ctx);
                throw new Error(msg);
            }

            // Step 1: Exchange code for access token
            const tokenRes = await fetch(
                "https://github.com/login/oauth/access_token",
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        client_id: authClient.clientId,
                        client_secret: authClient.clientSecret,
                        code: q.code,
                        redirect_uri: authClient.redirectUri,
                    }),
                },
            );

            const tokens: GitHubTokens = await tokenRes.json();
            if (!tokens.access_token) {
                throw new Error("Failed to get access token");
            }

            // Step 2: Fetch user profile using access token
            const userRes = await fetch("https://api.github.com/user", {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                    "User-Agent": "custom-oauth-client",
                },
            });
            const user: GithubUser = await userRes.json();
            // Optional: Fetch user email if not included
            if (!user.email) {
                const emailRes = await fetch("https://api.github.com/user/emails", {
                    headers: {
                        Authorization: `Bearer ${tokens.access_token}`,
                        "User-Agent": "custom-oauth-client",
                    },
                });
                const emails = await emailRes.json();
                const primaryEmail = emails.find((e: any) => e.primary && e.verified);
                user.email = primaryEmail?.email;
            }
            ctx.github = {
                ...ctx.github,
                user: user
            };

            const callback = Callbacks?.(ctx);
            if (callback?.signIn) {
                const allowed = await callback.signIn(user);
                if (!allowed) {
                    ctx.setStatus = 403;
                    if (onError) return onError("Sign-in rejected", ctx);
                    throw new Error("Sign-in rejected");
                }
            }

            let finalToken: any = tokens;
            if (callback?.jwt) {
                finalToken = await callback.jwt(tokens, user);
            }

            if (callback?.session) {
                const session = await callback.session({ token: finalToken }, user);
                ctx.session = session;
            }

            await onSuccess?.(tokens);
            return await next();
        } catch (error: any) {
            ctx.setStatus = 500;
            if (onError) return onError(error.message, ctx);
            throw new Error(error.message);
        }
    };
}

