import { Context, CookieOptions, Middleware } from 'tezx';

/**
 * Defines the shape of the session data object.
 * Allows extending with any key-value pairs.
 */
type SessionData<T extends Record<string, any> = {}> = T & {
    [key: string]: any;
};
/**
 * Defines the interface for a session storage adapter.
 * Implementations can use memory, Redis, databases, etc.
 */
interface SessionStorageAdapter {
    /**
     * Retrieve a session instance by its ID.
     * @param sessionId - The session ID.
     * @returns A Promise resolving to the session instance or undefined if not found.
     */
    get(sessionId: string): Promise<SessionInstance | undefined>;
    /**
     * Save or update a session instance.
     * @param sessionId - The session ID.
     * @param data - The session instance to store.
     * @param maxAge - Optional expiration time in milliseconds.
     */
    set(sessionId: string, data: SessionInstance, maxAge?: number): Promise<void>;
    /**
     * Destroy a session by its ID.
     * @param sessionId - The session ID to delete.
     */
    destroy(sessionId: string): Promise<void>;
}
/**
 * A function type for generating custom session IDs.
 * @param ctx - The request context.
 * @returns A session ID as a string or Promise resolving to a string.
 */
type SessionIdFn = (ctx: Context) => Promise<string> | string;
/**
 * Configuration options for the session manager.
 */
interface SessionConfig {
    /**
     * Optional custom storage adapter. Defaults to in-memory storage.
     */
    storage?: SessionStorageAdapter;
    /**
     * The name of the cookie to store the session ID.
     */
    sessionName: string;
}
/**
 * Additional session options.
 */
interface SessionOptions {
    /**
     * Optional function to generate a session ID.
     */
    sessionId?: SessionIdFn;
    /**
     * Cookie options for the session cookie.
     */
    cookie?: CookieOptions;
}
/**
 * Represents a single session instance.
 */
interface SessionInstance {
    /**
     * The unique session ID.
     */
    sessionId: string;
    /**
     * The data stored in the session.
     */
    data: SessionData;
    /**
     * Save the current session instance to storage.
     */
    save(): Promise<void>;
    /**
     * Destroy this session instance.
     */
    destroy(): Promise<void>;
}

declare class MemoryStore implements SessionStorageAdapter {
    private store;
    get(sessionId: string): Promise<SessionInstance | undefined>;
    set(sessionId: string, data: SessionInstance, maxAge?: number): Promise<void>;
    destroy(sessionId: string): Promise<void>;
}

/**
 * SessionManager handles creating, retrieving, and deleting user sessions.
 * Supports pluggable storage adapters and cookie-based session tracking.
 */
declare class SessionManager<T extends Record<string, any> = {}> {
    #private;
    /**
    * Initialize a new SessionManager instance.
    *
    * @param options - Configuration options for sessions and cookies.
    */
    constructor(options: SessionConfig & SessionOptions);
    /**
    * Create a new session and attach it to the context.
    *
    * This will:
    * - Generate a new session ID (if not already present in cookies).
    * - Set the session cookie in the response (if a new session ID was generated).
    * - Attach the session instance to `ctx.session`.
    * - Save the session data to the storage backend.
    *
    * ⚠️ Requires the client to support cookies to store the session ID.
    *
    * ⚠️ If the application requires CORS, ensure that credentials (`credentials: 'include'`) are used
    * in your client-side HTTP requests to allow cookies to be sent across origins.
    *
    * @param data - The initial session data.
    * @param ctx - The request context.
    * @returns The created session instance.
    *
    * Example usage:
    * ```ts
    * const session = await sessionManager.createSession({ userId: 123 }, ctx);
    * ```
    */
    createSession(data: SessionData<T>, ctx: Context): Promise<SessionInstance>;
    /**
    * Middleware to load an existing session from cookies and attach it to the context.
    *
    * Example usage:
    * ```ts
    * app.use(sessionManager.useSession());
    * ```
    *
    * The middleware reads the session ID from the user's cookies,
    * retrieves the corresponding session data from storage,
    * and attaches it to `ctx.session`.
    *
    * @returns Middleware to load the session from storage.
    */
    useSession<T extends Record<string, any> = {}, Path extends string = any>(): Middleware<T, Path>
    /**
    * Delete a session by its ID from the storage.
    *
    * @param sessionId - The session ID to delete.
    *
    * Example usage:
    * ```ts
    * await sessionManager.destroySession(sessionId);
    * ```
    */
    destroySession(sessionId: string): Promise<void>;
}
declare module "tezx" {
    interface BaseContext {
        session: SessionInstance | undefined;
    }
}

declare const _default: {
    MemoryStore: typeof MemoryStore;
    SessionManager: typeof SessionManager;
};

export { MemoryStore, type SessionConfig, type SessionData, type SessionIdFn, type SessionInstance, SessionManager, type SessionOptions, type SessionStorageAdapter, _default as default };
