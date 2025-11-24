import { Context, TezX } from "tezx";
import { CookiesInspector } from "./cookies.js";
import { Routes } from "./routes.js";
import { StaticFile } from "./StaticFile.js";
export type Tab = "cookies" | "routes" | ".env" | "middlewares";
export type TabType = {
  doc_title: string;
  label: string;
  tab: Tab | string;
  content: string;
}[];
export function html(ctx: Context, app: TezX) {
  let tabDb: TabType = [
    {
      doc_title: "DevTools - Route Inspector",
      label: "Routes",
      tab: "routes",
      content: Routes(ctx, app),
    },
    {
      doc_title: "Static File",
      label: "Static File",
      tab: "static-file",
      content: StaticFile(ctx, app),
    },
    {
      tab: "cookies",
      label: "Cookies",
      doc_title: "DevTools - Cookie Inspector",
      // content: `<pre class="json-view">${JSON.stringify(ctx.cookies.all(), null, 2)}</pre>`,
      content: CookiesInspector(ctx),
    },
  ];
  return tabDb;
}
