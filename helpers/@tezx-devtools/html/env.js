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
            <td>${safeKey}</td>
            <td>${value}</td>
            <td><button onclick="copyRowEnv('${safeKey}', \`${safeValue}\`)">📋</button></td>
          </tr>
        `;
        })
            .join("")
        : `
    <tr>
      <td colspan="4">
        <p>⚠️ <strong>No environment variables found.</strong></p>
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
        alert('✅ All environment variables copied!');
      }).catch(err => {
        alert('❌ Failed to copy: ' + err);
      });
    }

    function copyRowEnv(key, value) {
      const text = \`\${key}=\${value}\`;
      navigator.clipboard.writeText(text).then(() => {
        alert(\`✅ Copied: \${text}\`);
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
        if (key.includes(input) || value.includes(input)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
  </script>
`;
}
