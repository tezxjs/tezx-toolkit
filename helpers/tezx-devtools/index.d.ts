import { Callback, Context, TezX } from "tezx";
import { Tab, TabType } from "./html/index.js";
export type Options = {
    extraTabs?: (ctx: Context) => Promise<TabType> | TabType;
    disableTabs?: Tab[];
};
export declare function DevTools(app: TezX<any>, options?: Options): Callback;
export default DevTools;
