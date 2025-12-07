import { Context, Middleware, NextCallback } from "tezx";
import { generateID } from "tezx/helper";
import type { SessionConfig, SessionData, SessionIdFn, SessionInstance, SessionOptions, SessionStorageAdapter } from "./types.js";
import { MemoryStore } from "./memoryStorage.js";

/**
 * SessionManager handles creating, retrieving, and deleting user sessions.
 * Supports pluggable storage adapters and cookie-based session tracking.
 */
export class SessionManager<T extends Record<string, any> = {}> {
    #options: SessionOptions;
    #storage: SessionStorageAdapter;
    #sessionName: string;
    /**
    * Initialize a new SessionManager instance.
    *
    * @param options - Configuration options for sessions and cookies.
    */
    constructor(options: SessionConfig & SessionOptions) {
        const storage = options.storage || new MemoryStore();
        const sessionName = options?.sessionName || "tezx_session";
        this.#sessionName = sessionName;
        const maxAge = options.cookie?.maxAge || 60 * 60 * 1000;
        this.#options = {
            sessionId: options?.sessionId,
            cookie: {
                maxAge,
                ...options?.cookie
            },
        };
        this.#storage = storage;
    }

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
    async createSession(data: SessionData<T>, ctx: Context): Promise<SessionInstance> {
        let options = this.#options;
        let storage = this.#storage;
        let sessionName = this.#sessionName;

        let sessionId = ctx.cookies.get(sessionName);
        if (!sessionId) {
            sessionId = typeof options?.sessionId == 'function' ? await options?.sessionId(ctx) : generateID();
            ctx.cookies.set(sessionName, sessionId, {
                httpOnly: options.cookie?.httpOnly ?? true,
                secure: options.cookie?.secure ?? false,
                domain: options?.cookie?.domain,
                expires: options?.cookie?.expires,
                path: options?.cookie?.path,
                sameSite: options?.cookie?.sameSite,
                maxAge: options.cookie?.maxAge,
            });
        }

        ctx.session = {
            data: data,
            sessionId: sessionId,
            async save() {
                await storage.set(sessionId!, ctx.session!, options.cookie?.maxAge);
            },
            async destroy() {
                ctx.cookies.delete(sessionName)
                await storage.destroy(sessionId!);
            },
        }
        await ctx.session!.save();
        return ctx.session;
    }

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
    useSession<T extends Record<string, any> = {}, Path extends string = any>(): Middleware<T, Path> {
        let options = this.#options;
        let storage = this.#storage;
        let sessionName = this.#sessionName;
        return async (ctx: Context, next: NextCallback) => {
            let sessionId = typeof options?.sessionId == 'function' ? await options?.sessionId(ctx) : ctx.cookies.get(sessionName);
            let find = await storage.get(sessionId);
            ctx.session = find;
            return next();
        }
    }

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
    async destroySession(sessionId: string): Promise<void> {
        await this.#storage.destroy(sessionId);
    }
}

declare module "tezx" {
    interface BaseContext {
        session: SessionInstance | undefined;
    }
}

export type {
    SessionConfig,
    SessionData,
    SessionIdFn,
    SessionInstance,
    SessionOptions,
    SessionStorageAdapter
};
export { MemoryStore };
export default {
    MemoryStore,
    SessionManager
}