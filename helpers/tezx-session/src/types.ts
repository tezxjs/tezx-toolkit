import { Context, CookieOptions } from "tezx";

/**
 * Defines the shape of the session data object.
 * Allows extending with any key-value pairs.
 */
export type SessionData<T extends Record<string, any> = {}> = T & {
    [key: string]: any;
};

/**
 * Defines the interface for a session storage adapter.
 * Implementations can use memory, Redis, databases, etc.
 */
export interface SessionStorageAdapter {
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
export type SessionIdFn = (ctx: Context) => Promise<string> | string;

/**
 * Configuration options for the session manager.
 */
export interface SessionConfig {
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
export interface SessionOptions {
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
export interface SessionInstance {
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