import { Callback, Context, TezX } from "tezx";
import { Tab, TabType } from "./html/index.js";
/**
 * Configuration options for the devtools.
 *
 * @property extraTabs - A function that receives the current context and returns additional tabs to be displayed. Can return a single tab or a promise resolving to a tab.
 * @property disableTabs - An array of tabs to be disabled in the UI.
 * @property enable - Indicates whether the devtools should be enabled. Set to `true` to activate devtools, or `false` to disable (e.g., in production).
 */
export type Options = {
    extraTabs?: (ctx: Context) => Promise<TabType> | TabType;
    disableTabs?: Tab[];
    enable: boolean;
};
export declare function DevTools(app: TezX<any>, options?: Options): Callback;
export default DevTools;
