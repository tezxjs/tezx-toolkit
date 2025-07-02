import type { TezX } from "tezx";
export type RouteEntry = {
    method: string;
    pattern: string;
    endpoint: string;
    appliedMiddlewares: string[];
};
export declare function dumpRoutes(TezX: TezX<any>): {
    endpoint: any;
    pattern: any;
    method: any;
    appliedMiddlewares: any[];
}[];
