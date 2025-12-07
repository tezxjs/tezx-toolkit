'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var helper = require('tezx/helper');

class MemoryStore {
  store = /* @__PURE__ */ new Map();
  async get(sessionId) {
    const session = this.store.get(sessionId);
    if (!session || session.expires < Date.now()) {
      this.store.delete(sessionId);
      return void 0;
    }
    return session.data;
  }
  async set(sessionId, data, maxAge = 60 * 60 * 1e3) {
    this.store.set(sessionId, {
      data,
      expires: Date.now() + maxAge
    });
  }
  async destroy(sessionId) {
    this.store.delete(sessionId);
  }
}

class SessionManager {
  #options;
  #storage;
  #sessionName;
  /**
  * Initialize a new SessionManager instance.
  *
  * @param options - Configuration options for sessions and cookies.
  */
  constructor(options) {
    const storage = options.storage || new MemoryStore();
    const sessionName = options?.sessionName || "tezx_session";
    this.#sessionName = sessionName;
    const maxAge = options.cookie?.maxAge || 60 * 60 * 1e3;
    this.#options = {
      sessionId: options?.sessionId,
      cookie: {
        maxAge,
        ...options?.cookie
      }
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
  async createSession(data, ctx) {
    let options = this.#options;
    let storage = this.#storage;
    let sessionName = this.#sessionName;
    let sessionId = ctx.cookies.get(sessionName);
    if (!sessionId) {
      sessionId = typeof options?.sessionId == "function" ? await options?.sessionId(ctx) : helper.generateID();
      ctx.cookies.set(sessionName, sessionId, {
        httpOnly: options.cookie?.httpOnly ?? true,
        secure: options.cookie?.secure ?? false,
        domain: options?.cookie?.domain,
        expires: options?.cookie?.expires,
        path: options?.cookie?.path,
        sameSite: options?.cookie?.sameSite,
        maxAge: options.cookie?.maxAge
      });
    }
    ctx.session = {
      data,
      sessionId,
      async save() {
        await storage.set(sessionId, ctx.session, options.cookie?.maxAge);
      },
      async destroy() {
        ctx.cookies.delete(sessionName);
        await storage.destroy(sessionId);
      }
    };
    await ctx.session.save();
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
  useSession(sessionId) {
    let options = this.#options;
    let storage = this.#storage;
    let sessionName = this.#sessionName;
    return async (ctx, next) => {
      let sessionId2 = typeof options?.sessionId == "function" ? await options?.sessionId(ctx) : ctx.cookies.get(sessionName);
      let find = await storage.get(sessionId2);
      ctx.session = find;
      return next();
    };
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
  async destroySession(sessionId) {
    await this.#storage.destroy(sessionId);
  }
}
var index = {
  MemoryStore,
  SessionManager
};

exports.MemoryStore = MemoryStore;
exports.SessionManager = SessionManager;
exports.default = index;
