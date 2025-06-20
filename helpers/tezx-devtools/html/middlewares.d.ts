import { Context, TezX } from "tezx";
export type MiddlewareEntry = {
    pattern: string;
    type: "static" | "wildcard" | "optional params" | "dynamic params";
    appliedMiddlewares: string[];
};
export declare function Middlewares(ctx: Context, app: TezX): string;
