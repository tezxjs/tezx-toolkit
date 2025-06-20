export function CookiesInspector(ctx) {
    const cookies = ctx.cookies.all();
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
              <button class="copy-btn" onclick="copyRow(this)">📋</button>
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
        alert('✅ Cookies saved!');
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
              button.innerText = '✅';
              setTimeout(() => button.innerText = '📋', 1000);
            });
        }
      }

      renderCookies();
    </script>
  `;
    return html;
}
