import { sanitizePathSplit, Environment } from 'tezx/helper';

function CookiesInspector(ctx) {
  ctx.cookies.all();
  const html = `
    <style>
      td[contenteditable="true"] {
        outline: 0px;
      }
      td[contenteditable="true"]:focus {
        outline: 1px solid var(--accent);
      }

      .delete-btn,
      .copy-btn {
        background: #dc2626;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.3rem 0.6rem;
        font-size: 0.8rem;
        cursor: pointer;
        margin-left: 4px;
      }

      .copy-btn {
        background: #2563eb;
      }

      .delete-btn:hover {
        background: #b91c1c;
      }

      .copy-btn:hover {
        background: #1e40af;
      }

      pre#json-output {
        margin-top: 1rem;
        padding: 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        overflow-x: auto;
        display: none;
        background: #f3f4f6;
      }
    </style>

    <div class="tabs">
      <a onclick="addCookieRow()">\u2795 Add Cookie</a>
      <a onclick="saveCookies()">\u{1F4BE} Save All</a>
      <a onclick="exportCookies()">\u{1F4E4} Export JSON</a>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Key</th>
            <th>Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="cookie-body"></tbody>
      </table>
    </div>

    <pre class="json-view" id="json-output"></pre>

    <script>
      function getCookies() {
        const cookies = {};
        document.cookie.split(';').forEach(c => {
          const [k, ...v] = c.trim().split('=');
          cookies[k] = decodeURIComponent(v.join('='));
        });
        return cookies;
      }

      function renderCookies() {
        const tbody = document.getElementById('cookie-body');
        tbody.innerHTML = '';
        const cookies = getCookies();
        let index = 1;
        for (const [key, val] of Object.entries(cookies)) {
          const row = document.createElement('tr');
          row.innerHTML = \`
            <td>\${index++}</td>
            <td contenteditable="true" class="cookie-key" style="white-space: nowrap">\${key}</td>
            <td contenteditable="true" class="cookie-value">\${val}</td>
            <td class="action">
              <button class="copy-btn" onclick="copyRow(this)">\u{1F4CB}</button>
              <button class="delete-btn" onclick="deleteRow(this)">Delete</button>
            </td>
          \`;
          tbody.appendChild(row);
        }
      }

      function addCookieRow() {
        const tbody = document.getElementById('cookie-body');
        const row = document.createElement('tr');
        row.innerHTML = \`
          <td>\${tbody.children.length + 1}</td>
          <td contenteditable="true" class="cookie-key" style="white-space: nowrap"></td>
          <td contenteditable="true" class="cookie-value"></td>
            <td class="action">
              <button class="copy-btn" onclick="copyRow(this)">\u{1F4CB}</button>
              <button class="delete-btn" onclick="deleteRow(this)">Delete</button>
            </td>
        \`;
        tbody.appendChild(row);
      }

      function deleteRow(button) {
        const row = button.closest('tr');
        const key = row.querySelector('.cookie-key')?.innerText.trim();
        if (key) {
          document.cookie = key + '=; Max-Age=0; path=/';
        }
        row.remove();
        renderCookies();
      }

      function saveCookies() {
        const rows = document.querySelectorAll('#cookie-body tr');
        rows.forEach(row => {
          const key = row.querySelector('.cookie-key')?.innerText.trim();
          const value = row.querySelector('.cookie-value')?.innerText.trim();
          if (key) {
            document.cookie = key + '=' + encodeURIComponent(value) + '; path=/';
          }
        });
        renderCookies();
        alert('\u2705 Cookies saved!');
      }

      function exportCookies() {
        const cookies = getCookies();
        const output = document.getElementById('json-output');
        output.textContent = JSON.stringify(cookies, null, 2);
        output.style.display = 'block';
      }

      function copyRow(button) {
        const row = button.closest('tr');
        const key = row.querySelector('.cookie-key')?.innerText.trim();
        const value = row.querySelector('.cookie-value')?.innerText.trim();
        if (key) {
          navigator.clipboard.writeText(\`\${key}: \${value}\`)
            .then(() => {
              button.innerText = '\u2705';
              setTimeout(() => button.innerText = '\u{1F4CB}', 1000);
            });
        }
      }

      renderCookies();
    <\/script>
  `;
  return html;
}

function EnvInspector(ctx) {
  const env = ctx.env;
  const entries = Object.entries(env);
  const tableRows = entries.length ? entries.map(([key, value], i) => {
    const safeKey = key.replace(/"/g, "&quot;");
    const safeValue = value.replace(/`/g, "\\`").replace(/"/g, "&quot;");
    return `
          <tr data-key="${safeKey.toLowerCase()}" data-value="${value.toLowerCase()}">
            <td>${i + 1}</td>
            <td>${safeKey}</td>
            <td>${value}</td>
            <td><button onclick="copyRowEnv('${safeKey}', \`${safeValue}\`)">\u{1F4CB}</button></td>
          </tr>
        `;
  }).join("") : `
    <tr>
      <td colspan="4">
        <p>\u26A0\uFE0F <strong>No environment variables found.</strong></p>
        <pre style="margin-top: 1rem; background: #f1f5f9; padding: 1rem; border-radius: 0.5rem;">
const env = loadEnv();

export const app = new TezX({
  env: env,
  debugMode: true,
  // basePath: 'v1',
  allowDuplicateMw: true,
});
        </pre>
      </td>
    </tr>`;
  return `
  <style>
    table td button {
      background: #e2e8f0;
      border: none;
      padding: 0.3rem 0.6rem;
      border-radius: 0.375rem;
      cursor: pointer;
    }
    table td button:hover {
      background: #cbd5e1;
    }
    pre#json-output {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 0.5rem;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      font-size: 0.875rem;
      overflow-x: auto;
      display: none;
    }
    .search-container {
      margin-bottom: 1rem;
    }
    .search-container input {
      padding: 0.5rem;
      width: 100%;
      max-width: 400px;
      border: 1px solid #e5e7eb;
      border-radius: 0.375rem;
    }
  </style>

  <div class="tabs">
    <a onclick="exportEnv()">\u{1F4E4} Export JSON</a>
    <a onclick="copyAllEnv()">\u{1F4CB} Copy All</a>
  </div>

  <div class="search-container">
    <input type="text" id="env-search" placeholder="\u{1F50D} Search environment variables..." oninput="filterEnvTable()" />
  </div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Key</th>
          <th>Value</th>
          <th>Copy</th>
        </tr>
      </thead>
      <tbody id="env-body">
        ${tableRows}
      </tbody>
    </table>
  </div>

  <pre id="json-output">${JSON.stringify(env, null, 2)}</pre>

  <script>
    function exportEnv() {
      const output = document.getElementById('json-output');
      const blob = new Blob([output.textContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'env.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    function copyAllEnv() {
      const output = document.getElementById('json-output');
      navigator.clipboard.writeText(output.textContent).then(() => {
        alert('\u2705 All environment variables copied!');
      }).catch(err => {
        alert('\u274C Failed to copy: ' + err);
      });
    }

    function copyRowEnv(key, value) {
      const text = \`\${key}=\${value}\`;
      navigator.clipboard.writeText(text).then(() => {
        alert(\`\u2705 Copied: \${text}\`);
      }).catch(err => {
        alert('\u274C Failed to copy: ' + err);
      });
    }

    function filterEnvTable() {
      const input = document.getElementById('env-search').value.toLowerCase();
      const rows = document.querySelectorAll('#env-body tr');

      rows.forEach(row => {
        const key = row.getAttribute('data-key') || '';
        const value = row.getAttribute('data-value') || '';
        if (key.includes(input) || value.includes(input)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
  <\/script>
`;
}

function collectRoutes(node, basePath = "/") {
  const routes = [];
  let fullPath = basePath;
  if (node.isParam && node.paramName) {
    fullPath = `${basePath.replace(/\/+$/, "")}${node.paramName}`;
  }
  const pathname = sanitizePathSplit("/", fullPath).join("/");
  for (const [method, handler] of node.handlers.entries()) {
    routes.push({
      method,
      endpoint: node.pathname,
      pattern: `/${pathname}`,
      appliedMiddlewares: [...handler?.middlewares || []].map(
        (r) => r?.name || "anonymous"
      )
    });
  }
  for (const [childPath, childNode] of node.children.entries()) {
    const newPath = sanitizePathSplit(fullPath, childPath).join("/");
    routes.push(...collectRoutes(childNode, newPath));
  }
  return routes;
}
function dumpRoutes(TezX) {
  let app = TezX;
  const triRoutes = collectRoutes(app.triRouter);
  const staticRoutes = [];
  for (const [path, handlers] of app.routers) {
    for (const [method, handler] of handlers) {
      staticRoutes.push({
        endpoint: path?.replace(/^string:\/\//, "/").replace(/^regex:\/\//, ""),
        pattern: path,
        method,
        appliedMiddlewares: [...handler?.middlewares || []].map(
          (r) => r?.name || "anonymous"
        )
      });
    }
  }
  return [...triRoutes, ...staticRoutes];
}

function detectRouteType(pathname, isOptional) {
  if (pathname.includes("*")) return "wildcard";
  if (pathname.includes(":")) return "dynamic params";
  if (isOptional) return "optional params";
  return "static";
}
function collectMiddlewares(node, basePath = "/") {
  const routes = [];
  const fullPath = sanitizePathSplit("/", basePath).join("/");
  const routeType = detectRouteType(fullPath, node.isOptional);
  routes.push({
    type: routeType,
    pattern: `/${fullPath}`,
    appliedMiddlewares: Array.isArray(node.middlewares) ? node.middlewares.map((mw) => mw?.name || "anonymous") : Array.from(node.middlewares).map((mw) => mw?.name || "anonymous")
  });
  for (const [childPath, childNode] of node.children.entries()) {
    const newPath = sanitizePathSplit(basePath, childPath).join("/");
    routes.push(...collectMiddlewares(childNode, newPath));
  }
  return routes;
}
function dumpMiddlewares(TezX) {
  return collectMiddlewares(TezX.triMiddlewares);
}

function Middlewares(ctx, app) {
  const allRoutes = dumpMiddlewares(app);
  const totalRoutes = allRoutes.length;
  const middlewareRoutes = {};
  for (const route of allRoutes) {
    for (const mw of route.appliedMiddlewares || []) {
      (middlewareRoutes[mw] ||= []).push(route);
    }
  }
  const rawJSON = JSON.stringify(allRoutes, null, 2);
  const toCSV = (data) => {
    const headers = ["pattern", "type", "appliedMiddlewares"];
    const csvRows = [
      headers.join(","),
      ...data.map(
        (r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
      )
    ];
    return csvRows.join("\n");
  };
  const csvString = toCSV(allRoutes).replace(/"/g, "&quot;");
  return `
  <style>
    .download {
        margin-top: 1rem;
        display: flex;
        gap: 1rem;
    }
    .download a {
        padding: 0.5rem 1rem;
        border: 1px solid var(--accent);
        color: var(--accent);
        text-decoration: none;
        border-radius: 6px;
    }

    .download a:hover {
        background: var(--accent);
        color: white;
    }

    #searchBar {
        margin: 1rem 0;
        display: flex;
    }

    #searchBar input {
        flex: 1;
    }

    table td button {
      background: #e2e8f0;
      border: none;
      padding: 0.2rem 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      margin-left: 0.5rem;
    }

    table td button:hover {
      background: #cbd5e1;
    }
  </style>

  <div class="tabs toolbar">
    <a class="tab-btn active counting" data-count="${totalRoutes}" onclick="showTab('routes')">\u{1F4CB} Routes</a>
    <a class="tab-btn counting" data-count="${Object.keys(middlewareRoutes).length}" onclick="showTab('middlewares')">\u{1F9E9} Middlewares</a>
    <a class="tab-btn" onclick="showTab('json')">\u{1F9FE} Raw JSON</a>
    <a class="tab-btn" onclick="showTab('export')">\u{1F4E4} Export</a>
  </div>

  <div id="searchBar">
    <input type="text" id="search" placeholder="Filter by pattern/type/middleware..." />
  </div>

  <!-- ROUTES -->
  <div id="routesTab" class="table-container">
    <table id="routesTable">
      <thead>
        <tr>
          <th>#</th>
          <th>Pattern</th>
          <th>Type</th>
          <th>Middlewares</th>
        </tr>
      </thead>
      <tbody>
        ${allRoutes.map(
    (r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>
            ${r.pattern}
            <button onclick="copyText(\`${r.pattern}\`)">\u{1F4CB}</button>
          </td>
          <td>
            <span style="
              display: inline-block;
              padding: 0.2rem 0.5rem;
              border-radius: 0.375rem;
              color: white;
              font-size: 0.75rem;
              background-color: ${r.type === "static" ? "#16a34a" : r.type === "wildcard" ? "#f97316" : r.type === "optional params" ? "#3b82f6" : r.type === "dynamic params" ? "#9333ea" : "#6b7280"};
            ">
              ${r.type}
            </span>
          </td>
          <td>${(r.appliedMiddlewares || []).join(", ")}</td>
        </tr>
        `
  ).join("")}
      </tbody>
    </table>
  </div>

  <!-- MIDDLEWARES -->
  <div id="middlewaresTab" style="display:none">
    ${Object.entries(middlewareRoutes).map(
    ([mw, routes]) => `
      <h3>\u{1F539} ${mw} (${routes.length})</h3>
      <ul>
        ${routes.map((r) => `<li><code>${r.pattern}</code> <span>(${r.type})</span></li>`).join("")}
      </ul>
    `
  ).join("")}
  </div>

  <!-- RAW JSON -->
  <div id="jsonTab" style="display:none">
    <div class="json-view"><pre>${rawJSON}</pre></div>
  </div>

  <!-- EXPORT -->
  <div id="exportTab" style="display:none">
    <div class="download">
      <a href="data:text/json;charset=utf-8,${encodeURIComponent(
    rawJSON
  )}" download="middlewares.json">\u{1F4E5} JSON</a>
      <a href="data:text/csv;charset=utf-8,${csvString}" download="middlewares.csv">\u{1F4E5} CSV</a>
    </div>
  </div>

  <script>
    const tabs = ['routes', 'middlewares', 'json', 'export'];
    const tabBtns = document.querySelectorAll('.tab-btn');

    function showTab(tab) {
      tabs.forEach(t => {
        document.getElementById(t + 'Tab').style.display = t === tab ? 'block' : 'none';
        document.getElementById(t + 'Tab').classList.toggle('active', t === tab);
      });
      tabBtns.forEach(btn => {
        const active = btn.textContent.toLowerCase().includes(tab);
        btn.classList.toggle('active', active);
      });
      document.getElementById('searchBar').style.display = (tab === 'routes') ? 'flex' : 'none';
    }

    document.getElementById('search').addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#routesTable tbody tr');
      rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(keyword) ? '' : 'none';
      });
    });

    function copyText(text) {
      navigator.clipboard.writeText(text).then(() => {
        alert('\u2705 Copied: ' + text);
      }).catch(err => {
        alert('\u274C Failed to copy: ' + err);
      });
    }
  <\/script>
  `;
}

function Routes(ctx, app) {
  const allRoutes = dumpRoutes(app);
  const totalRoutes = allRoutes.length;
  const middlewareStats = {};
  const middlewareRoutes = {};
  for (const route of allRoutes) {
    for (const mw of route.appliedMiddlewares || []) {
      middlewareStats[mw] = (middlewareStats[mw] || 0) + 1;
      (middlewareRoutes[mw] ||= []).push(route);
    }
  }
  const rawJSON = JSON.stringify(allRoutes, null, 2);
  const toCSV = (data) => {
    const headers = ["method", "endpoint", "pattern", "appliedMiddlewares"];
    const csvRows = [
      headers.join(","),
      ...data.map(
        (r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")
      )
    ];
    return csvRows.join("\n");
  };
  const csvString = toCSV(allRoutes).replace(/"/g, "&quot;");
  return `
  <style>
    .download {
        margin-top: 1rem;
        display: flex;
        gap: 1rem;
    }

    .download a {
        padding: 0.5rem 1rem;
        border: 1px solid var(--accent);
        color: var(--accent);
        text-decoration: none;
        border-radius: 6px;
    }

    .download a:hover {
        background: var(--accent);
        color: white;
    }

    #searchBar {
        margin: 1rem 0;
        display: flex;
    }

    #searchBar input {
        flex: 1;
    }

    table td button {
      background: #e2e8f0;
      border: none;
      padding: 0.2rem 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      margin-left: 0.5rem;
    }

    table td button:hover {
      background: #cbd5e1;
    }
  </style>

  <div class="tabs toolbar">
    <a class="tab-btn active counting" data-count="${totalRoutes}" onclick="showTab('routes')">\u{1F4CB} Routes</a>
    <a class="tab-btn counting" data-count="${Object.keys(middlewareStats).length}" onclick="showTab('stats')">\u{1F4C8} Stats</a>
    <a class="tab-btn" onclick="showTab('middlewares')">\u{1F9E9} Middlewares</a>
    <a class="tab-btn" onclick="showTab('json')">\u{1F9FE} Raw JSON</a>
    <a class="tab-btn" onclick="showTab('export')">\u{1F4E4} Export</a>
  </div>

  <div id="searchBar">
    <input type="text" id="search" placeholder="Filter by method/path/middleware..." />
  </div>

  <!-- ROUTES -->
  <div id="routesTab" class="table-container">
    <table id="routesTable">
      <thead>
        <tr>
          <th>#</th>
          <th>Method</th>
          <th>Endpoint</th>
          <th>Pattern</th>
          <th>Middlewares</th>
        </tr>
      </thead>
      <tbody>
        ${allRoutes.map(
    (r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.method}</td>
          <td>
            ${r.endpoint}
            <button onclick="copyText(\`${r.endpoint}\`)">\u{1F4CB}</button>
          </td>
          <td>
            ${r.pattern}
            <button onclick="copyText(\`${r.pattern}\`)">\u{1F4CB}</button>
          </td>
          <td>${(r.appliedMiddlewares || []).join(", ")}</td>
        </tr>
        `
  ).join("")}
      </tbody>
    </table>
  </div>

  <!-- STATS -->
  <div id="statsTab" style="display:none">
    <div class="json-view">
      Total Routes: ${totalRoutes}<br />
      Middleware Used: ${Object.keys(middlewareStats).length}<br />
      <pre>
${Object.entries(middlewareStats).map(([mw, count]) => `- ${mw}: ${count} routes`).join("\n")}
      </pre>
    </div>
  </div>

  <!-- MIDDLEWARES -->
  <div id="middlewaresTab" style="display:none">
    ${Object.entries(middlewareRoutes).map(
    ([mw, routes]) => `
      <h3>\u{1F539} ${mw} (${routes.length})</h3>
      <ul>
        ${routes.map((r) => `<li><code>${r.method} ${r.endpoint}</code></li>`).join("")}
      </ul>
    `
  ).join("")}
  </div>

  <!-- RAW JSON -->
  <div id="jsonTab" style="display:none">
    <div class="json-view"><pre>${rawJSON}</pre></div>
  </div>

  <!-- EXPORT -->
  <div id="exportTab" style="display:none">
    <div class="download">
      <a href="data:text/json;charset=utf-8,${encodeURIComponent(rawJSON)}" download="routes.json">\u{1F4E5} JSON</a>
      <a href="data:text/csv;charset=utf-8,${csvString}" download="routes.csv">\u{1F4E5} CSV</a>
    </div>
  </div>

  <script>
    const tabs = ['routes', 'stats', 'middlewares', 'json', 'export'];
    const tabBtns = document.querySelectorAll('.tab-btn');

    function showTab(tab) {
      tabs.forEach(t => {
        document.getElementById(t + 'Tab').style.display = t === tab ? 'block' : 'none';
        document.getElementById(t + 'Tab').classList.toggle('active', t === tab);
      });
      tabBtns.forEach(btn => {
        const active = btn.textContent.toLowerCase().includes(tab);
        btn.classList.toggle('active', active);
      });
      document.getElementById('searchBar').style.display = (tab === 'routes') ? 'flex' : 'none';
    }

    document.getElementById('search').addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#routesTable tbody tr');
      rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(keyword) ? '' : 'none';
      });
    });

    function copyText(text) {
      navigator.clipboard.writeText(text).then(() => {
        alert('\u2705 Copied: ' + text);
      }).catch(err => {
        alert('\u274C Failed to copy: ' + err);
      });
    }
  <\/script>
  `;
}

function html(ctx, app) {
  let tabDb = [
    {
      doc_title: "DevTools - Route Inspector",
      label: "Routes",
      tab: "routes",
      content: Routes(ctx, app)
    },
    {
      doc_title: "DevTools - Middleware Inspector",
      label: "Middlewares",
      tab: "middleware",
      content: Middlewares(ctx, app)
    },
    {
      tab: "cookies",
      label: "Cookies",
      doc_title: "DevTools - Cookie Inspector",
      // content: `<pre class="json-view">${JSON.stringify(ctx.cookies.all(), null, 2)}</pre>`,
      content: CookiesInspector(ctx)
    },
    {
      tab: ".env",
      label: "Environment",
      doc_title: "DevTools - Environment",
      // content: `<pre class="json-view">${JSON.stringify(ctx.cookies.all(), null, 2)}</pre>`,
      content: EnvInspector(ctx)
    }
  ];
  return tabDb;
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
function DevTools(app, options = { disableTabs: [] }) {
  let { disableTabs, extraTabs } = options;
  return async (ctx) => {
    let extraTabs2 = await (typeof options.extraTabs === "function" ? options.extraTabs(ctx) : []);
    let html$1 = [
      ...disableTabs?.length ? html(ctx, app)?.filter(
        (r) => !disableTabs?.includes(r?.tab)
      ) : html(ctx, app),
      ...extraTabs2
    ];
    let tab = ctx.req.query?._tab || html$1?.[0]?.tab;
    const navbar = `
         <header>
            <div class="tabs">
                <svg style="height:32px;" viewBox="0 0 1168 1168" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M0 1168H571H1168V0H0V1168ZM875.727 438.273C889.595 422.44 898 401.702 898 379C898 329.294 857.706 289 808 289H394C353.27 289 318.859 316.056 307.76 353.176C306.497 356.537 305.743 360.007 305.323 363.538C304.453 368.562 304 373.728 304 379C304 391.196 306.426 402.826 310.822 413.433C312.665 418.546 315.069 423.475 318.196 428.148C330.741 446.897 347.077 459.078 366.816 464.822C375.393 467.536 384.525 469 394 469H463.948C483.783 469.859 502.288 485.944 504.766 505.706C505.397 510.741 507.296 511.065 511.279 511.053C550.605 510.932 589.931 510.935 629.257 510.968C630.811 510.969 632.364 511.217 634.118 511.496C635.002 511.637 635.937 511.786 636.949 511.916C626.868 528.482 614.204 542.312 601.838 555.818C596.597 561.541 591.41 567.207 586.495 572.997C594.303 572.997 602.117 572.997 609.933 572.997C625.577 572.997 641.234 572.998 656.891 572.997C664.604 572.997 670.16 577.563 674.003 586.41C676.939 593.168 673.204 597.465 669.012 601.673C665.523 605.176 661.997 608.643 658.471 612.11C652.374 618.105 646.276 624.101 640.372 630.28C623.174 648.281 606.087 666.387 589 684.493C583.127 690.717 577.254 696.94 571.376 703.159C569.096 705.571 566.817 707.983 564.537 710.395C546.142 729.856 527.747 749.318 509.448 768.869C508.123 770.285 507.122 772.611 507.086 774.535C507.02 778.048 506.95 781.562 506.88 785.076C506.515 803.374 506.15 821.676 506.327 839.972C506.565 864.654 514.717 886.476 532.273 904.257C554.282 926.547 581.133 935.806 612.155 932.956C632.013 931.131 649.792 923.622 664.684 910.492C688.018 889.92 698.995 863.578 698.976 832.521C698.967 817.133 698.951 801.745 698.934 786.357C698.879 734.918 698.824 683.479 699.058 632.041C699.239 592.242 700.038 552.442 700.935 512.65C701.394 492.268 712.853 472.037 736.661 469H752.068C767.139 469.637 782.276 469.326 797.391 469H808C822.467 469 836.137 465.587 848.248 459.521C853.897 456.773 859.336 453.351 864.545 449.168C868.518 445.978 872.273 442.319 875.727 438.273ZM604.236 618.923C577.696 649.321 551.156 679.719 524.615 710.117C514.372 721.778 504.167 733.401 493.987 744.995C467.191 775.513 440.574 805.828 413.913 836.104C408.346 842.426 402.631 848.618 396.917 854.81C394.508 857.421 392.099 860.031 389.701 862.651C389.525 862.844 389.351 863.045 389.177 863.247C388.573 863.945 387.961 864.654 387.198 865.066C386.075 865.673 384.859 866.109 383.644 866.545C383.131 866.729 382.619 866.912 382.113 867.109C382.229 866.551 382.302 865.969 382.375 865.386C382.53 864.141 382.686 862.896 383.26 861.89C399.678 833.115 416.134 804.362 432.589 775.609C444.082 755.528 455.575 735.447 467.055 715.358C473.703 703.725 480.221 692.018 486.739 680.312C487.702 678.583 488.665 676.853 489.628 675.124C490.128 674.226 490.473 673.242 490.902 672.017C491.13 671.364 491.383 670.643 491.695 669.831C489.284 669.736 486.953 669.626 484.675 669.519C479.86 669.292 475.284 669.077 470.707 669.035C464.041 668.974 457.374 668.957 450.706 668.94C438.882 668.909 427.057 668.879 415.238 668.602C412.068 668.528 408.628 666.615 405.896 664.713C402.705 662.492 401.956 659.008 404.394 655.535C405.752 653.6 407.106 651.663 408.46 649.725C413.569 642.416 418.678 635.106 423.984 627.943C431.997 617.124 440.069 606.349 448.14 595.573C455.492 585.758 462.843 575.943 470.151 566.096C472.996 562.262 476.024 560.165 481.228 560.248C495.624 560.48 510.025 560.443 524.427 560.406C530.349 560.391 536.272 560.376 542.194 560.379C542.821 560.38 543.448 560.477 544.082 560.575C544.38 560.621 544.679 560.667 544.98 560.704C531.162 579.325 517.53 597.696 503.898 616.067L504.921 617.585H603.574C603.686 617.812 603.798 618.038 603.91 618.265C604.019 618.484 604.127 618.704 604.236 618.923Z" fill="#FF581E"/>
                </svg>
                 ${html$1?.map((r) => `<a href = "?_tab=${r?.tab}" class="${tab === r?.tab ? "active" : ""}" > ${r?.label} </a>`)?.join("\n")}
            </div>
            <div class="tabs">
                <a class="toggle-dark" onclick="toggleTheme()">\u{1F319} Toggle Dark</a>
                <a class="active">
                  ${Environment.getEnvironment}
                </a>
            </div>
        </header>
        `;
    let find = html$1.find((r) => r?.tab == tab);
    return ctx.html(_a || (_a = __template(['\n<!DOCTYPE html>\n<html lang="en">\n    <head>\n        <meta charset="UTF-8" />\n        <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n        <title>', '</title>\n        <style>\n            :root {\n                --bg: #f8f9fa;\n                --text: #212529;\n                --accent: #FF581E;\n                --header-bg: rgba(255, 255, 255, 0.94);\n                --table-bg: #ffffff;\n                --table-border: #d1d5db;\n                /* Gray-300 */\n                --tr-hover: #e3f2fd;\n                /* Light Blue Hover */\n                --tr-odd: #f8fafc;\n                /* Lightest gray-blue */\n                --tr-even: #ffffff;\n            }\n\n            body.dark {\n                --bg: #0e1117;\n                --text: #f1f3f5;\n                --accent: #58a6ff;\n                /* GitHub Blue */\n                --header-bg: rgba(18, 18, 18, 0.9);\n                --table-bg: #161b22;\n                --table-border: #30363d;\n                --tr-hover: #1f6feb33;\n                /* Blue hover with opacity */\n                --tr-odd: #1a1f24;\n                --tr-even: #0f1419;\n\n                --col-1: #9ca3af;\n                /* Gray-400 */\n                --col-2: #58a6ff;\n                /* Blue-300 */\n                --col-3: #4ade80;\n                /* Green-400 */\n                --col-4: #facc15;\n                /* Yellow-400 */\n                --col-5: #c084fc;\n                /* Purple-400 */\n            }\n\n            body {\n                margin: 0;\n                font-family: system-ui, sans-serif;\n                background: var(--bg);\n                color: var(--text);\n                transition: background 0.3s ease, color 0.3s ease;\n            }\n\n\n            header {\n                position: sticky;\n                background: var(--header-bg);\n                border-bottom: 1px solid var(--accent);\n                top: 0px;\n                display: flex;\n                padding: 16px;\n                align-items: center;\n                justify-content: space-between;\n                gap: 6px;\n                flex-wrap: wrap;\n            }\n\n            header>div {\n                display: flex;\n                gap: 6px;\n                align-items: center;\n            }\n            .toolbar ,.action{\n                display: flex;\n                padding: 16px;\n                align-items: center;\n                gap: 6px;\n                flex-wrap: wrap;\n            }\n            .tabs a {\n                padding: 0.4rem 0.8rem;\n                text-decoration: none;\n                border: 1px solid var(--accent);\n                border-radius: 5px;\n                color: var(--accent);\n                cursor: pointer;\n                text-transform: capitalize;\n            }\n\n            .tabs a.active {\n                background-color: var(--accent);\n                color: white;\n                cursor: default;\n            }\n\n            .tabs a.counting::after {\n                content: attr(data-count);\n                background: var(--accent);\n                color: white;\n                font-size: 0.7rem;\n                margin-left: 6px;\n                padding: 2px 6px;\n                border-radius: 10px;\n                display: inline-block;\n            }\n\n            .tabs a.counting.active::after {\n                content: attr(data-count);\n                background: white;\n                color: black;\n                font-size: 0.7rem;\n                margin-left: 6px;\n                padding: 2px 6px;\n                border-radius: 10px;\n                display: inline-block;\n            }\n\n            section.content {\n                padding: 16px;\n            }\n\n            h1 {\n                font-size: 1.8rem;\n                margin-top: 0px;\n                margin-bottom: 20px;\n            }\n\n            input[type="text"] {\n                display: inline-flex;\n                margin-top: 16px;\n                padding: 0.5rem;\n                font-size: 1rem;\n                border: 1px solid var(--table-border);\n                border-radius: 6px;\n                max-width: 300px;\n            }\n\n            input[type="text"]:focus {\n                outline: 1px solid var(--accent);\n            }\n\n            .match-true {\n                color: green;\n                font-weight: bold;\n            }\n\n            .match-false {\n                color: red;\n                font-weight: bold;\n            }\n\n            .json-view {\n                margin-top: 16px;\n                white-space: pre-wrap;\n                background: var(--table-bg);\n                padding: 1rem;\n                border: 1px solid var(--table-border);\n                border-radius: 6px;\n                font-family: monospace;\n                max-height: 600px;\n                overflow: auto;\n            }\n\n            .table-container {\n                overflow: auto;\n                margin-top: 16px;\n                border-radius: 0.5rem;\n                height: 75vh;\n                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);\n            }\n\n            table {\n                width: 100%;\n                border-collapse: collapse;\n                background: var(--table-bg);\n                margin-top: 1rem;\n                border: 1px solid var(--table-border);\n            }\n\n            th,\n            td {\n                padding: 0.75rem;\n                text-align: left;\n                border: 1px solid var(--table-border);\n                font-size: 0.95rem;\n            }\n\n            thead {\n                background-color: var(--accent);\n                color: white;\n                position: sticky;\n                top: 0px;\n            }\n\n            /* Light mode zebra striping */\n            tbody tr:nth-child(odd) {\n                background-color: var(--tr-odd);\n            }\n\n            tbody tr:nth-child(even) {\n                background-color: var(--tr-even);\n            }\n\n            /* Hover effect */\n            tbody tr:hover {\n                background-color: var(--tr-hover);\n            }\n\n            .status-true {\n                color: green;\n                font-weight: bold;\n            }\n\n            .status-false {\n                color: red;\n                font-weight: bold;\n            }\n            /**\n            @media (max-width: 768px) {\n                table,\n                thead,\n                tbody,\n                th,\n                td,\n                tr {\n                    display: block;\n                }\n\n                thead {\n                    display: none;\n                }\n\n                tr {\n                    margin-bottom: 1rem;\n                    border: 1px solid var(--table-border);\n                    border-radius: 8px;\n                    background: var(--table-bg);\n                }\n\n                td {\n                    display: flex;\n                    justify-content: space-between;\n                    padding: 0.5rem 1rem;\n                    border: none;\n                }\n\n                td::before {\n                    content: attr(data-label);\n                    font-weight: bold;\n                    color: var(--accent);\n                }\n            }\n        **/\n        </style>\n    </head>\n    <body>\n        ', '\n\n        <section class="content">\n            <h1>\n                ', "\n            </h1>\n            ", `
        </section>
                <script>
                    const themeCookieName = "tezx-theme";

                    function setCookie(name, value, days = 30) {
                        const expires = new Date(Date.now() + days * 864e5).toUTCString();
                        document.cookie = name +"="+ value +"; expires = "+ expires +"; path =/";
                    }
                    function getCookie(name) {
                        return document.cookie.split('; ').reduce((acc, cookie) => {
                            const [key, val] = cookie.split('=');
                            return key === name ? decodeURIComponent(val) : acc;
                        }, null);
                    }

                    function toggleTheme() {
                        document.body.classList.toggle('dark');
                        setCookie(themeCookieName, document.body.classList.contains('dark') ? 'dark' : 'light');
                    }

                    // Load theme from cookie
                    window.addEventListener('DOMContentLoaded', () => {
                        const savedTheme = getCookie(themeCookieName);
                        if (savedTheme === 'dark') {
                            document.body.classList.add('dark');
                        }
                    });
                <\/script>
    </body>
</html>
  `])), find?.doc_title, navbar, find?.doc_title, find?.content);
  };
}

export { DevTools, DevTools as default, dumpMiddlewares, dumpRoutes };
