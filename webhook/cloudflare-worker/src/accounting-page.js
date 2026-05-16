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
      --danger: #a33131;
      --danger-soft: #fff7f7;
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
      display: block;
      width: 100%;
      max-width: 100%;
      min-height: 44px;
      border: 1px solid var(--line);
      border-radius: 6px;
      padding: 9px 10px;
      color: var(--ink);
      background: white;
      font-size: 1rem;
      appearance: auto;
    }
    .full-row {
      grid-column: 1 / -1;
      min-width: 0;
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
    button.active {
      border-color: var(--green);
      background: var(--green-soft);
      color: var(--green);
    }
    .date-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      min-width: 0;
      padding: 9px 10px;
      text-align: left;
      font-size: 1rem;
      font-weight: 700;
    }
    .date-button svg {
      width: 19px;
      height: 19px;
      flex: 0 0 auto;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }
    .date-dialog {
      position: fixed;
      inset: 0;
      z-index: 20;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 14px;
      background: rgba(31, 41, 51, .32);
    }
    .calendar {
      width: min(100%, 420px);
      background: var(--panel);
      border-radius: 8px;
      border: 1px solid var(--line);
      padding: 12px;
      box-shadow: 0 16px 38px rgba(31, 41, 51, .18);
    }
    .calendar-head {
      display: grid;
      grid-template-columns: 44px 1fr 44px;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    .calendar-title {
      text-align: center;
      color: var(--green);
      font-weight: 800;
    }
    .calendar-nav {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      font-size: 1.2rem;
      color: var(--green);
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
    }
    .weekday {
      color: var(--muted);
      font-size: .78rem;
      font-weight: 700;
      text-align: center;
      padding: 5px 0;
    }
    .day-button {
      min-height: 40px;
      padding: 0;
      border-radius: 6px;
      font-weight: 700;
    }
    .day-button.selected {
      border-color: var(--green);
      background: var(--green);
      color: white;
    }
    .day-button.muted-day {
      color: var(--muted);
      background: #f8faf8;
    }
    .calendar-actions {
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
    .segmented {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .date-group {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .date-group + .date-group {
      border-top: 1px solid var(--line);
    }
    .date-heading {
      margin: 0 0 4px;
      color: var(--green);
      font-size: .98rem;
      font-weight: 800;
    }
    .expense-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .expense {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      border-top: 1px solid var(--line);
    }
    .date-heading + .expense {
      border-top: 0;
    }
    .expense-main {
      min-width: 0;
    }
    .expense-title {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      color: var(--ink);
      font-weight: 800;
    }
    .amount {
      white-space: nowrap;
    }
    .meta {
      color: var(--muted);
      font-size: .9rem;
      font-weight: 600;
      line-height: 1.45;
      overflow-wrap: anywhere;
    }
    .icon-actions {
      display: flex;
      gap: 6px;
    }
    .icon-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      min-height: 40px;
      padding: 0;
      color: var(--green);
    }
    .icon-button.danger {
      color: var(--danger);
      border-color: #efcaca;
      background: var(--danger-soft);
    }
    .icon-button svg {
      width: 19px;
      height: 19px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      pointer-events: none;
    }
    .empty {
      color: var(--muted);
      padding: 10px 0;
    }
    .section-title {
      margin: 0 0 10px;
      color: var(--green);
      font-size: 1rem;
      font-weight: 800;
    }
    .summary-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 12px;
      font-weight: 700;
    }
    .summary-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 40px;
      align-items: center;
      gap: 10px;
    }
    .summary-title {
      min-width: 0;
      line-height: 1.45;
    }
    .summary-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      min-height: 40px;
      padding: 0;
      color: var(--green);
    }
    .summary-toggle svg {
      width: 19px;
      height: 19px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      transition: transform .16s ease;
      pointer-events: none;
    }
    .summary-toggle.expanded svg {
      transform: rotate(180deg);
    }
    .summary-details {
      margin: 8px 0 0;
      padding: 8px 0 0 1.2rem;
      border-top: 1px solid var(--line);
      color: var(--muted);
      font-size: .92rem;
      font-weight: 600;
    }
    .summary-details li {
      padding: 5px 0;
      border-top: 0;
      font-weight: 600;
    }
    .hidden { display: none; }
    .date-dialog.hidden { display: none; }
    @media (max-width: 420px) {
      .grid {
        grid-template-columns: 1fr;
      }
      .expense {
        grid-template-columns: 1fr;
      }
      .icon-actions {
        justify-content: flex-end;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>旅行記帳本</h1>
  </header>
  <main>
    <nav class="toolbar" aria-label="主要功能">
      <button id="tab-add" class="active" type="button">我要記帳</button>
      <button id="tab-items" type="button">消費項目</button>
      <button id="tab-stats" type="button">統計</button>
    </nav>

    <section id="view-add" class="panel">
      <div class="grid">
        <div class="full-row">
          <label for="date">消費日期</label>
          <input id="date" type="hidden">
          <button id="date-picker" class="date-button" type="button">
            <span id="date-display"></span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path><rect x="3" y="4" width="18" height="18" rx="2"></rect></svg>
          </button>
        </div>
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
      <p id="status" class="status"></p>
    </section>

    <section id="view-items" class="hidden">
      <div class="segmented" aria-label="消費項目排序">
        <button id="sort-date" class="active" type="button">依日期</button>
        <button id="sort-currency" type="button">依幣別</button>
      </div>
      <div id="items"></div>
      <p id="items-status" class="status"></p>
    </section>

    <section id="view-stats" class="hidden">
      <h2 class="section-title">幣別消費統計</h2>
      <div id="stats"></div>
    </section>
  </main>

  <div id="date-dialog" class="date-dialog hidden" role="dialog" aria-modal="true" aria-label="選擇消費日期">
    <div class="calendar">
      <div class="calendar-head">
        <button id="calendar-prev" class="calendar-nav" type="button" aria-label="上個月">‹</button>
        <div id="calendar-title" class="calendar-title"></div>
        <button id="calendar-next" class="calendar-nav" type="button" aria-label="下個月">›</button>
      </div>
      <div id="calendar-grid" class="calendar-grid"></div>
      <div class="calendar-actions">
        <button id="calendar-today" type="button">今天</button>
        <button id="calendar-close" type="button">完成</button>
      </div>
    </div>
  </div>

  <script>
    const state = {
      liffId: "",
      profile: null,
      currentTab: "add",
      editingId: null,
      expenses: [],
      calendarMonth: null,
      sortMode: "date",
      loadingExpenses: false,
      expandedCurrencies: new Set(),
    };
    const currencyMeta = {
      TRY: { label: "里拉", symbol: "₺" },
      TWD: { label: "台幣", symbol: "NT$" },
      EUR: { label: "歐元", symbol: "€" },
      USD: { label: "美金", symbol: "US$" },
    };
    const $ = (id) => document.getElementById(id);
    const editIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>';
    const deleteIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v5"></path><path d="M14 11v5"></path></svg>';

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
      setDefaultDate();
      await refreshItems();
    }

    function bindEvents() {
      $("tab-add").addEventListener("click", () => switchTab("add"));
      $("tab-items").addEventListener("click", () => switchTab("items"));
      $("tab-stats").addEventListener("click", () => switchTab("stats"));
      $("save").addEventListener("click", saveExpense);
      $("items").addEventListener("click", handleItemAction);
      $("stats").addEventListener("click", handleStatsAction);
      $("sort-date").addEventListener("click", () => setSortMode("date"));
      $("sort-currency").addEventListener("click", () => setSortMode("currency"));
      $("date-picker").addEventListener("click", openCalendar);
      $("calendar-prev").addEventListener("click", () => moveCalendarMonth(-1));
      $("calendar-next").addEventListener("click", () => moveCalendarMonth(1));
      $("calendar-today").addEventListener("click", () => selectDate(localDate()));
      $("calendar-close").addEventListener("click", closeCalendar);
      $("date-dialog").addEventListener("click", (event) => {
        if (event.target === $("date-dialog")) closeCalendar();
      });
      $("calendar-grid").addEventListener("click", handleCalendarDay);
    }

    function switchTab(tab) {
      state.currentTab = tab;
      for (const name of ["add", "items", "stats"]) {
        $("tab-" + name).classList.toggle("active", name === tab);
        $("view-" + name).classList.toggle("hidden", name !== tab);
      }
      if (tab === "items") refreshItems();
      if (tab === "stats") refreshStats();
    }

    function setSortMode(mode) {
      state.sortMode = mode;
      $("sort-date").classList.toggle("active", mode === "date");
      $("sort-currency").classList.toggle("active", mode === "currency");
      refreshItems();
    }

    function formPayload() {
      const amount = Number($("amount").value.trim());
      const currencyCode = $("currency").value;
      const meta = currencyMeta[currencyCode];
      return {
        date: $("date").value,
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
      if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(payload.date)) {
        setStatus("日期格式請輸入 YYYY-MM-DD。");
        return;
      }
      if (!payload.amount || payload.amount <= 0) {
        setStatus("請輸入正確金額。");
        return;
      }
      try {
        if (state.editingId) {
          const result = await api("/api/expenses/" + state.editingId, { method: "PATCH", body: payload });
          setStatus("已更新 #" + result.expense.id + "，" + formatAmount(result.expense));
        } else {
          const result = await api("/api/expenses", { method: "POST", body: payload });
          setStatus("已記帳 #" + result.expense.id + "，" + formatAmount(result.expense));
        }
        resetForm();
        await refreshItems();
        await refreshStats();
      } catch (error) {
        setStatus(error.message);
      }
    }

    function handleItemAction(event) {
      const button = event.target.closest("button[data-action]");
      if (!button) return;
      const id = Number(button.dataset.id);
      if (button.dataset.action === "edit") {
        startEdit(id);
      }
      if (button.dataset.action === "delete") {
        deleteExpense(id);
      }
    }

    function startEdit(id) {
      const item = state.expenses.find((expense) => expense.id === id);
      if (!item) return;
      state.editingId = id;
      setDateValue(item.date);
      $("amount").value = item.amount;
      $("currency").value = item.currency_code;
      $("category").value = item.category;
      $("note").value = item.note || "";
      $("save").textContent = "儲存修改";
      setStatus("正在修改 #" + id + "。");
      switchTab("add");
    }

    async function deleteExpense(id) {
      if (!confirm("確定刪除這筆記帳？")) return;
      try {
        const result = await api("/api/expenses/" + id, { method: "DELETE" });
        setStatus("已刪除 #" + result.expense.id + "。");
        if (state.editingId === id) resetForm();
        await refreshItems();
        await refreshStats();
      } catch (error) {
        setStatus(error.message);
      }
    }

    async function refreshItems() {
      await loadExpenses();
      const root = $("items");
      if (!state.expenses.length) {
        root.innerHTML = '<div class="empty">目前尚未記帳。</div>';
        return;
      }

      const sections = groupedExpenses().map((group) =>
        '<section class="date-group"><h2 class="date-heading">' + escapeHtml(group.title) + '</h2>' +
        '<ol class="expense-list">' + group.items.map((item, index) => renderExpense(item, index)).join("") + '</ol>' +
        '</section>'
      );
      root.innerHTML = sections.join("");
    }

    async function refreshStats() {
      await loadExpenses();
      const root = $("stats");
      if (!state.expenses.length) {
        root.innerHTML = '<div class="empty">目前沒有統計資料。</div>';
        return;
      }
      const totals = currencyTotals();
      root.innerHTML = totals.map(renderCurrencySummary).join("");
    }

    function handleStatsAction(event) {
      const button = event.target.closest("button[data-currency]");
      if (!button) return;
      const code = button.dataset.currency;
      if (state.expandedCurrencies.has(code)) {
        state.expandedCurrencies.delete(code);
      } else {
        state.expandedCurrencies.add(code);
      }
      refreshStats();
    }

    async function loadExpenses() {
      if (state.loadingExpenses) return;
      state.loadingExpenses = true;
      try {
        const data = await api("/api/expenses?scope=all");
        state.expenses = data.expenses || [];
      } finally {
        state.loadingExpenses = false;
      }
    }

    function groupedExpenses() {
      const groups = new Map();
      const sorted = [...state.expenses].sort(compareExpenses);
      for (const item of sorted) {
        const key = state.sortMode === "currency" ? item.currency_code : item.date;
        const title = state.sortMode === "currency" ? item.currency_label : formatDate(item.date);
        if (!groups.has(key)) groups.set(key, { title, items: [] });
        groups.get(key).items.push(item);
      }
      return [...groups.values()];
    }

    function compareExpenses(a, b) {
      if (state.sortMode === "currency") {
        const currency = String(a.currency_code).localeCompare(String(b.currency_code));
        if (currency) return currency;
      }
      const date = String(b.date).localeCompare(String(a.date));
      if (date) return date;
      return Number(b.id) - Number(a.id);
    }

    function currencyTotals() {
      const totals = new Map();
      for (const item of state.expenses) {
        const key = item.currency_code;
        if (!totals.has(key)) {
          totals.set(key, {
            code: item.currency_code,
            label: item.currency_label,
            symbol: item.currency_symbol || "",
            total: 0,
            items: [],
          });
        }
        const total = totals.get(key);
        total.total += Number(item.amount) || 0;
        total.items.push(item);
      }
      return [...totals.values()].map((group) => ({
        ...group,
        items: group.items.sort((a, b) => {
          const date = String(b.date).localeCompare(String(a.date));
          if (date) return date;
          return Number(b.id) - Number(a.id);
        }),
      })).sort((a, b) => a.code.localeCompare(b.code));
    }

    function renderCurrencySummary(item) {
      const expanded = state.expandedCurrencies.has(item.code);
      const details = expanded
        ? '<ol class="summary-details">' + item.items.map(renderCurrencyDetail).join("") + '</ol>'
        : "";
      return '<section class="summary-card">' +
        '<div class="summary-row">' +
          '<div class="summary-title">' + escapeHtml(item.label) + '目前消費 ' + escapeHtml(item.symbol) + ' ' + numberText(item.total) + '</div>' +
          '<button class="summary-toggle' + (expanded ? " expanded" : "") + '" type="button" data-currency="' + escapeHtml(item.code) + '" aria-label="' + (expanded ? "收合" : "展開") + '" title="' + (expanded ? "收合" : "展開") + '">' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>' +
          '</button>' +
        '</div>' +
        details +
      '</section>';
    }

    function renderCurrencyDetail(item) {
      return '<li>' + escapeHtml(formatDate(item.date)) + '｜' + escapeHtml(item.category) + '｜' + escapeHtml(formatAmount(item)) + '</li>';
    }

    function renderExpense(item, index) {
      return '<li><article class="expense">' +
        '<div class="expense-main">' +
          '<div class="expense-title"><span>' + (index + 1) + '. ' + escapeHtml(item.note || "無備註") + '</span><span class="amount">' + formatAmount(item) + '</span></div>' +
          '<div class="meta">#' + item.id + ' ' + escapeHtml(item.category) + '</div>' +
        '</div>' +
        '<div class="icon-actions">' +
          '<button class="icon-button" type="button" data-action="edit" data-id="' + item.id + '" aria-label="修改" title="修改">' + editIcon + '</button>' +
          '<button class="icon-button danger" type="button" data-action="delete" data-id="' + item.id + '" aria-label="刪除" title="刪除">' + deleteIcon + '</button>' +
        '</div>' +
      '</article></li>';
    }

    function resetForm() {
      state.editingId = null;
      setDefaultDate();
      $("amount").value = "";
      $("note").value = "";
      $("save").textContent = "新增記帳";
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
      $("items-status").textContent = text;
    }

    function formatAmount(item) {
      return (item.currency_symbol ? item.currency_symbol + " " : "") + numberText(item.amount) + " (" + item.currency_label + ")";
    }

    function formatDate(value) {
      return String(value).replaceAll("-", "/");
    }

    function setDefaultDate() {
      setDateValue(localDate());
    }

    function localDate() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return year + "-" + month + "-" + day;
    }

    function setDateValue(value) {
      $("date").value = value;
      $("date-display").textContent = formatDate(value);
      state.calendarMonth = monthStart(value);
    }

    function openCalendar() {
      state.calendarMonth = monthStart($("date").value || localDate());
      renderCalendar();
      $("date-dialog").classList.remove("hidden");
    }

    function closeCalendar() {
      $("date-dialog").classList.add("hidden");
    }

    function moveCalendarMonth(offset) {
      state.calendarMonth = new Date(state.calendarMonth.getFullYear(), state.calendarMonth.getMonth() + offset, 1);
      renderCalendar();
    }

    function handleCalendarDay(event) {
      const button = event.target.closest("button[data-date]");
      if (!button) return;
      selectDate(button.dataset.date);
    }

    function selectDate(value) {
      setDateValue(value);
      renderCalendar();
      closeCalendar();
    }

    function renderCalendar() {
      const month = state.calendarMonth || monthStart(localDate());
      const selected = $("date").value;
      $("calendar-title").textContent = month.getFullYear() + "年" + (month.getMonth() + 1) + "月";
      const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
      const cells = weekdays.map((day) => '<div class="weekday">' + day + '</div>');
      const first = new Date(month.getFullYear(), month.getMonth(), 1);
      const start = new Date(first);
      start.setDate(first.getDate() - first.getDay());
      for (let index = 0; index < 42; index += 1) {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        const value = dateValue(date);
        const classes = ["day-button"];
        if (value === selected) classes.push("selected");
        if (date.getMonth() !== month.getMonth()) classes.push("muted-day");
        cells.push('<button class="' + classes.join(" ") + '" type="button" data-date="' + value + '">' + date.getDate() + '</button>');
      }
      $("calendar-grid").innerHTML = cells.join("");
    }

    function monthStart(value) {
      const parts = String(value).split("-").map(Number);
      return new Date(parts[0], (parts[1] || 1) - 1, 1);
    }

    function dateValue(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return year + "-" + month + "-" + day;
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
