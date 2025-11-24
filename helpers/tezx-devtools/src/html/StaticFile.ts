import { Context, TezX } from "tezx";

export function StaticFile(ctx: Context, app: TezX) {
  const staticMap = Object.keys((app as any).staticFile || {}); // Record<string, Callback<any>>
  const rawJSON = JSON.stringify(staticMap.map(r => {
    const [method, path] = r.split(" ");
    return {
      method, path
    }
  }), null, 2); // formatted JSON

  const toCSV = (data: typeof staticMap) => {
    const headers = ["Path", "Method"];
    const rows = data.map((s) => {
      const [method, path] = s.split(" ");
      return [JSON.stringify(path), JSON.stringify(method)]
    });
    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  };

  const csvString = toCSV(staticMap).replace(/"/g, "&quot;");

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
    pre {
        margin: 0;
        font-size: 0.875rem;
        line-height: 1.4;
    }
  </style>

  <div class="tabs toolbar">
    <a class="tab-btn active" onclick="showTab('static')">📂 Static Files (${staticMap?.length})</a>
    <a class="tab-btn" onclick="showTab('json')">🧾 Raw JSON</a>
    <a class="tab-btn" onclick="showTab('export')">📤 Export</a>
  </div>

  <div id="searchBar">
    <input type="text" id="search" placeholder="Filter by path or handler..." />
  </div>

  <div id="staticTab" class="table-container">
    <table id="staticTable">
      <thead>
        <tr>
          <th>#</th>
          <th>Path</th>
          <th>Method</th>
          <th>Copy</th>
        </tr>
      </thead>
      <tbody>
        ${staticMap
      .map(
        (s, i) => {
          const [method, path] = s.split(" ");
          return `
          <tr>
            <td>${i + 1}</td>
            <td>
                <a href="${path}" target="_blank" style="color: var(--accent); text-decoration: underline; font-weight: 500; font-size: 0.95rem;">
                    ${path}
                </a>
            </td>
            <td>${method}</td>
            <td>
                <button class="copy-btn" onclick="copyToClipboard('${path}')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v1h-1V3a.5.5 0 0 0-.5-.5H4A1.5 1.5 0 0 0 2.5 4v8A1.5 1.5 0 0 0 4 13.5H5v1H4A2.5 2.5 0 0 1 1.5 12V4A2.5 2.5 0 0 1 4 1.5h6z"/>
                    <path d="M5.5 5A1.5 1.5 0 0 0 4 6.5v7A1.5 1.5 0 0 0 5.5 15h6A1.5 1.5 0 0 0 13 13.5v-7A1.5 1.5 0 0 0 11.5 5h-6zM5 6.5A.5.5 0 0 1 5.5 6h6a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-7z"/>
                    </svg>
                </button>
            </td>
          </tr>
        `;
        }
      )
      .join("")}
      </tbody>
    </table>
  </div>

  <div id="jsonTab" style="display:none">
    <div class="json-view"><pre><code>${rawJSON}</code></pre></div>
  </div>

  <div id="exportTab" style="display:none">
    <div class="download">
      <a href="data:text/json;charset=utf-8,${encodeURIComponent(rawJSON)}" download="static.json">📥 JSON</a>
      <a href="data:text/csv;charset=utf-8,${csvString}" download="static.csv">📥 CSV</a>
    </div>
  </div>

  <script>
    const tabs = ['static', 'json', 'export'];
    const tabBtns = document.querySelectorAll('.tab-btn');

    function showTab(tab) {
      tabs.forEach(t => {
        document.getElementById(t + 'Tab').style.display = t === tab ? 'block' : 'none';
      });
      tabBtns.forEach(btn => {
        const active = btn.textContent.toLowerCase().includes(tab);
        btn.classList.toggle('active', active);
      });
      document.getElementById('searchBar').style.display = (tab === 'static') ? 'flex' : 'none';
    }

    document.getElementById('search').addEventListener('input', (e) => {
      const keyword = e.target.value.toLowerCase();
      const rows = document.querySelectorAll('#staticTable tbody tr');
      rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(keyword) ? '' : 'none';
      });
    });

    function copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        showToast("Copied: " + text);
      }).catch(err => {
        alert("Failed to copy "+ err?.message);
      });
    }
  </script>
  `;
}
