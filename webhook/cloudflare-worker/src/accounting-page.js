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
    .form-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 10px;
    }
    .form-actions.editing {
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    }
    .form-actions button.primary {
      margin-top: 0;
    }
    .button-secondary {
      width: 100%;
      border-color: var(--green);
      color: var(--green);
      background: white;
    }
    button:disabled {
      opacity: .62;
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
    .edit-subtitle {
      grid-column: 1 / -1;
      margin: 0 0 4px;
      color: var(--green);
      font-size: 1rem;
      font-weight: 800;
    }
    .segmented {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .control-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .scope-card {
      background: transparent;
      border: 0;
      border-radius: 0;
      padding: 0;
    }
    .scope-card .segmented {
      display: flex;
      gap: 0;
      overflow: hidden;
      border: 1px solid var(--green);
      border-radius: 8px;
      background: white;
      margin-bottom: 0;
    }
    .scope-card .segmented button {
      flex: 1 1 0;
      border: 0;
      border-radius: 0;
      background: white;
      color: var(--ink);
    }
    .scope-card .segmented button + button {
      border-left: 1px solid var(--green);
    }
    .scope-card .segmented button.active {
      background: var(--green);
      color: white;
    }
    .list-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .list-card .sort-segmented {
      margin-bottom: 14px;
    }
    .sort-segmented {
      display: flex;
      gap: 8px;
    }
    .sort-segmented button {
      display: inline-flex;
      flex: 1 1 0;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 38px;
      border-radius: 999px;
      color: var(--green);
      background: #f8faf8;
      font-size: .9rem;
    }
    .sort-segmented button.active {
      border-color: var(--green);
      background: var(--green);
      color: white;
    }
    .button-icon {
      width: 16px;
      height: 16px;
      flex: 0 0 auto;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      pointer-events: none;
    }
    .split-panel {
      grid-column: 1 / -1;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px;
      background: #f8faf8;
    }
    .split-title {
      margin: 0 0 8px;
      color: var(--green);
      font-weight: 800;
    }
    .member-list {
      display: grid;
      gap: 8px;
    }
    .manual-member {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 8px;
      margin-top: 10px;
    }
    .manual-member input {
      min-height: 38px;
      font-size: .92rem;
    }
    .manual-member button {
      min-height: 38px;
      border-radius: 8px;
      padding: 0 12px;
      color: var(--green);
      font-size: .88rem;
      font-weight: 800;
      white-space: nowrap;
    }
    .member-option {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 36px;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: var(--ink);
      font-size: .92rem;
      font-weight: 700;
    }
    .member-check {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      margin: 0;
      color: var(--ink);
      font-size: .92rem;
      font-weight: 700;
    }
    .member-option input {
      width: auto;
      min-height: auto;
      margin: 0;
    }
    .member-check span {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .member-option .icon-button {
      width: 36px;
      height: 36px;
      min-height: 36px;
      border-color: transparent;
      background: transparent;
    }
    .date-group {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 12px;
    }
    .list-card .date-group {
      background: transparent;
      border: 0;
      border-radius: 0;
      padding: 0;
      margin-bottom: 16px;
    }
    .list-card .date-group + .date-group {
      border-top: 1px solid var(--line);
      padding-top: 16px;
    }
    .list-card .date-group:last-child {
      margin-bottom: 0;
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
    .expense-title-main {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .expense-tag {
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      border-radius: 999px;
      padding: 2px 8px;
      background: var(--green-soft);
      color: var(--green);
      font-size: .78rem;
      font-weight: 800;
      white-space: nowrap;
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
    .toast-root {
      position: fixed;
      top: max(12px, env(safe-area-inset-top));
      left: 0;
      right: 0;
      z-index: 40;
      display: grid;
      justify-items: center;
      padding: 0 14px;
      pointer-events: none;
    }
    .toast {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 36px;
      align-items: center;
      gap: 10px;
      width: min(100%, 520px);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 10px 10px 10px 14px;
      background: white;
      color: var(--ink);
      box-shadow: 0 12px 28px rgba(31, 41, 51, .18);
      pointer-events: auto;
    }
    .toast.success {
      border-color: #b9d8ca;
      background: #eff8f3;
      color: var(--green);
    }
    .toast.error {
      border-color: #efcaca;
      background: var(--danger-soft);
      color: var(--danger);
    }
    .toast-message {
      min-width: 0;
      font-weight: 800;
      line-height: 1.45;
      overflow-wrap: anywhere;
    }
    .toast-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      min-height: 36px;
      padding: 0;
      border-color: transparent;
      background: transparent;
      color: currentColor;
      font-size: 1.35rem;
      line-height: 1;
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
  <div id="toast-root" class="toast-root" aria-live="polite" aria-atomic="true"></div>
  <main>
    <nav class="toolbar" aria-label="主要功能">
      <button id="tab-add" class="active" type="button">我要記帳</button>
      <button id="tab-items" type="button">消費項目</button>
      <button id="tab-stats" type="button">統計</button>
    </nav>

    <section id="view-add">
      <div id="add-scope-card" class="control-card scope-card" aria-label="記帳消費範圍">
        <div class="segmented" aria-label="記帳消費範圍">
          <button id="add-personal" class="active" type="button">我的消費</button>
          <button id="add-group" type="button">團體消費</button>
        </div>
      </div>
      <div class="panel">
        <div class="grid">
          <h2 id="edit-subtitle" class="edit-subtitle hidden"></h2>
          <div class="full-row">
            <label for="date">消費日期</label>
            <input id="date" type="hidden">
            <button id="date-picker" class="date-button" type="button">
              <span id="date-display"></span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path><rect x="3" y="4" width="18" height="18" rx="2"></rect></svg>
            </button>
          </div>
          <div>
            <label for="currency">幣別</label>
            <select id="currency">
              <option value="TWD">台幣 NT$</option>
              <option value="JPY">日幣 ¥</option>
            </select>
          </div>
          <div>
            <label for="amount">金額</label>
            <input id="amount" inputmode="decimal" placeholder="120">
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
          <div id="split-panel" class="split-panel hidden">
            <p class="split-title">分帳成員</p>
            <div id="split-members" class="member-list"></div>
            <div class="manual-member">
              <input id="manual-member-name" placeholder="新增旅伴名稱">
              <button id="add-manual-member" type="button">加入</button>
            </div>
          </div>
        </div>
        <div id="form-actions" class="form-actions">
          <button id="save" class="primary" type="button">新增記帳</button>
          <button id="cancel-edit" class="button-secondary hidden" type="button">取消</button>
        </div>
        <p id="status" class="status"></p>
      </div>
    </section>

    <section id="view-items" class="hidden">
      <div id="items-scope-card" class="control-card scope-card" aria-label="消費項目範圍">
        <div class="segmented" aria-label="消費項目範圍">
          <button id="items-personal" class="active" type="button">我的消費</button>
          <button id="items-group" type="button">團體消費</button>
        </div>
      </div>
      <div class="list-card" aria-label="消費項目清單">
        <div class="sort-segmented" aria-label="消費項目排序">
          <button id="sort-date" class="active" type="button">
            <svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path><rect x="3" y="4" width="18" height="18" rx="2"></rect></svg>
            <span>依日期</span>
          </button>
          <button id="sort-currency" type="button">
            <svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <span>依幣別</span>
          </button>
        </div>
        <div id="items"></div>
      </div>
      <p id="items-status" class="status"></p>
    </section>

    <section id="view-stats" class="hidden">
      <div id="stats-scope-card" class="control-card scope-card" aria-label="統計範圍">
        <div class="segmented" aria-label="統計範圍">
          <button id="stats-personal" class="active" type="button">我的消費</button>
          <button id="stats-group" type="button">團體消費</button>
        </div>
      </div>
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
      tripId: "",
      tripName: "",
      profile: null,
      lineContext: null,
      urlContext: null,
      currentTab: "add",
      editingId: null,
      editingSplitMemberIds: null,
      saving: false,
      highlightedExpenseId: null,
      highlightType: "",
      highlightTimer: null,
      toastTimer: null,
      expenses: [],
      calendarMonth: null,
      sortMode: "date",
      addScope: "personal",
      itemScope: "personal",
      statsScope: "personal",
      ledgerMembers: [],
      expandedCurrencies: new Set(),
    };
    const currencyMeta = {
      TWD: { label: "台幣", symbol: "NT$" },
      JPY: { label: "日幣", symbol: "¥" },
    };
    const currencyOrder = ["TWD", "JPY"];
    const $ = (id) => document.getElementById(id);
    const editIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>';
    const deleteIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v5"></path><path d="M14 11v5"></path></svg>';

    async function init() {
      const requestedTripId = urlTripId();
      const configPath = requestedTripId
        ? "/api/accounting/config?tripId=" + encodeURIComponent(requestedTripId)
        : "/api/accounting/config";
      const config = await api(configPath);
      state.liffId = config.liffId || "";
      state.tripId = requestedTripId || config.tripId || "";
      state.tripName = config.tripName || "旅行";
      state.urlContext = urlChatContext();
      if (state.liffId && window.liff) {
        try {
          await liff.init({ liffId: state.liffId });
          if (!liff.isLoggedIn()) {
            liff.login();
            return;
          }
          state.profile = await liff.getProfile();
          state.lineContext = liff.getContext ? liff.getContext() : null;
        } catch (error) {
          setStatus("LIFF 尚未完成設定，先用一般網頁模式測試。");
        }
      }
      bindEvents();
      syncScopeControls();
      setDefaultDate();
      await refreshItems();
    }

    function bindEvents() {
      $("tab-add").addEventListener("click", () => switchTab("add"));
      $("tab-items").addEventListener("click", () => switchTab("items"));
      $("tab-stats").addEventListener("click", () => switchTab("stats"));
      $("save").addEventListener("click", saveExpense);
      $("cancel-edit").addEventListener("click", cancelEdit);
      $("items").addEventListener("click", handleItemAction);
      $("stats").addEventListener("click", handleStatsAction);
      $("add-personal").addEventListener("click", () => setAddScope("personal"));
      $("add-group").addEventListener("click", () => setAddScope("group"));
      $("items-personal").addEventListener("click", () => setItemScope("personal"));
      $("items-group").addEventListener("click", () => setItemScope("group"));
      $("stats-personal").addEventListener("click", () => setStatsScope("personal"));
      $("stats-group").addEventListener("click", () => setStatsScope("group"));
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
      $("add-manual-member").addEventListener("click", addManualMember);
      $("split-members").addEventListener("click", handleMemberAction);
      $("split-members").addEventListener("change", handleMemberSelectionChange);
      $("toast-root").addEventListener("click", handleToastAction);
    }

    function switchTab(tab, options = {}) {
      if (!options.preserveStatus) clearStatus();
      state.currentTab = tab;
      for (const name of ["add", "items", "stats"]) {
        $("tab-" + name).classList.toggle("active", name === tab);
        $("view-" + name).classList.toggle("hidden", name !== tab);
      }
      if (tab === "items") refreshItems();
      if (tab === "stats") refreshStats();
    }

    function setSortMode(mode) {
      clearStatus();
      state.sortMode = mode;
      $("sort-date").classList.toggle("active", mode === "date");
      $("sort-currency").classList.toggle("active", mode === "currency");
      refreshItems();
    }

    function setAddScope(scope) {
      clearStatus();
      state.addScope = scope;
      $("add-personal").classList.toggle("active", scope === "personal");
      $("add-group").classList.toggle("active", scope === "group");
      if (scope === "group" && !hasGroupLedgerContext()) {
        showError("團體消費需要從 LINE 群組或多人聊天室開啟。");
      }
      syncSplitPanel();
      if (scope === "group" && hasGroupLedgerContext()) loadLedgerMembers();
    }

    function syncScopeControls() {
      const hasGroup = hasGroupLedgerContext();
      $("add-scope-card").classList.toggle("hidden", !hasGroup);
      $("items-scope-card").classList.toggle("hidden", !hasGroup);
      $("stats-scope-card").classList.toggle("hidden", !hasGroup);
      if (!hasGroup) {
        setAddScope("personal");
        state.itemScope = "personal";
        state.statsScope = "personal";
        $("items-personal").classList.add("active");
        $("items-group").classList.remove("active");
        $("stats-personal").classList.add("active");
        $("stats-group").classList.remove("active");
      } else {
        setAddScope("group");
        state.itemScope = "group";
        state.statsScope = "group";
        $("items-personal").classList.remove("active");
        $("items-group").classList.add("active");
        $("stats-personal").classList.remove("active");
        $("stats-group").classList.add("active");
      }
      syncSplitPanel();
      if (hasGroup) loadLedgerMembers();
    }

    function setItemScope(scope) {
      clearStatus();
      state.itemScope = scope;
      $("items-personal").classList.toggle("active", scope === "personal");
      $("items-group").classList.toggle("active", scope === "group");
      refreshItems();
    }

    function setStatsScope(scope) {
      clearStatus();
      state.statsScope = scope;
      $("stats-personal").classList.toggle("active", scope === "personal");
      $("stats-group").classList.toggle("active", scope === "group");
      refreshStats();
    }

    function formPayload() {
      const amount = Number($("amount").value.trim());
      const currencyCode = $("currency").value;
      const meta = currencyMeta[currencyCode] || currencyMeta.TWD;
      return {
        expenseScope: state.addScope,
        date: $("date").value,
        amount,
        currencyCode,
        currencyLabel: meta.label,
        currencySymbol: meta.symbol,
        category: $("category").value,
        note: $("note").value.trim(),
        payerId: state.profile?.userId || "",
        payerName: state.profile?.displayName || "Lize",
        splitMembers: selectedSplitMembers(),
        tripId: state.tripId,
        ...ledgerContextPayload(),
      };
    }

    async function saveExpense() {
      if (state.saving) return;
      clearStatus();
      closeToast();
      const payload = formPayload();
      if (payload.expenseScope === "group" && !hasGroupLedgerContext()) {
        showError("團體消費需要從 LINE 群組或多人聊天室開啟。");
        return;
      }
      if (payload.expenseScope === "group" && !payload.splitMembers.length) {
        showError("請至少選擇一位分帳成員。");
        return;
      }
      if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(payload.date)) {
        showError("日期格式請輸入 YYYY-MM-DD。");
        return;
      }
      if (!payload.amount || payload.amount <= 0) {
        showError("請輸入正確金額。");
        return;
      }
      setSaving(true);
      try {
        const wasEditing = Boolean(state.editingId);
        const targetScope = payload.expenseScope;
        let result;
        if (state.editingId) {
          result = await api("/api/expenses/" + state.editingId, { method: "PATCH", body: payload });
        } else {
          result = await api("/api/expenses", { method: "POST", body: payload });
        }
        const label = successScopeText(targetScope);
        const action = wasEditing ? "已更新" : "已新增";
        setHighlight(result.expense.id, wasEditing ? "updated" : "created");
        setStatus("");
        showToast(action + label + "消費", "success");
        resetForm();
        setListScope(targetScope);
        switchTab("items");
      } catch (error) {
        showError(error.message);
      } finally {
        setSaving(false);
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
      const splitMembers = parseSplitMembers(item);
      state.editingId = id;
      state.editingSplitMemberIds = new Set(splitMembers.map(memberId).filter(Boolean));
      setDateValue(item.date);
      setAddScope(item.expense_scope || "personal");
      $("amount").value = item.amount;
      $("currency").value = item.currency_code;
      $("category").value = item.category;
      $("note").value = item.note || "";
      renderSplitMembers(splitMembers, { preserveSelection: true });
      syncEditMode(id);
      switchTab("add", { preserveStatus: true });
    }

    function cancelEdit() {
      resetForm();
      clearStatus();
      closeToast();
      switchTab("items");
    }

    async function deleteExpense(id) {
      if (!confirm("確定刪除這筆記帳？")) return;
      try {
        const result = await api("/api/expenses/" + id, { method: "DELETE" });
        setStatus("");
        showToast("已刪除消費", "success");
        if (state.editingId === id) resetForm();
        if (state.highlightedExpenseId === id) clearHighlight();
        await refreshItems();
        await refreshStats();
      } catch (error) {
        showError(error.message);
      }
    }

    async function refreshItems() {
      if (state.itemScope === "group" && !hasGroupLedgerContext()) {
        $("items").innerHTML = '<div class="empty">團體消費需要從 LINE 群組或多人聊天室開啟。</div>';
        return;
      }
      await loadExpenses(state.itemScope);
      const root = $("items");
      if (!state.expenses.length) {
        root.innerHTML = '<div class="empty">目前沒有' + (state.itemScope === "group" ? "團體" : "我的") + '消費。</div>';
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
      if (state.statsScope === "group" && !hasGroupLedgerContext()) {
        $("stats").innerHTML = '<div class="empty">團體統計需要從 LINE 群組或多人聊天室開啟。</div>';
        return;
      }
      await loadExpenses(state.statsScope);
      const root = $("stats");
      if (!state.expenses.length) {
        root.innerHTML = '<div class="empty">目前沒有' + (state.statsScope === "group" ? "團體" : "我的") + '消費統計。</div>';
        return;
      }
      const totals = currencyTotals();
      root.innerHTML = totals.map(renderCurrencySummary).join("");
      if (state.statsScope === "group") {
        root.innerHTML = renderSplitSummary() + root.innerHTML;
      }
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

    async function loadExpenses(expenseScope) {
      const params = new URLSearchParams({
        scope: "all",
        expenseScope,
        tripId: state.tripId,
        userId: currentUserId(),
        displayName: state.profile?.displayName || "",
        ...ledgerContextPayload(),
      });
      const data = await api("/api/expenses?" + params.toString());
      state.expenses = data.expenses || [];
    }

    async function loadLedgerMembers() {
      if (!hasGroupLedgerContext()) return;
      const params = new URLSearchParams({
        tripId: state.tripId,
        userId: currentUserId(),
        displayName: state.profile?.displayName || "",
        ...ledgerContextPayload(),
      });
      try {
        const data = await api("/api/ledger-members?" + params.toString());
        state.ledgerMembers = data.members || [];
        renderSplitMembers();
      } catch (error) {
        showError(error.message);
      }
    }

    async function addManualMember() {
      const input = $("manual-member-name");
      const name = input.value.trim();
      if (!name) {
        showError("請輸入旅伴名稱。");
        return;
      }
      if (!hasGroupLedgerContext()) {
        showError("新增分帳成員需要從 LINE 群組或多人聊天室開啟。");
        return;
      }
      try {
        await api("/api/ledger-members", {
          method: "POST",
          body: {
            tripId: state.tripId,
            displayName: name,
            userId: currentUserId(),
            ...ledgerContextPayload(),
          },
        });
        input.value = "";
        await loadLedgerMembers();
        showToast("已加入分帳成員：" + name, "success");
      } catch (error) {
        showError(error.message);
      }
    }

    function handleMemberAction(event) {
      const button = event.target.closest("button[data-member-delete]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      deleteLedgerMember(button.dataset.memberDelete, button.dataset.memberName || "");
    }

    function handleMemberSelectionChange(event) {
      if (!state.editingId || !event.target.matches("[data-split-member]")) return;
      state.editingSplitMemberIds = new Set(
        [...document.querySelectorAll("[data-split-member]:checked")].map((input) => input.dataset.splitMember)
      );
    }

    async function deleteLedgerMember(userId, displayName) {
      if (!userId) return;
      if (userId === currentUserId()) {
        showError("目前開啟記帳本的 LINE 成員會自動保留。");
        return;
      }
      const name = displayName || "這位成員";
      if (!confirm("確定刪除分帳成員「" + name + "」？")) return;
      try {
        const params = new URLSearchParams({
          tripId: state.tripId,
          ...ledgerContextPayload(),
        });
        await api("/api/ledger-members/" + encodeURIComponent(userId) + "?" + params.toString(), { method: "DELETE" });
        state.ledgerMembers = state.ledgerMembers.filter((member) => (member.user_id || member.userId) !== userId);
        if (state.editingSplitMemberIds) state.editingSplitMemberIds.delete(userId);
        renderSplitMembers(null, { preserveSelection: true });
        showToast("已刪除分帳成員：" + name, "success");
      } catch (error) {
        showError(error.message);
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
        const currency = currencyRank(a.currency_code) - currencyRank(b.currency_code);
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
      })).sort((a, b) => currencyRank(a.code) - currencyRank(b.code));
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
      const payer = isGroupExpense(item) && item.payer_name ? '｜付款人：' + escapeHtml(item.payer_name) : "";
      const split = splitText(item);
      return '<li>' + escapeHtml(formatDate(item.date)) + '｜' + escapeHtml(item.category) + '｜' + escapeHtml(formatAmount(item)) + payer + split + '</li>';
    }

    function renderExpense(item, index) {
      const payer = isGroupExpense(item) && item.payer_name ? '｜付款人：' + escapeHtml(item.payer_name) : "";
      const meta = '#' + item.id + ' ' + escapeHtml(item.category) + payer + splitText(item);
      const tag = Number(item.id) === state.highlightedExpenseId
        ? '<span class="expense-tag">' + escapeHtml(state.highlightType === "updated" ? "已更新" : "已新增") + '</span>'
        : "";
      return '<li><article class="expense">' +
        '<div class="expense-main">' +
          '<div class="expense-title"><span class="expense-title-main"><span>' + (index + 1) + '. ' + escapeHtml(item.note || "無備註") + '</span>' + tag + '</span><span class="amount">' + formatAmount(item) + '</span></div>' +
          '<div class="meta">' + meta + '</div>' +
        '</div>' +
        '<div class="icon-actions">' +
          '<button class="icon-button" type="button" data-action="edit" data-id="' + item.id + '" aria-label="修改" title="修改">' + editIcon + '</button>' +
          '<button class="icon-button danger" type="button" data-action="delete" data-id="' + item.id + '" aria-label="刪除" title="刪除">' + deleteIcon + '</button>' +
        '</div>' +
      '</article></li>';
    }

    function resetForm() {
      state.editingId = null;
      state.editingSplitMemberIds = null;
      setDefaultDate();
      $("amount").value = "";
      $("note").value = "";
      syncEditMode();
      renderSplitMembers();
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

    function clearStatus() {
      setStatus("");
    }

    function showError(message) {
      setStatus(message);
      showToast(message, "error", { duration: 0 });
    }

    function showToast(message, type = "success", options = {}) {
      const duration = options.duration ?? (type === "success" ? 2500 : 0);
      if (state.toastTimer) clearTimeout(state.toastTimer);
      $("toast-root").innerHTML = '<div class="toast ' + escapeHtml(type) + '" role="' + (type === "error" ? "alert" : "status") + '">' +
        '<div class="toast-message">' + escapeHtml(message) + '</div>' +
        '<button class="toast-close" type="button" aria-label="關閉提醒" title="關閉提醒" data-toast-close>×</button>' +
        '</div>';
      if (duration > 0) {
        state.toastTimer = setTimeout(closeToast, duration);
      }
    }

    function closeToast() {
      if (state.toastTimer) clearTimeout(state.toastTimer);
      state.toastTimer = null;
      $("toast-root").innerHTML = "";
    }

    function handleToastAction(event) {
      if (event.target.closest("[data-toast-close]")) closeToast();
    }

    function setSaving(isSaving) {
      state.saving = isSaving;
      $("save").disabled = isSaving;
      if (isSaving) {
        $("save").textContent = state.editingId ? "儲存中..." : "新增中...";
      } else {
        $("save").textContent = state.editingId ? "儲存修改" : "新增記帳";
      }
    }

    function syncEditMode(id = null) {
      const isEditing = Boolean(state.editingId);
      $("save").textContent = isEditing ? "儲存修改" : "新增記帳";
      $("cancel-edit").classList.toggle("hidden", !isEditing);
      $("form-actions").classList.toggle("editing", isEditing);
      $("edit-subtitle").classList.toggle("hidden", !isEditing);
      $("edit-subtitle").textContent = isEditing ? "正在修改 #" + (id || state.editingId) : "";
    }

    function setListScope(scope) {
      state.itemScope = scope;
      $("items-personal").classList.toggle("active", scope === "personal");
      $("items-group").classList.toggle("active", scope === "group");
    }

    function setHighlight(id, type) {
      if (state.highlightTimer) clearTimeout(state.highlightTimer);
      state.highlightedExpenseId = Number(id);
      state.highlightType = type;
      state.highlightTimer = setTimeout(() => {
        clearHighlight();
        if (state.currentTab === "items") refreshItems();
      }, 8000);
    }

    function clearHighlight() {
      if (state.highlightTimer) clearTimeout(state.highlightTimer);
      state.highlightTimer = null;
      state.highlightedExpenseId = null;
      state.highlightType = "";
    }

    function successScopeText(scope) {
      return scope === "group" ? "團體" : "我的";
    }

    function currentUserId() {
      return state.profile?.userId || "";
    }

    function isGroupExpense(item) {
      return (item.expense_scope || "personal") === "group";
    }

    function ledgerContextPayload() {
      const context = effectiveLineContext();
      return {
        chatType: context.type || "",
        groupId: context.groupId || "",
        roomId: context.roomId || "",
      };
    }

    function urlTripId() {
      return appParams().get("trip") || "";
    }

    function urlChatContext() {
      const params = appParams();
      const chatType = params.get("chatType") || "";
      const groupId = params.get("groupId") || "";
      const roomId = params.get("roomId") || "";
      if (chatType === "group" && groupId) return { type: "group", groupId, roomId: "" };
      if (chatType === "room" && roomId) return { type: "room", groupId: "", roomId };
      return null;
    }

    function appParams() {
      const params = new URLSearchParams(window.location.search);
      const liffState = params.get("liff.state") || "";
      if (!liffState) return params;

      const query = liffState.includes("?")
        ? liffState.slice(liffState.indexOf("?") + 1)
        : liffState.replace(/^\\?/, "");
      const stateParams = new URLSearchParams(query);
      stateParams.forEach((value, key) => {
        if (!params.has(key)) params.set(key, value);
      });
      return params;
    }

    function effectiveLineContext() {
      if (state.urlContext?.groupId || state.urlContext?.roomId) return state.urlContext;
      const liffContext = state.lineContext || {};
      if (liffContext.groupId || liffContext.roomId) return liffContext;
      return {};
    }

    function hasGroupLedgerContext() {
      const context = effectiveLineContext();
      return Boolean(context.groupId || context.roomId);
    }

    function syncSplitPanel() {
      $("split-panel").classList.toggle("hidden", state.addScope !== "group" || !hasGroupLedgerContext());
      if (state.addScope === "group" && hasGroupLedgerContext()) renderSplitMembers();
    }

    function renderSplitMembers(selectedMembers = null, options = {}) {
      if (!$("split-members")) return;
      const selectedIds = selectedMemberIds(selectedMembers);
      const members = normalizedLedgerMembers();
      if (!options.preserveSelection && !selectedMembers && !state.editingId) {
        members.forEach((member) => selectedIds.add(member.userId));
      }
      $("split-members").innerHTML = members.length
        ? members.map((member) =>
            '<div class="member-option"><label class="member-check"><input type="checkbox" data-split-member="' + escapeHtml(member.userId) + '"' +
            (selectedIds.has(member.userId) ? " checked" : "") + '> <span>' + escapeHtml(member.displayName || "未命名成員") + '</span></label>' +
            (member.userId === currentUserId()
              ? '<span></span>'
              : '<button class="icon-button danger" type="button" data-member-delete="' + escapeHtml(member.userId) + '" data-member-name="' + escapeHtml(member.displayName || "未命名成員") + '" aria-label="刪除成員" title="刪除成員">' + deleteIcon + '</button>') +
            '</div>'
          ).join("")
        : '<div class="meta">群組成員開啟記帳本後，會出現在這裡。</div>';
    }

    function normalizedLedgerMembers() {
      const members = [...state.ledgerMembers];
      if (currentUserId() && !members.some((member) => member.user_id === currentUserId())) {
        members.push({ user_id: currentUserId(), display_name: state.profile?.displayName || "Lize" });
      }
      return members.map((member) => ({
        userId: member.user_id || member.userId,
        displayName: member.display_name || member.displayName || "未命名成員",
      })).filter((member) => member.userId);
    }

    function selectedMemberIds(selectedMembers = null) {
      if (selectedMembers) {
        return new Set(selectedMembers.map(memberId).filter(Boolean));
      }
      if (state.editingId && state.editingSplitMemberIds) {
        return new Set(state.editingSplitMemberIds);
      }
      return new Set(selectedSplitMembers().map((member) => member.userId));
    }

    function memberId(member) {
      return member?.userId || member?.user_id || "";
    }

    function currencyRank(code) {
      const index = currencyOrder.indexOf(String(code));
      return index >= 0 ? index : currencyOrder.length;
    }

    function selectedSplitMembers() {
      if (state.addScope !== "group") return [];
      const members = normalizedLedgerMembers();
      const inputs = [...document.querySelectorAll("[data-split-member]")];
      const checked = inputs.filter((input) => input.checked).map((input) => input.dataset.splitMember);
      const selectedIds = new Set(inputs.length ? checked : members.map((member) => member.userId));
      return members.filter((member) => selectedIds.has(member.userId));
    }

    function parseSplitMembers(item) {
      try {
        const members = JSON.parse(item.split_members || "[]");
        return Array.isArray(members) ? members : [];
      } catch {
        return [];
      }
    }

    function splitText(item) {
      const members = parseSplitMembers(item);
      return isGroupExpense(item) && members.length ? '｜分攤：' + members.length + '人' : "";
    }

    function renderSplitSummary() {
      const summaries = splitSummaries();
      if (!summaries.length) return "";
      return '<section class="summary-card">' +
        '<div class="summary-title">分帳統計</div>' +
        '<ol class="summary-details">' + summaries.map((item) =>
          '<li>' + escapeHtml(item.name) + '｜付款 ' + escapeHtml(item.paidText) + '｜應付 ' + escapeHtml(item.shareText) + '｜差額 ' + escapeHtml(item.balanceText) + '</li>'
        ).join("") + '</ol>' +
      '</section>';
    }

    function splitSummaries() {
      const people = new Map();
      for (const expense of state.expenses.filter(isGroupExpense)) {
        const members = parseSplitMembers(expense);
        if (!members.length) continue;
        const code = expense.currency_code;
        const symbol = expense.currency_symbol || "";
        const amount = Number(expense.amount) || 0;
        const share = amount / members.length;
        const payer = ensurePerson(people, expense.payer_id, expense.payer_name);
        payer.paid[code] = (payer.paid[code] || 0) + amount;
        payer.symbols[code] = symbol;
        for (const member of members) {
          const person = ensurePerson(people, member.userId, member.displayName);
          person.share[code] = (person.share[code] || 0) + share;
          person.symbols[code] = symbol;
        }
      }
      return [...people.values()].map((person) => ({
        name: person.name,
        paidText: currencyMapText(person.paid, person.symbols),
        shareText: currencyMapText(person.share, person.symbols),
        balanceText: currencyBalanceText(person.paid, person.share, person.symbols),
      }));
    }

    function ensurePerson(people, id, name) {
      const key = id || name || "unknown";
      if (!people.has(key)) people.set(key, { name: name || "未命名成員", paid: {}, share: {}, symbols: {} });
      return people.get(key);
    }

    function currencyMapText(values, symbols) {
      const entries = Object.entries(values);
      if (!entries.length) return "0";
      return entries.map(([code, amount]) => (symbols[code] ? symbols[code] + " " : "") + numberText(amount)).join("、");
    }

    function currencyBalanceText(paid, share, symbols) {
      const codes = new Set([...Object.keys(paid), ...Object.keys(share)]);
      if (!codes.size) return "0";
      return [...codes].map((code) => {
        const balance = (paid[code] || 0) - (share[code] || 0);
        const prefix = balance > 0 ? "+" : "";
        return prefix + (symbols[code] ? symbols[code] + " " : "") + numberText(balance);
      }).join("、");
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
