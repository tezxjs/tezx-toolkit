import { Context, Middleware } from "tezx";
export type GithubOauthClient = {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
};
type OAuthURLParams = {
    authClient: GithubOauthClient;
    scopes?: string[];
    state?: string;
    allowSignup?: boolean;
};
export declare function getGithubOAuthURL<T extends Record<string, any> = {}, Path extends string = any>({ authClient, scopes, state, allowSignup, }: OAuthURLParams): Middleware<T, Path>;
export declare function GitHubOauthClient(config: GithubOauthClient): GithubOauthClient;
export type CallbacksReturn = {
    signIn?: (user: GithubUser) => Promise<boolean>;
    jwt?: (token: any, user?: GithubUser) => Promise<any>;
    session?: (session: any, user: GithubUser) => Promise<any>;
};
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
    interface BaseContext<T extends Record<string, any> = {}, Path extends string = any> {
        github: {
            oauth_url: string;
            user?: GithubUser;
        };
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
export declare function verifyGithubToken({ authClient, onError, onSuccess, Callbacks, }: {
    authClient: GithubOauthClient;
    onError?: (error: string, ctx: Context) => Promise<Response> | Response;
    onSuccess?: (tokens: GitHubTokens) => void | Promise<void>;
    Callbacks?: Callbacks;
}): Middleware<any>;
export {};
