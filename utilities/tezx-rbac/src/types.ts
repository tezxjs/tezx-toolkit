import type { Context } from "tezx";
export type Role<T extends string[]> = T[number];

export type RolePermissionMap<T extends string[]> = {
    [role: string]: T[number][];
}

export type DenyError<T extends string[]> = {
    error: string;
    message: string;
    permission: T[number];
}

export type LoadPermissionsFn<T extends string[]> = (ctx: Context) => Promise<RolePermissionMap<T>> | RolePermissionMap<T>;

export type OnDenyFn<T extends string[]> = (error: DenyError<T>, ctx: Context) => Response | Promise<Response>;

export type IsAuthorizedFn<T extends string[]> = (
    role: string[],
    permissions: T,
    ctx: Context
) => Promise<boolean> | boolean;

declare module "tezx" {
    interface BaseContext {
        isAuthorized?: IsAuthorizedFn<any>;
        onDeny?: OnDenyFn<any>;

        user?: {
            role: string | string[];
            permissions?: string[];
            [key: string]: any;
        }
    }
}