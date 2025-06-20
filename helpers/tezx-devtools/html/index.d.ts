import { Context, TezX } from "tezx";
export type Tab = "cookies" | "routes" | ".env" | "middlewares";
export type TabType = {
    doc_title: string;
    label: string;
    tab: Tab | string;
    content: string;
}[];
export declare function html(ctx: Context, app: TezX): TabType;
