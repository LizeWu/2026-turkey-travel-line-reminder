export function accountingPage() {
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>旅行記帳本</title>
  <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
  <style>
    :root {
      color-scheme: light;
      --bg: #f5f7f4;
      --panel: #ffffff;
      --ink: #1f2933;
      --muted: #64748b;
      --line: #d8e0dc;
      --green: #235347;
      --green-soft: #e5f1ec;
      --gold: #9a6500;
      --blue: #3451a4;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", "Noto Sans TC", sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-size: 16px;
    }
    header {
      background: var(--green);
      color: white;
      padding: 18px 18px 16px;
    }
    h1 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 700;
      letter-spacing: 0;
    }
    main {
      max-width: 720px;
      margin: 0 auto;
      padding: 14px;
    }
    .toolbar {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      color: var(--muted);
      font-size: .9rem;
      font-weight: 600;
    }
    input, select {
      width: 100%;
      min-height: 44px;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 9px 10px;
      color: var(--ink);
      background: white;
      font-size: 1rem;
    }
    button {
      min-height: 44px;
      border: 1px solid var(--line);
      border-radius: 6px;
      background: white;
      color: var(--ink);
      font-size: .98rem;
      font-weight: 700;
    }
    button.primary {
      width: 100%;
      margin-top: 10px;
      border-color: var(--green);
      background: var(--green);
      color: white;
    }
    button.danger {
      color: #a33131;
      border-color: #efcaca;
      background: #fff7f7;
    }
    button.active {
      border-color: var(--green);
      background: var(--green-soft);
      color: var(--green);
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
    }
    .status {
      min-height: 22px;
      margin: 10px 0 0;
      color: var(--muted);
      font-size: .92rem;
    }
    .expense {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
      padding: 10px 0;
      border-top: 1px solid var(--line);
    }
    .expense:first-child { border-top: 0; }
    .amount {
      font-weight: 800;
      white-space: nowrap;
    }
    .meta {
      color: var(--muted);
      font-size: .9rem;
      line-height: 1.45;
    }
    .empty {
      color: var(--muted);
      padding: 10px 0;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      padding: 6px 0;
      border-top: 1px solid var(--line);
    }
    .summary-row:first-child { border-top: 0; }
    .hidden { display: none; }
  </style>
</head>
<body>
  <header>
    <h1>旅行記帳本</h1>
  </header>
  <main>
    <nav class="toolbar" aria-label="主要功能">
      <button id="tab-add" class="active" type="button">新增</button>
      <button id="tab-today" type="button">今日</button>
      <button id="tab-stats" type="button">統計</button>
    </nav>

    <section id="view-add" class="panel">
      <div class="grid">
        <div>
          <label for="amount">金額</label>
          <input id="amount" inputmode="decimal" placeholder="120">
        </div>
        <div>
          <label for="currency">幣別</label>
          <select id="currency">
            <option value="TRY">里拉 ₺</option>
            <option value="TWD">台幣 NT$</option>
            <option value="EUR">歐元 €</option>
            <option value="USD">美金 US$</option>
          </select>
        </div>
        <div>
          <label for="category">分類</label>
          <select id="category">
            <option>餐食</option>
            <option>交通</option>
            <option>購物</option>
            <option>門票</option>
            <option>住宿</option>
            <option>其他</option>
          </select>
        </div>
        <div>
          <label for="note">備註</label>
          <input id="note" placeholder="烤肉">
        </div>
      </div>
      <button id="save" class="primary" type="button">新增記帳</button>
      <div class="actions">
        <button id="update-recent" type="button">修改最近一筆</button>
        <button id="delete-recent" class="danger" type="button">刪除最近一筆</button>
      </div>
      <p id="status" class="status"></p>
    </section>

    <section id="view-today" class="panel hidden">
      <div id="expenses"></div>
    </section>

    <section id="view-stats" class="panel hidden">
      <div id="stats"></div>
    </section>
  </main>

  <script>
    const state = {
      liffId: "",
      profile: null,
      currentTab: "add",
    };
    const currencyMeta = {
      TRY: { label: "里拉", symbol: "₺" },
      TWD: { label: "台幣", symbol: "NT$" },
      EUR: { label: "歐元", symbol: "€" },
      USD: { label: "美金", symbol: "US$" },
    };
    const $ = (id) => document.getElementById(id);

    async function init() {
      const config = await api("/api/accounting/config");
      state.liffId = config.liffId || "";
      if (state.liffId && window.liff) {
        try {
          await liff.init({ liffId: state.liffId });
          if (!liff.isLoggedIn()) {
            liff.login();
            return;
          }
          state.profile = await liff.getProfile();
        } catch (error) {
          setStatus("LIFF 尚未完成設定，先用一般網頁模式測試。");
        }
      }
      bindEvents();
      await refreshToday();
      await refreshStats();
    }

    function bindEvents() {
      $("tab-add").addEventListener("click", () => switchTab("add"));
      $("tab-today").addEventListener("click", () => switchTab("today"));
      $("tab-stats").addEventListener("click", () => switchTab("stats"));
      $("save").addEventListener("click", saveExpense);
      $("update-recent").addEventListener("click", updateRecent);
      $("delete-recent").addEventListener("click", deleteRecent);
    }

    function switchTab(tab) {
      state.currentTab = tab;
      for (const name of ["add", "today", "stats"]) {
        $("tab-" + name).classList.toggle("active", name === tab);
        $("view-" + name).classList.toggle("hidden", name !== tab);
      }
      if (tab === "today") refreshToday();
      if (tab === "stats") refreshStats();
    }

    function formPayload() {
      const amount = Number($("amount").value.trim());
      const currencyCode = $("currency").value;
      const meta = currencyMeta[currencyCode];
      return {
        amount,
        currencyCode,
        currencyLabel: meta.label,
        currencySymbol: meta.symbol,
        category: $("category").value,
        note: $("note").value.trim(),
        payerId: state.profile?.userId || "",
        payerName: state.profile?.displayName || "Lize",
      };
    }

    async function saveExpense() {
      const payload = formPayload();
      if (!payload.amount || payload.amount <= 0) {
        setStatus("請輸入正確金額。");
        return;
      }
      const result = await api("/api/expenses", { method: "POST", body: payload });
      setStatus("已記帳 #" + result.expense.id + "，" + formatAmount(result.expense));
      $("amount").value = "";
      $("note").value = "";
      await refreshToday();
      await refreshStats();
    }

    async function updateRecent() {
      const payload = formPayload();
      if (!payload.amount || payload.amount <= 0) {
        setStatus("請輸入修改後的金額。");
        return;
      }
      const result = await api("/api/expenses/recent", { method: "PATCH", body: payload });
      setStatus("已修改最近一筆 #" + result.expense.id + "，" + formatAmount(result.expense));
      await refreshToday();
      await refreshStats();
    }

    async function deleteRecent() {
      if (!confirm("確定刪除最近一筆記帳？")) return;
      const result = await api("/api/expenses/recent", { method: "DELETE" });
      setStatus("已刪除最近一筆 #" + result.expense.id + "。");
      await refreshToday();
      await refreshStats();
    }

    async function refreshToday() {
      const data = await api("/api/expenses?scope=today");
      const root = $("expenses");
      if (!data.expenses.length) {
        root.innerHTML = '<div class="empty">今天尚未記帳。</div>';
        return;
      }
      root.innerHTML = data.expenses.map((item) => '<div class="expense"><div><strong>#' + item.id + ' ' + escapeHtml(item.category) + '</strong><div class="meta">' + escapeHtml(item.note || "無備註") + '<br>' + item.date + '</div></div><div class="amount">' + formatAmount(item) + '</div></div>').join("");
    }

    async function refreshStats() {
      const data = await api("/api/expenses/stats");
      const root = $("stats");
      const rows = [];
      for (const item of data.currencyTotals) {
        rows.push('<div class="summary-row"><strong>' + escapeHtml(item.currency_label) + '</strong><span>' + numberText(item.total) + ' ' + escapeHtml(item.currency_symbol || "") + '</span></div>');
      }
      for (const item of data.categoryTotals) {
        rows.push('<div class="summary-row"><span>' + escapeHtml(item.category) + ' / ' + escapeHtml(item.currency_label) + '</span><span>' + numberText(item.total) + '</span></div>');
      }
      root.innerHTML = rows.length ? rows.join("") : '<div class="empty">目前沒有統計資料。</div>';
    }

    async function api(path, options = {}) {
      const response = await fetch(path, {
        method: options.method || "GET",
        headers: { "Content-Type": "application/json" },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Request failed");
      return data;
    }

    function setStatus(text) {
      $("status").textContent = text;
    }

    function formatAmount(item) {
      return numberText(item.amount) + " " + item.currency_label + (item.currency_symbol ? "（" + item.currency_symbol + "）" : "");
    }

    function numberText(value) {
      return Number(value).toLocaleString("zh-TW", { maximumFractionDigits: 2 });
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
    }

    init().catch((error) => {
      setStatus(error.message);
    });
  </script>
</body>
</html>`;
}
