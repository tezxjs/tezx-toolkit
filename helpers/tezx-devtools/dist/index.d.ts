import { TezX, Context, Callback } from 'tezx';

type Tab = "cookies" | "routes" | ".env" | "middlewares";
type TabType = {
    doc_title: string;
    label: string;
    tab: Tab | string;
    content: string;
}[];

declare function dumpRoutes(TezX: TezX<any>): {
    endpoint: any;
    pattern: any;
    method: any;
    appliedMiddlewares: any[];
}[];

type MiddlewareEntry = {
    pattern: string;
    type: "static" | "wildcard" | "optional params" | "dynamic params";
    appliedMiddlewares: string[];
};
declare function dumpMiddlewares(TezX: TezX<any>): MiddlewareEntry[];

type Options = {
    extraTabs?: (ctx: Context) => Promise<TabType> | TabType;
    disableTabs?: Tab[];
};
declare function DevTools(app: TezX<any>, options?: Options): Callback;

export { DevTools, type Options, DevTools as default, dumpMiddlewares, dumpRoutes };
