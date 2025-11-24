export function CookiesInspector(ctx) {
    const html = `
    <style>
      td[contenteditable="true"] {
        outline: 0px;
      }
      td[contenteditable="true"]:focus {
        outline: 1px solid var(--accent);
        background: #fef9e7;
      }
    </style>

    <div class="tabs">
      <a onclick="addCookieRow()">➕ Add Cookie</a>
      <a onclick="saveCookies()">💾 Save All</a>
      <a onclick="exportCookies()">📤 Export JSON</a>
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

    <pre class="json-view" id="json-output">
    
    </pre>

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
              <button class="copy-btn" onclick="copyRow(this)">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v1h-1V3a.5.5 0 0 0-.5-.5H4A1.5 1.5 0 0 0 2.5 4v8A1.5 1.5 0 0 0 4 13.5H5v1H4A2.5 2.5 0 0 1 1.5 12V4A2.5 2.5 0 0 1 4 1.5h6z"/>
                  <path d="M5.5 5A1.5 1.5 0 0 0 4 6.5v7A1.5 1.5 0 0 0 5.5 15h6A1.5 1.5 0 0 0 13 13.5v-7A1.5 1.5 0 0 0 11.5 5h-6zM5 6.5A.5.5 0 0 1 5.5 6h6a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5h-6a.5.5 0 0 1-.5-.5v-7z"/>
                </svg>
              </button>
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
              <button class="copy-btn" onclick="copyRow(this)">📋</button>
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
        showToast('✅ Cookies saved!');
      }


      function exportCookies() {
            const blob = new Blob([JSON.stringify(getCookies(), null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'cookie.json';
            a.click();
            URL.revokeObjectURL(url);
      }

      function copyRow(button) {
        const row = button.closest('tr');
        const key = row.querySelector('.cookie-key')?.innerText.trim();
        const value = row.querySelector('.cookie-value')?.innerText.trim();
        if (key) {
          navigator.clipboard.writeText(\`\${key}: \${value}\`)
            .then(() => {
              showToast(\`✅ Copied: \${key}\`);
            });
        }
      }

      renderCookies();
    </script>
  `;
    return html;
}
