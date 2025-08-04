"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Routes = Routes;
function Routes(ctx, app) {
    const routeMap = app.route.reduce((acc, curr) => {
        const { pattern, method, handlers } = curr;
        if (!acc[pattern])
            acc[pattern] = {};
        acc[pattern][method] = handlers;
        return acc;
    }, {});
    const allRoutes = Object.entries(routeMap).map(([pattern, middlewareMap]) => ({
        pattern,
        handlers: Object.entries(middlewareMap).map(([method, handlers]) => ({
            method,
            handlerNames: handlers.map((fn) => fn.name || "[anonymous]"),
        })),
    }));
    const rawJSON = JSON.stringify(allRoutes, null, 2);
    const toCSV = (data) => {
        const headers = ["Path", "Middleware", "Handler"];
        const rows = data.flatMap((route) => route.handlers.flatMap((mw) => mw.handlerNames.map((h) => [
            JSON.stringify(route.pattern),
            JSON.stringify(mw.method),
            JSON.stringify(h),
        ])));
        return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
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

    .router-title {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }
  </style>

  <div class="tabs toolbar">
    <a class="tab-btn active" onclick="showTab('routes')">📋 Routes (${allRoutes.flat(2)?.length})</a>
    <a class="tab-btn" onclick="showTab('json')">🧾 Raw JSON</a>
    <a class="tab-btn" onclick="showTab('export')">📤 Export</a>
  </div>
    <h2 class="router-title">📌 Router: <span class="router-name">${app.router.name}</span></h2>
  <div id="searchBar">
    <input type="text" id="search" placeholder="Filter by path or middleware..." />
  </div>

  <div id="routesTab" class="table-container">
    <table id="routesTable">
      <thead>
        <tr>
          <th>#</th>
          <th>Path</th>
          <th>Middleware</th>
          <th>Handlers</th>
        </tr>
      </thead>
      <tbody>
        ${allRoutes.flatMap((r, i) => r.handlers.map((hn) => `
              <tr>
                <td>${i + 1}</td>
                <td>${r.pattern}</td>
                <td>
                  ${hn.method === "ALL"
        ? `<span style="
                          display: inline-block;
                          background-color: var(--accent);
                          color: #fff;
                          padding: 4px 10px;
                          border-radius: 6px;
                          font-weight: 500;
                          font-size: 13px;
                          box-shadow: 0 1px 4px rgba(0,0,0,0.15);
                        ">${hn.method} <small style="opacity: 0.8;">(middleware)</small></span>`
        : `<span style="
                          font-size: 14px;
                        ">${hn.method}</span>`}
                </td>
                <td>${hn.handlerNames.join(", ")}</td>
              </tr>
            `))
        .join("")}
      </tbody>
    </table>
  </div>

  <div id="jsonTab" style="display:none">
    <div class="json-view"><pre>${rawJSON}</pre></div>
  </div>

  <div id="exportTab" style="display:none">
    <div class="download">
      <a href="data:text/json;charset=utf-8,${encodeURIComponent(rawJSON)}" download="routes.json">📥 JSON</a>
      <a href="data:text/csv;charset=utf-8,${csvString}" download="routes.csv">📥 CSV</a>
    </div>
  </div>

  <script>
    const tabs = ['routes', 'json', 'export'];
    const tabBtns = document.querySelectorAll('.tab-btn');

    function showTab(tab) {
      tabs.forEach(t => {
        document.getElementById(t + 'Tab').style.display = t === tab ? 'block' : 'none';
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
  </script>
  `;
}
