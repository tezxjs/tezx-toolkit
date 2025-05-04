import { OAuth2Client } from 'googleapis-common';
import { Context, Middleware } from 'tezx';
/**
 * Configuration object for setting up Google OAuth2 authentication.
 *
 * This object is used to initialize the OAuth2 client with the necessary credentials
 * for integrating with Google OAuth services.
 */
export type GoogleOauthConfig = {
    /**
     * The client ID provided by Google when registering your application in the Google Developer Console.
     * This is a unique identifier for your app and is used to identify the app during the OAuth flow.
     *
     * @example '1234567890-abcdefg.apps.googleusercontent.com'
     */
    clientId: string;
    /**
     * The client secret provided by Google when registering your application in the Google Developer Console.
     * This is a confidential string used to verify the authenticity of the application during OAuth authentication.
     *
     * @example 'YOUR_CLIENT_SECRET'
     */
    clientSecret: string;
    /**
     * The redirect URI that Google will redirect the user to after they grant or deny permissions during OAuth authentication.
     * This URI must be the same as the one registered in the Google Developer Console.
     *
     * @example 'http://localhost:3000/auth/callback'
     */
    redirectUri: string;
};
/**
 * Creates a Google OAuth2 client with the provided configuration.
 * @param {GoogleOauthConfig} config - The configuration for the Google OAuth2 client.
 * @returns {OAuth2Client} The configured OAuth2 client.
 */
export declare function GoogleOauthClient(config: GoogleOauthConfig): OAuth2Client;
type OAuthURLParams = {
    authClient: OAuth2Client;
    scopes?: string[];
    state?: string;
    loginHint?: string;
    prompt?: string;
    accessType?: 'online' | 'offline';
    includeGrantedScopes?: boolean;
};
/**
 * Generates the Google OAuth URL for user authentication.
 * @param {OAuthURLParams} params - The parameters for generating the OAuth URL.
 * @returns {Middleware<any>} Middleware that redirects to the OAuth URL.
 */
export declare function getGoogleOAuthURL({ scopes, authClient, loginHint, prompt, accessType, includeGrantedScopes, }: OAuthURLParams): Middleware<any>;
export type User = {
    id: string;
    email: string;
    email_verified: boolean;
    name?: string;
    first_name?: string;
    last_name?: string;
    picture?: string;
    locale?: string;
    role?: string;
    phone_number?: string;
    phone_number_verified?: boolean;
    gender?: string;
    date_of_birth?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    };
    is_active?: boolean;
    last_login?: string;
    sign_up_date?: string;
    updated_at?: string;
    account_type?: string;
    subscriptions?: Array<string>;
    preferences?: {
        theme?: string;
        language?: string;
    };
    social_links?: {
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
    };
    two_factor_enabled?: boolean;
    is_verified?: boolean;
    is_banned?: boolean;
    custom_fields?: Record<string, any>;
};
export interface Credentials {
    /**
     * This field is only present if the access_type parameter was set to offline in the authentication request. For details, see Refresh tokens.
     */
    refresh_token?: string | null;
    /**
     * The time in ms at which this token is thought to expire.
     */
    expiry_date?: number | null;
    /**
     * A token that can be sent to a Google API.
     */
    access_token?: string | null;
    /**
     * Identifies the type of token returned. At this time, this field always has the value Bearer.
     */
    token_type?: string | null;
    /**
     * A JWT that contains identity information about the user that is digitally signed by Google.
     */
    id_token?: string | null;
    /**
     * The scopes of access granted by the access_token expressed as a list of space-delimited, case-sensitive strings.
     */
    scope?: string;
}
/**
 * The Callbacks type defines the structure of the callbacks used during the authentication and session management process.
 * Each key corresponds to a specific stage of the authentication process.
 */
export type CallbacksReturn = {
    /**
     * Callback function called when a user signs in successfully.
     *
     * @param {User} user - The user object containing user details such as email, name, etc.
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the sign-in is allowed.
     *         If `false`, the sign-in will be rejected; if `true`, the sign-in will proceed.
     *
     * @example
     * const callbacks = {
     *     signIn: async (user) => {
     *         // Check if the user is allowed to sign in
     *         return user.email.endsWith('@example.com');
     *     }
     * };
     */
    signIn?: (user: User) => Promise<boolean>;
    /**
     * Callback function for handling JWT (JSON Web Token) creation or modification.
     *
     * @param {any} token - The token object that contains the user's authentication information.
     * @param {User} [user] - The user object, which may be available depending on the context.
     * @returns {Promise<any>} - A promise that resolves to a possibly modified token or additional data to be included with the token.
     *
     * @example
     * const callbacks = {
     *     jwt: async (token, user) => {
     *         // Add custom data to the token, like user role
     *         token.role = user?.role || 'guest';
     *         return token;
     *     }
     * };
     */
    jwt?: (token: any, user?: User) => Promise<any>;
    /**
     * Callback function for handling user session management.
     *
     * @param {any} session - The session object containing session data.
     * @param {User} user - The user object containing the authenticated user's information.
     * @returns {Promise<any>} - A promise that resolves to the modified session data or a session object.
     *
     * @example
     * const callbacks = {
     *     session: async (session, user) => {
     *         // Modify session object, e.g., store user roles or permissions in the session
     *         session.userRole = user?.role || 'guest';
     *         return session;
     *     }
     * };
     */
    session?: (session: any, user: User) => Promise<any>;
};
export type Callbacks = (ctx: Context) => CallbacksReturn;
/**
 * Middleware to verify the Google OAuth token and handle user authentication.
 * @param {Object} params - The verification parameters.
 * @param {OAuth2Client} params.authClient - The OAuth2 client instance.
 * @param {Function} [params.onError] - Optional error handler.
 * @param {Callbacks} params.Callbacks - The callback functions for user handling.
 * @param {Function} [params.onSuccess] - Optional success handler after verification.
 * @returns {Middleware<any>} The middleware for verifying the Google token.
 */
export declare function verifyGoogleToken({ authClient, onError, Callbacks, onSuccess }: {
    authClient: OAuth2Client;
    onError?: (error: string, ctx: Context) => Promise<Response> | Response;
    onSuccess?: (tokens: Credentials, GaxiosResponse: any) => void | Promise<void>;
    Callbacks?: Callbacks;
}): Middleware<any>;
export {};
