import { SessionInstance, SessionStorageAdapter } from './types.js';

export class MemoryStore implements SessionStorageAdapter {
    private store = new Map<string, { data: SessionInstance, expires: number }>();
    async get(sessionId: string): Promise<SessionInstance | undefined> {
        const session = this.store.get(sessionId);
        if (!session || session.expires < Date.now()) {
            this.store.delete(sessionId);
            return undefined;
        }
        return session.data;
    }

    async set(sessionId: string, data: SessionInstance, maxAge = 60 * 60 * 1000): Promise<void> {
        this.store.set(sessionId, {
            data,
            expires: Date.now() + maxAge,
        });
    }

    async destroy(sessionId: string): Promise<void> {
        this.store.delete(sessionId);
    }
}
