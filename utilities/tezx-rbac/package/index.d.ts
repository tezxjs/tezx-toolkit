import { Context, Middleware } from 'tezx';

type Role<T extends string[]> = T[number];
type RolePermissionMap<T extends string[]> = {
    [role: string]: T[number][];
};
type DenyError<T extends string[]> = {
    error: string;
    message: string;
    permission: T[number];
};
type LoadPermissionsFn<T extends string[]> = (ctx: Context) => Promise<RolePermissionMap<T>> | RolePermissionMap<T>;
type OnDenyFn<T extends string[]> = (error: DenyError<T>, ctx: Context) => Response | Promise<Response>;
type IsAuthorizedFn<T extends string[]> = (role: string[], permissions: T, ctx: Context) => Promise<boolean> | boolean;
declare module "tezx" {
    interface BaseContext {
        isAuthorized?: IsAuthorizedFn<any>;
        onDeny?: OnDenyFn<any>;
        user?: {
            role: string | string[];
            permissions?: string[];
            [key: string]: any;
        };
    }
}

interface PluginConfig<T extends string[]> {
    loadPermissions: LoadPermissionsFn<T>;
    isAuthorized?: IsAuthorizedFn<T>;
    onDeny?: OnDenyFn<T>;
}
declare class RBAC<T extends string[]> {
    plugin: (config: PluginConfig<T>) => Middleware<any>;
    authorize: (permissionKey: T[number]) => Middleware<any, any>;
}
declare function plugin<T extends string[] = any>(config: PluginConfig<T>): Middleware<any>;
declare function authorize<T extends string[] = any>(permissionKey: T[number]): Middleware<any, any>;

export { authorize, RBAC as default, plugin };
export type { DenyError, IsAuthorizedFn, LoadPermissionsFn, OnDenyFn, Role, RolePermissionMap };
