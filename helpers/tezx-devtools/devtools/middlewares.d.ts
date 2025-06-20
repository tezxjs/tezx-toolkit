import type { TezX } from "tezx";
export type MiddlewareEntry = {
    pattern: string;
    type: "static" | "wildcard" | "optional params" | "dynamic params";
    appliedMiddlewares: string[];
};
export declare function dumpMiddlewares(TezX: TezX<any>): MiddlewareEntry[];
