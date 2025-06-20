import { dumpRoutes } from "../devtools/index.js";
export function Routes(ctx, app) {
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
            ...data.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(",")),
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
    <a class="tab-btn active counting" data-count="${totalRoutes}" onclick="showTab('routes')">📋 Routes</a>
    <a class="tab-btn counting" data-count="${Object.keys(middlewareStats).length}" onclick="showTab('stats')">📈 Stats</a>
    <a class="tab-btn" onclick="showTab('middlewares')">🧩 Middlewares</a>
    <a class="tab-btn" onclick="showTab('json')">🧾 Raw JSON</a>
    <a class="tab-btn" onclick="showTab('export')">📤 Export</a>
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
        ${allRoutes
        .map((r, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${r.method}</td>
          <td>
            ${r.endpoint}
            <button onclick="copyText(\`${r.endpoint}\`)">📋</button>
          </td>
          <td>
            ${r.pattern}
            <button onclick="copyText(\`${r.pattern}\`)">📋</button>
          </td>
          <td>${(r.appliedMiddlewares || []).join(", ")}</td>
        </tr>
        `)
        .join("")}
      </tbody>
    </table>
  </div>

  <!-- STATS -->
  <div id="statsTab" style="display:none">
    <div class="json-view">
      Total Routes: ${totalRoutes}<br />
      Middleware Used: ${Object.keys(middlewareStats).length}<br />
      <pre>
${Object.entries(middlewareStats)
        .map(([mw, count]) => `- ${mw}: ${count} routes`)
        .join("\n")}
      </pre>
    </div>
  </div>

  <!-- MIDDLEWARES -->
  <div id="middlewaresTab" style="display:none">
    ${Object.entries(middlewareRoutes)
        .map(([mw, routes]) => `
      <h3>🔹 ${mw} (${routes.length})</h3>
      <ul>
        ${routes.map((r) => `<li><code>${r.method} ${r.endpoint}</code></li>`).join("")}
      </ul>
    `)
        .join("")}
  </div>

  <!-- RAW JSON -->
  <div id="jsonTab" style="display:none">
    <div class="json-view"><pre>${rawJSON}</pre></div>
  </div>

  <!-- EXPORT -->
  <div id="exportTab" style="display:none">
    <div class="download">
      <a href="data:text/json;charset=utf-8,${encodeURIComponent(rawJSON)}" download="routes.json">📥 JSON</a>
      <a href="data:text/csv;charset=utf-8,${csvString}" download="routes.csv">📥 CSV</a>
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
        alert('✅ Copied: ' + text);
      }).catch(err => {
        alert('❌ Failed to copy: ' + err);
      });
    }
  </script>
  `;
}
