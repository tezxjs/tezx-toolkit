import { Context, Middleware } from 'tezx';
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
export declare function getGithubOAuthURL({ authClient, scopes, state, allowSignup, }: OAuthURLParams): Middleware<any>;
export declare function GitHubOauthClient(config: GithubOauthClient): GithubOauthClient;
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
export interface Plan {
    name: string;
    space: number;
    collaborators: number;
    private_repos: number;
}
export type GitHubTokens = {
    access_token: string;
    token_type: 'bearer';
    scope: string;
};
export declare function verifyGithubToken({ authClient, onError, onSuccess, Callbacks, }: {
    authClient: GithubOauthClient;
    onError?: (error: string, ctx: Context) => Promise<Response> | Response;
    onSuccess?: (tokens: GitHubTokens) => void | Promise<void>;
    Callbacks?: Callbacks;
}): Middleware<any>;
export {};
