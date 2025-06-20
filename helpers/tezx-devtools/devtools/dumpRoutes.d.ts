import type { TezX } from "tezx";
export type RouteEntry = {
    method: string;
    pattern: string;
    endpoint: string;
    appliedMiddlewares: string[];
};
export declare function dumpRoutes(TezX: TezX<any>): {
    endpoint: string;
    pattern: string;
    method: any;
    appliedMiddlewares: any[];
}[];
