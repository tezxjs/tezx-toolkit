import { Context, Middleware, NextCallback } from 'tezx';
import type { IsAuthorizedFn, LoadPermissionsFn, OnDenyFn, RolePermissionMap } from './types.js';
export type * from "./types.js";

interface PluginConfig<T extends string[]> {
    loadPermissions: LoadPermissionsFn<T>;
    isAuthorized?: IsAuthorizedFn<T>;
    onDeny?: OnDenyFn<T>;
}

export default class RBAC<T extends string[]> {
    plugin = plugin<T>;
    authorize = authorize<T>;
}

export function plugin<T extends string[] = any,>(config: PluginConfig<T>): Middleware<any> {
    const { loadPermissions, isAuthorized, onDeny } = config;

    if (!loadPermissions) {
        throw new Error('Missing loadPermissions function');
    }

    return async (ctx: Context, next) => {
        ctx.permissions = await loadPermissions(ctx);
        ctx.isAuthorized = isAuthorized;
        const permissions: RolePermissionMap<T> = ctx.permissions || {};
        ctx.permissions = permissions;
        ctx.onDeny = onDeny;
        return next();
    };
}

export function authorize<T extends string[] = any>(permissionKey: T[number]): Middleware<any, any> {
    return async function (ctx: Context, next: NextCallback) {

        const roles = Array.isArray(ctx.user?.role) ? ctx.user.role : [ctx.user?.role || 'guest'];
        let permissions = ctx?.permissions;
        // Combine permissions from all roles
        const mergedPermissions: string[] = roles.flatMap((role) => permissions?.[role] || []);
        // Store permission set in ctx
        ctx.user = {
            ...ctx.user,
            permission: mergedPermissions
        } as any;
        // Check using custom isAuthorized first (if provided)
        const customAuthorized = ctx?.isAuthorized && (await ctx.isAuthorized(roles, ctx.user?.permissions, ctx));

        if (customAuthorized || mergedPermissions?.includes(permissionKey)) {
            return next();
        }

        ctx.body = {
            error: 'Forbidden',
            message: 'You do not have access to this resource.',
            permission: permissionKey
        };
        ctx.status(403)
        // Optional onDeny handler
        if (ctx.onDeny) {
            return await ctx.onDeny(ctx.body, ctx);
        }

        return ctx.json(ctx.body);
    };
}
