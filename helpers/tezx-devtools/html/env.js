export function EnvInspector(ctx) {
    const env = ctx.env;
    const entries = Object.entries(env);
    const tableRows = entries.length
        ? entries
            .map(([key, value], i) => {
            const safeKey = key.replace(/"/g, "&quot;");
            const safeValue = value.replace(/`/g, "\\`").replace(/"/g, "&quot;");
            return `
          <tr data-key="${safeKey.toLowerCase()}" data-value="${value.toLowerCase()}">
            <td>${i + 1}</td>
            <td><code>${safeKey}</code></td>
            <td><code>${value}</code></td>
            <td>
              <button class="copy-btn" onclick="copyRowEnv('${safeKey}', \`${safeValue}\`)" title="Copy">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v1h-1V3a.5.5 0 0 0-.5-.5H4A1.5 1.5 0 0 0 2.5 4v8A1.5 1.5 0 0 0 4 13.5H5v1H4A2.5 2.5 0 0 1 1.5 12V4A2.5 2.5 0 0 1 4 1.5h6z"/>
                  <path d="M5.5 5A1.5 1.5 0 0 0 4 6.5v7A1.5 1.5 0 0 0 5.5 15h6A1.5 1.5 0 0 0 13 13.5v-7A1.5 1.5 0 0 0 11.5 5h-6zM5 6.5A.5.5 0 0 1 5.5 6h6a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-7z"/>
                </svg>
              </button>
            </td>
          </tr>`;
        })
            .join("")
        : `
    <tr>
      <td colspan="4">
        <p>⚠️ <strong>No environment variables found.</strong></p>
        <pre class="code-block">
const env = loadEnv();

export const app = new TezX({
  env: env,
  debugMode: true,
  allowDuplicateMw: true,
});
        </pre>
      </td>
    </tr>`;
    return `
  <style>
    .tabs {
      margin-bottom: 1rem;
    }
    .tabs a {
      display: inline-block;
      margin-right: 1rem;
      text-decoration: none;
      font-weight: 500;
      color: #0f172a;
      cursor: pointer;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    table th, table td {
      padding: 0.5rem;
      border: 1px solid #e2e8f0;
      text-align: left;
    }

    table td button.copy-btn {
      background: #f8fafc;
      border: none;
      padding: 0.3rem 0.4rem;
      border-radius: 0.375rem;
      cursor: pointer;
      color: #334155;
      transition: background 0.2s ease;
    }

    .search-container {
      margin-bottom: 1rem;
    }

    .search-container input {
      padding: 0.5rem;
      width: 100%;
      max-width: 400px;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
    }

    .code-block {
      background: #f1f5f9;
      padding: 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
    }

  </style>

  <div class="tabs">
    <a onclick="exportEnv()">📤 Export JSON</a>
    <a onclick="copyAllEnv()">📋 Copy All</a>
  </div>

  <div class="search-container">
    <input type="text" id="env-search" placeholder="🔍 Search environment variables..." oninput="filterEnvTable()" />
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
        showToast('✅ All environment variables copied!');
      }).catch(err => {
        alert('❌ Failed to copy: ' + err);
      });
    }

    function copyRowEnv(key, value) {
      const text = \`\${key}=\${value}\`;
      navigator.clipboard.writeText(text).then(() => {
        showToast(\`✅ Copied: \${key}\`);
      }).catch(err => {
        alert('❌ Failed to copy: ' + err);
      });
    }

    function filterEnvTable() {
      const input = document.getElementById('env-search').value.toLowerCase();
      const rows = document.querySelectorAll('#env-body tr');

      rows.forEach(row => {
        const key = row.getAttribute('data-key') || '';
        const value = row.getAttribute('data-value') || '';
        row.style.display = (key.includes(input) || value.includes(input)) ? '' : 'none';
      });
    }
  </script>
`;
}
