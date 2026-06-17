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
    .payer-field {
      margin-bottom: 10px;
    }
    .split-method {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
      margin-bottom: 10px;
    }
    .split-method button {
      min-height: 38px;
      border-radius: 999px;
      color: var(--green);
      background: white;
      font-size: .9rem;
    }
    .split-method button.active {
      border-color: var(--green);
      background: var(--green);
      color: white;
    }
    .member-list {
      display: grid;
      gap: 8px;
    }
    .split-balance {
      margin: 8px 0 0;
      color: var(--muted);
      font-size: .86rem;
      font-weight: 700;
    }
    .split-balance.warning {
      color: #a45b00;
    }
    .split-balance.ok {
      color: var(--green);
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
      grid-template-columns: minmax(0, 1fr) minmax(92px, 120px) auto;
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
    .member-option .split-amount {
      width: 100%;
      min-height: 38px;
      padding: 7px 8px;
      font-size: .9rem;
    }
    .member-option.equal-mode {
      grid-template-columns: minmax(0, 1fr) auto;
    }
    .member-check span {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .member-option .icon-button {
      width: 36px;
      height: 36px;
      min-height: 36px;
    }
    .member-actions {
      display: inline-flex;
      justify-content: flex-end;
      gap: 4px;
      min-width: 76px;
    }
    .member-actions button {
      border-radius: 333px;
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
      font-size: 1.125rem;
      font-weight: 800;
      padding: 0 16px 0 0;
      line-height: 2;
    }
    .expense-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .expense {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      background: #f7f7f7;
      border-radius: 8px;
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
    .expense-category {
      display: inline-flex;
      align-items: center;
      min-height: 22px;
      padding: 2px 8px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--panel);
      color: var(--green);
      font-size: .78rem;
      font-weight: 800;
      white-space: nowrap;
    }
    .expense-seq,
    .expense-id {
      color: #adadad;
      font-weight: 800;
      white-space: nowrap;
    }
    .expense-note {
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
      margin-top: 10px;
      color: var(--muted);
      font-size: .9rem;
      font-weight: 600;
      line-height: 1.45;
      overflow-wrap: anywhere;
    }
    .expense-meta {
      display: grid;
      gap: 2px;
    }
    .meta-line {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .meta-line.primary {
      color: #adadad;
      font-weight: 700;
    }
    .owner-expense-groups {
      display: grid;
      gap: 12px;
    }
    .owner-expense-group {
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
      background: #fbfcfb;
    }
    .owner-expense-header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 10px;
      width: 100%;
      min-height: 48px;
      border: 0;
      border-radius: 0;
      padding: 10px 12px;
      background: white;
      color: var(--ink);
      text-align: left;
    }
    .owner-identity {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      font-weight: 800;
    }
    .owner-identity .member-name {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .owner-toggle-icon {
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--line);
      border-radius: 999px;
      color: var(--green);
      background: #f8faf8;
      font-size: 1rem;
      line-height: 1;
    }
    .owner-expense-wrap {
      display: grid;
      gap: 10px;
      border-top: 1px solid var(--line);
      padding: 12px;
    }
    .owner-expense-wrap .sort-segmented {
      margin-bottom: 0;
    }
    .owner-expense-wrap .expense-list {
      gap: 8px;
    }
    .owner-expense-wrap .expense {
      background: #f7f7f7;
    }
    .expense-body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 12px;
      align-items: start;
      min-width: 0;
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
      display: grid;
      gap: 2px;
      min-width: 0;
      color: var(--green);
      font-size: 1.125rem;
      font-weight: 800;
      padding: 0 14px 4px;
      line-height: 2;
      margin: 0 -14px;
    }
    .summary-title-main {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .summary-title-note {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      min-width: 0;
      color: var(--muted);
      font-size: .84rem;
      font-weight: 700;
      line-height: 1.45;
      overflow-wrap: anywhere;
    }
    .summary-title-note svg {
      width: 15px;
      height: 15px;
      flex: 0 0 auto;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
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
    .split-summary {
      display: grid;
      gap: 10px;
    }
    .split-person {
      display: grid;
      gap: 6px;
    }
    .split-person-name {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--ink);
      font-weight: 800;
      line-height: 2;
      overflow-wrap: anywhere;
    }
    .split-currency-block {
      display: grid;
      gap: 8px;
    }
    .split-currency-title {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--green);
      font-size: 1rem;
      font-weight: 900;
      line-height: 1.5;
    }
    .split-currency-title svg {
      width: 18px;
      height: 18px;
      flex: 0 0 auto;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }
    .split-calc-details {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f8faf8;
      overflow: hidden;
    }
    .split-calc-details summary {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 40px;
      align-items: center;
      gap: 8px;
      min-height: 42px;
      padding: 0 0 0 10px;
      color: var(--green);
      font-size: .92rem;
      font-weight: 900;
      cursor: pointer;
      list-style: none;
    }
    .split-calc-details summary::-webkit-details-marker {
      display: none;
    }
    .split-calc-details[open] .split-calc-toggle svg {
      transform: rotate(180deg);
    }
    .split-calc-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: var(--green);
    }
    .split-calc-toggle svg {
      width: 18px;
      height: 18px;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
      transition: transform .16s ease;
    }
    .split-calc-body {
      display: grid;
      gap: 8px;
      padding: 0 10px 10px;
    }
    .split-calc-list {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .split-calc-item,
    .split-net-person {
      display: grid;
      gap: 5px;
      padding: 8px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      color: var(--muted);
      font-size: .9rem;
      font-weight: normal;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }
    .split-calc-item-title,
    .split-net-person-name {
      color: var(--ink);
      font-size: .9rem;
      font-weight: 900;
    }
    .split-net-person-name {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .split-net-person-name .member-pill {
      color: var(--ink);
      font-size: .92rem;
      box-shadow: none;
    }
    .split-calc-sublist {
      display: grid;
      gap: 3px;
      margin: 0;
      padding-left: 1rem;
    }
    .member-pill {
      background: #fff;
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: normal;
      box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
      margin: 0 2px;
      white-space: nowrap;
    }
    .amount-emphasis {
      color: #009688;
      white-space: nowrap;
    }
    .member-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      flex: 0 0 auto;
      border-radius: 999px;
      overflow: hidden;
      background: currentColor;
      color: var(--muted);
      box-shadow: rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
    }
    .member-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    .member-avatar svg {
      width: 20px;
      height: 20px;
      stroke: rgb(255 255 255);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      fill: none;
    }
    .member-name {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .split-metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #f8faf8;
    }
    .split-metric {
      min-width: 0;
      padding: 8px;
    }
    .split-metrics .split-metric:nth-child(2) {
      border-left: 1px solid var(--line);
      border-right: 1px solid var(--line);
    }
    .split-metric-label {
      color: var(--muted);
      font-size: .78rem;
      font-weight: 800;
    }
    .split-metric-value {
      margin-top: 3px;
      color: var(--ink);
      font-size: .9rem;
      font-weight: 800;
      overflow-wrap: anywhere;
    }
    .settlement-list {
      display: grid;
      gap: 8px;
      margin-top: 10px;
    }
    .settlement-title {
      display: grid;
      gap: 2px;
      color: var(--green);
      font-size: 1.125rem;
      font-weight: 800;
      padding: 0 16px 0 0;
      line-height: 2;
    }
    .settlement-row {
      display: grid;
      grid-template-columns: minmax(92px, .72fr) minmax(0, 1fr);
      align-items: start;
      gap: 8px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 8px;
      padding-top: 8px;
      background: #f8faf8;
    }
    .settlement-text {
      min-width: 0;
      color: var(--muted);
      font-size: .92rem;
      font-weight: 700;
      line-height: 1.45;
      overflow-wrap: anywhere;
    }
    .settlement-from {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      align-self: center;
      min-width: 0;
      color: var(--ink);
      font-size: .92rem;
      font-weight: 800;
      overflow-wrap: anywhere;
    }
    .settlement-main-wrap {
      display: grid;
      gap: 8px;
      min-width: 0;
    }
    .settlement-main-box {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
      padding: 10px 0;
    }
    .settlement-main {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      align-items: start;
      gap: 8px;
      min-width: 0;
    }
    .settlement-main::before {
      content: "•";
      color: var(--green);
      font-weight: 900;
      line-height: 1.45;
    }
    .settlement-detail {
      margin-top: 3px;
      color: var(--muted);
      font-size: .84rem;
      font-weight: normal;
      line-height: 1.45;
      overflow-wrap: anywhere;
    }
    .settlement-to {
      min-width: 0;
      color: var(--muted);
      font-size: .92rem;
      font-weight: 700;
      overflow-wrap: anywhere;
    }
    .settlement-source {
      min-width: 0;
    }
    .settlement-source summary {
      cursor: pointer;
      color: var(--muted);
      font-size: .84rem;
      font-weight: 800;
      line-height: 1.6;
      list-style-position: inside;
      overflow-wrap: anywhere;
    }
    .settlement-source-list {
      display: grid;
      gap: 6px;
      max-height: 300px;
      margin-top: 8px;
      overflow-y: auto;
      overscroll-behavior: contain;
      padding-right: 2px;
    }
    .settlement-source-row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: 4px 8px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fff;
      padding: 8px;
      color: var(--muted);
      font-size: .82rem;
      font-weight: 700;
      line-height: 1.45;
    }
    .settlement-source-index {
      color: var(--muted);
      font-weight: 900;
      white-space: nowrap;
    }
    .settlement-source-row span,
    .settlement-source-row small {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .settlement-source-row b {
      color: #009688;
      font-weight: 900;
      white-space: nowrap;
    }
    .settlement-source-row small {
      grid-column: 2 / -1;
      color: var(--muted);
      font-size: .78rem;
      font-weight: normal;
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
    @media (max-width: 720px) {
      .grid {
        grid-template-columns: 1fr;
      }
      .expense {
        grid-template-columns: 1fr;
      }
      .expense-title {
        flex-direction: column;
        gap: 5px;
      }
      .expense-body {
        grid-template-columns: 1fr;
      }
      .member-option,
      .member-option.equal-mode,
      .settlement-row {
        grid-template-columns: 1fr;
      }
      .settlement-row {
        border: 0;
        border-radius: 0;
        padding: 0;
        padding-top: 0;
        background: transparent;
      }
      .settlement-main-wrap {
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 12px;
        background: #f8faf8;
      }
      .split-metrics {
        grid-template-columns: 1fr;
      }
      .split-metrics .split-metric:nth-child(2) {
        border-left: none;
        border-right: none;
      }
      .split-person-name,
      .settlement-from {
        text-align: right;
      }
      .split-person-name,
      .settlement-from {
        justify-content: flex-end;
      }
      .settlement-main {
        grid-template-columns: auto minmax(0, 1fr);
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
            <div class="payer-field">
              <label for="payer">付款人</label>
              <select id="payer"></select>
            </div>
            <div class="split-method" aria-label="分攤方式">
              <button id="split-equal" class="active" type="button">平均分攤</button>
              <button id="split-custom" type="button">指定金額</button>
            </div>
            <p class="split-title">分攤成員</p>
            <div id="split-members" class="member-list"></div>
            <p id="split-balance" class="split-balance"></p>
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
          <button id="items-personal" class="active" type="button">個人消費</button>
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
      editingHistoricalSplitMembers: [],
      editingPayerId: "",
      editingPayerName: "",
      splitMethod: "equal",
      editingCustomSplitAmounts: {},
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
      collapsedPersonalOwners: new Set(),
      personalOwnerSortModes: {},
    };
    const currencyMeta = {
      TWD: { label: "台幣", symbol: "NT$" },
      JPY: { label: "日幣", symbol: "¥" },
    };
    const currencyOrder = ["TWD", "JPY"];
    const $ = (id) => document.getElementById(id);
    const editIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>';
    const deleteIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v5"></path><path d="M14 11v5"></path></svg>';
    const infoIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>';
    const circleDollarIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"></path><path d="M12 18V6"></path></svg>';
    const circleUserIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="10" r="3"></circle><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path></svg>';

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
      $("amount").addEventListener("input", updateSplitBalanceNotice);
      $("calendar-grid").addEventListener("click", handleCalendarDay);
      $("add-manual-member").addEventListener("click", addManualMember);
      $("split-members").addEventListener("click", handleMemberAction);
      $("split-members").addEventListener("change", handleMemberSelectionChange);
      $("split-members").addEventListener("input", handleSplitAmountInput);
      $("split-equal").addEventListener("click", () => setSplitMethod("equal"));
      $("split-custom").addEventListener("click", () => setSplitMethod("custom"));
      $("payer").addEventListener("change", handlePayerChange);
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
      $("add-scope-card").classList.add("hidden");
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
      syncEditingSplitStateFromDom();
      const amount = Number($("amount").value.trim());
      const currencyCode = $("currency").value;
      const meta = currencyMeta[currencyCode] || currencyMeta.TWD;
      const payer = selectedPayer();
      return {
        expenseScope: state.addScope,
        date: $("date").value,
        amount,
        currencyCode,
        currencyLabel: meta.label,
        currencySymbol: meta.symbol,
        category: $("category").value,
        note: $("note").value.trim(),
        payerId: payer.userId,
        payerName: payer.displayName,
        createdById: currentUserId(),
        createdByName: currentUserName(),
        createdByPictureUrl: currentUserPictureUrl(),
        splitMethod: state.addScope === "group" ? state.splitMethod : "none",
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
      if (payload.expenseScope === "group" && !payload.payerId) {
        showError("請選擇付款人。");
        return;
      }
      if (payload.expenseScope === "group" && !payload.splitMembers.length) {
        showError("請至少選擇一位分攤成員。");
        return;
      }
      if (payload.expenseScope === "group" && payload.splitMethod === "custom") {
        const total = roundMoney(payload.splitMembers.reduce((sum, member) => sum + (Number(member.amount) || 0), 0));
        if (payload.splitMembers.some((member) => !member.amount || member.amount <= 0)) {
          showError("指定金額分攤需為每位成員輸入大於 0 的金額。");
          return;
        }
        if (Math.abs(total - roundMoney(payload.amount)) > 0.01) {
          showError("指定金額加總需等於消費金額，目前加總為 " + numberText(total) + "。");
          return;
        }
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
        const listScope = listScopeForPayload(payload);
        let result;
        if (state.editingId) {
          result = await api("/api/expenses/" + state.editingId, { method: "PATCH", body: payload });
        } else {
          result = await api("/api/expenses", { method: "POST", body: payload });
        }
        const label = successScopeText(listScope);
        const action = wasEditing ? "已更新" : "已新增";
        setHighlight(result.expense.id, wasEditing ? "updated" : "created");
        setStatus("");
        showToast(action + label + "消費", "success");
        resetForm();
        setListScope(listScope);
        switchTab("items");
      } catch (error) {
        showError(error.message);
      } finally {
        setSaving(false);
      }
    }

    function handleItemAction(event) {
      const ownerToggle = event.target.closest("button[data-owner-toggle]");
      if (ownerToggle) {
        togglePersonalOwner(ownerToggle.dataset.ownerToggle || "");
        return;
      }
      const ownerSort = event.target.closest("button[data-owner-sort]");
      if (ownerSort) {
        setPersonalOwnerSort(ownerSort.dataset.ownerId || "", ownerSort.dataset.ownerSort || "date");
        return;
      }
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
      state.editingHistoricalSplitMembers = splitMembers;
      state.editingPayerId = item.payer_id || "";
      state.editingPayerName = item.payer_name || "";
      state.splitMethod = item.split_method === "custom" ? "custom" : "equal";
      state.editingCustomSplitAmounts = Object.fromEntries(splitMembers.map((member) => [memberId(member), Number(member.amount) || ""]));
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
        const params = new URLSearchParams({ tripId: state.tripId });
        const result = await api("/api/expenses/" + id + "?" + params.toString(), { method: "DELETE" });
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
      await loadExpenses(itemDataScope());
      if (hasGroupLedgerContext()) {
        await loadLedgerMembers();
      }
      renderItems();
    }

    function renderItems() {
      const root = $("items");
      const personalGroupMode = isGroupedPersonalItemView();
      $("view-items").querySelector(".sort-segmented").classList.toggle("hidden", personalGroupMode);
      const items = visibleItemExpenses();
      if (!items.length) {
        root.innerHTML = '<div class="empty">目前沒有' + (state.itemScope === "group" ? "團體" : "個人") + '消費。</div>';
        return;
      }

      if (personalGroupMode) {
        root.innerHTML = renderPersonalOwnerGroups(items);
        return;
      }

      const sections = groupedExpenses(items).map((group) =>
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
      if (state.statsScope === "group") {
        await loadLedgerMembers();
      }
      const root = $("stats");
      if (!state.expenses.length) {
        root.innerHTML = '<div class="empty">目前沒有' + (state.statsScope === "group" ? "團體" : "我的") + '消費統計。</div>';
        return;
      }
      if (state.statsScope === "group") {
        root.innerHTML = renderSplitSummary();
      } else {
        const totals = currencyTotals();
        root.innerHTML = totals.map(renderCurrencySummary).join("");
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
        pictureUrl: currentUserPictureUrl(),
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
        pictureUrl: currentUserPictureUrl(),
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
        syncEditingSplitStateFromDom();
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
      if (!event.target.matches("[data-split-member]")) return;
      const amountInput = splitAmountInput(event.target.dataset.splitMember);
      if (amountInput) amountInput.disabled = !event.target.checked;
      if (state.editingId) {
        state.editingSplitMemberIds = new Set(
          [...document.querySelectorAll("[data-split-member]:checked")].map((input) => input.dataset.splitMember)
        );
      }
      updateSplitBalanceNotice();
    }

    async function deleteLedgerMember(userId, displayName) {
      if (!userId) return;
      if (userId === currentUserId()) {
        showError("目前開啟記帳本的 LINE 成員會自動保留。");
        return;
      }
      const name = displayName || "這位成員";
      const hint = state.splitMethod === "custom"
        ? "刪除後，這位成員在目前修改中的指定金額也會一併移除。"
        : "刪除後，這位成員將從目前帳本移除。";
      if (!confirm("確定刪除分帳成員「" + name + "」？\\n\\n" + hint + "刪除後統計與結算將不再納入此成員。")) return;
      try {
        const params = new URLSearchParams({
          tripId: state.tripId,
          ...ledgerContextPayload(),
        });
        await api("/api/ledger-members/" + encodeURIComponent(userId) + "?" + params.toString(), { method: "DELETE" });
        state.ledgerMembers = state.ledgerMembers.filter((member) => (member.user_id || member.userId) !== userId);
        if (state.editingSplitMemberIds) state.editingSplitMemberIds.delete(userId);
        state.editingHistoricalSplitMembers = state.editingHistoricalSplitMembers.filter((member) => memberId(member) !== userId);
        delete state.editingCustomSplitAmounts[userId];
        renderSplitMembers(null, { preserveSelection: true });
        showToast("已刪除分帳成員：" + name, "success");
      } catch (error) {
        showError(error.message);
      }
    }

    function syncEditingSplitStateFromDom() {
      if (!state.editingId) return;
      const checkedIds = [...document.querySelectorAll("[data-split-member]:checked")].map((input) => input.dataset.splitMember);
      const historicalIds = state.editingHistoricalSplitMembers
        .map(memberId)
        .filter((id) => id && Object.prototype.hasOwnProperty.call(state.editingCustomSplitAmounts, id));
      if (document.querySelector("[data-split-member]")) {
        state.editingSplitMemberIds = new Set([...checkedIds, ...historicalIds]);
      }
      for (const input of document.querySelectorAll("[data-split-amount]")) {
        state.editingCustomSplitAmounts[input.dataset.splitAmount] = input.value;
      }
    }

    function itemDataScope() {
      return hasGroupLedgerContext() ? "group" : state.itemScope;
    }

    function visibleItemExpenses() {
      if (!hasGroupLedgerContext()) return state.expenses;
      return state.expenses.filter((item) => {
        const count = activeSplitMembers(item).length;
        return state.itemScope === "group" ? count > 1 : count <= 1;
      });
    }

    function isGroupedPersonalItemView() {
      return hasGroupLedgerContext() && state.itemScope === "personal";
    }

    function listScopeForPayload(payload) {
      if (!hasGroupLedgerContext() || payload.expenseScope !== "group") return payload.expenseScope;
      return payload.splitMembers.length > 1 ? "group" : "personal";
    }

    function renderPersonalOwnerGroups(items) {
      const groups = personalOwnerGroups(items);
      return '<div class="owner-expense-groups">' + groups.map(renderPersonalOwnerGroup).join("") + '</div>';
    }

    function personalOwnerGroups(items) {
      const groups = new Map();
      for (const item of items) {
        const owner = personalExpenseOwner(item);
        const key = owner.userId || "unknown";
        if (!groups.has(key)) groups.set(key, { owner, items: [] });
        groups.get(key).items.push(item);
      }
      return [...groups.values()].sort((a, b) => String(a.owner.displayName).localeCompare(String(b.owner.displayName), "zh-Hant"));
    }

    function personalExpenseOwner(item) {
      const owner = activeSplitMembers(item)[0];
      if (owner) return owner;
      return { userId: "unknown", displayName: "未選擇" };
    }

    function renderPersonalOwnerGroup(group) {
      const ownerId = group.owner.userId || "unknown";
      const collapsed = state.collapsedPersonalOwners.has(ownerId);
      const sortMode = personalOwnerSortMode(ownerId);
      const sorted = sortPersonalOwnerItems(group.items, sortMode);
      const body = collapsed ? "" :
        '<div class="owner-expense-wrap">' +
          renderPersonalOwnerSort(ownerId, sortMode) +
          '<ol class="expense-list">' + sorted.map((item, index) => renderExpense(item, index, { personalOwnerView: true })).join("") + '</ol>' +
        '</div>';
      return '<section class="owner-expense-group">' +
        '<button class="owner-expense-header" type="button" data-owner-toggle="' + escapeHtml(ownerId) + '" aria-expanded="' + (!collapsed) + '" aria-label="' + escapeHtml((collapsed ? "展開" : "收合") + " " + (group.owner.displayName || "成員") + " 的消費") + '">' +
          '<span class="owner-identity">' + renderMemberAvatar(ownerId, group.owner.displayName) + '<span class="member-name">' + escapeHtml(group.owner.displayName || "未命名成員") + '</span></span>' +
          '<span class="owner-toggle-icon" aria-hidden="true">' + (collapsed ? "＋" : "－") + '</span>' +
        '</button>' +
        body +
      '</section>';
    }

    function renderPersonalOwnerSort(ownerId, mode) {
      return '<div class="sort-segmented" aria-label="成員消費項目排序">' +
        '<button class="' + (mode === "date" ? "active" : "") + '" type="button" data-owner-id="' + escapeHtml(ownerId) + '" data-owner-sort="date">' +
          '<svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2v4"></path><path d="M16 2v4"></path><path d="M3 10h18"></path><rect x="3" y="4" width="18" height="18" rx="2"></rect></svg>' +
          '<span>依日期</span>' +
        '</button>' +
        '<button class="' + (mode === "currency" ? "active" : "") + '" type="button" data-owner-id="' + escapeHtml(ownerId) + '" data-owner-sort="currency">' +
          '<svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6"></path></svg>' +
          '<span>依幣別</span>' +
        '</button>' +
      '</div>';
    }

    function personalOwnerSortMode(ownerId) {
      return state.personalOwnerSortModes[ownerId] === "currency" ? "currency" : "date";
    }

    function sortPersonalOwnerItems(items, mode) {
      return [...items].sort((a, b) => {
        if (mode === "currency") {
          const currency = currencyRank(a.currency_code) - currencyRank(b.currency_code);
          if (currency) return currency;
        }
        const date = String(b.date).localeCompare(String(a.date));
        if (date) return date;
        return Number(b.id) - Number(a.id);
      });
    }

    function togglePersonalOwner(ownerId) {
      if (!ownerId) return;
      if (state.collapsedPersonalOwners.has(ownerId)) {
        state.collapsedPersonalOwners.delete(ownerId);
      } else {
        state.collapsedPersonalOwners.add(ownerId);
      }
      renderItems();
    }

    function setPersonalOwnerSort(ownerId, mode) {
      if (!ownerId) return;
      state.personalOwnerSortModes[ownerId] = mode === "currency" ? "currency" : "date";
      renderItems();
    }

    function groupedExpenses(items = state.expenses) {
      const groups = new Map();
      const sorted = [...items].sort(compareExpenses);
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

    function renderExpense(item, index, options = {}) {
      const meta = renderExpenseMeta(item, options);
      const tag = Number(item.id) === state.highlightedExpenseId
        ? '<span class="expense-tag">' + escapeHtml(state.highlightType === "updated" ? "已更新" : "已新增") + '</span>'
        : "";
      const title = '<span class="expense-seq">' + (index + 1) + '.</span>' +
        '<span class="expense-id">#' + item.id + '</span>' +
        '<span class="expense-category">' + escapeHtml(item.category) + '</span>' +
        '<span class="expense-note">' + escapeHtml(item.note || "無備註") + '</span>';
      const metaHtml = meta ? '<div class="meta">' + meta + '</div>' : "";
      const main = options.personalOwnerView
        ? '<div class="expense-body">' +
            '<div><div class="expense-title-main">' + title + tag + '</div>' + metaHtml + '</div>' +
            '<span class="amount">' + formatAmount(item) + '</span>' +
          '</div>'
        : '<div class="expense-title"><span class="expense-title-main">' + title + tag + '</span><span class="amount">' + formatAmount(item) + '</span></div>' +
          metaHtml;
      return '<li><article class="expense">' +
        '<div class="expense-main">' +
          main +
        '</div>' +
        '<div class="icon-actions">' +
          '<button class="icon-button" type="button" data-action="edit" data-id="' + item.id + '" aria-label="修改" title="修改">' + editIcon + '</button>' +
          '<button class="icon-button danger" type="button" data-action="delete" data-id="' + item.id + '" aria-label="刪除" title="刪除">' + deleteIcon + '</button>' +
        '</div>' +
      '</article></li>';
    }

    function renderExpenseMeta(item, options = {}) {
      if (!isGroupExpense(item)) {
        return "";
      }
      const payer = item.payer_name || "未命名付款人";
      const members = activeSplitMembers(item);
      const memberText = members.length ? members.map((member) => member.displayName || "未命名成員").join("、") : "未選擇";
      const owner = members.length === 1 ? members[0] : null;
      const createdBy = item.created_by_name || "";
      const lines = [];
      if (owner) {
        if (!options.personalOwnerView) lines.push("消費歸屬：" + (owner.displayName || "未命名成員"));
        if (item.payer_id !== owner.userId) lines.push("付款人：" + payer);
      } else {
        lines.push("付款人：" + payer);
        lines.push("分攤成員：" + memberText);
      }
      const roleIds = new Set([item.payer_id || "", owner?.userId || ""].filter(Boolean));
      if (createdBy && item.created_by_id && !roleIds.has(item.created_by_id)) {
        lines.push("記帳者：" + createdBy);
      }
      return '<div class="expense-meta">' +
        lines.map((line) => '<div class="meta-line">' + escapeHtml(line) + '</div>').join("") +
      '</div>';
    }

    function resetForm() {
      state.editingId = null;
      state.editingSplitMemberIds = null;
      state.editingHistoricalSplitMembers = [];
      state.editingPayerId = "";
      state.editingPayerName = "";
      state.splitMethod = "equal";
      state.editingCustomSplitAmounts = {};
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
      return scope === "group" ? "團體" : "個人";
    }

    function currentUserId() {
      return state.profile?.userId || "";
    }

    function currentUserName() {
      return state.profile?.displayName || "Lize";
    }

    function currentUserPictureUrl() {
      return state.profile?.pictureUrl || "";
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

    function setSplitMethod(method) {
      state.splitMethod = method === "custom" ? "custom" : "equal";
      syncSplitMethodButtons();
      renderSplitMembers(null, { preserveSelection: true });
    }

    function syncSplitMethodButtons() {
      $("split-equal").classList.toggle("active", state.splitMethod !== "custom");
      $("split-custom").classList.toggle("active", state.splitMethod === "custom");
    }

    function renderSplitMembers(selectedMembers = null, options = {}) {
      if (!$("split-members")) return;
      syncSplitMethodButtons();
      const selectedIds = selectedMemberIds(selectedMembers);
      const activeMembers = activeLedgerMembers();
      const members = formLedgerMembers(selectedMembers);
      renderPayerOptions(activeMembers);
      if (!options.preserveSelection && !selectedMembers && !state.editingId && currentUserId()) {
        selectedIds.add(currentUserId());
      }
      $("split-members").innerHTML = members.length
        ? members.map((member) =>
            '<div class="member-option' + (state.splitMethod === "custom" ? "" : " equal-mode") + '"><label class="member-check"><input type="checkbox" data-split-member="' + escapeHtml(member.userId) + '"' +
            (selectedIds.has(member.userId) && !member.historical ? " checked" : "") + (member.historical ? " disabled" : "") + '> ' + renderMemberAvatar(member.userId, member.displayName) + '<span class="member-name">' + escapeHtml(member.displayName || "未命名成員") + (member.historical ? "（已刪除）" : "") + '</span></label>' +
            (state.splitMethod === "custom"
              ? '<input class="split-amount" data-split-amount="' + escapeHtml(member.userId) + '" inputmode="decimal" placeholder="金額" value="' + escapeHtml(splitAmountValue(member.userId)) + '"' + (selectedIds.has(member.userId) && !member.historical ? "" : " disabled") + '>'
              : "") +
            renderMemberActions(member) +
            '</div>'
          ).join("")
        : '<div class="meta">群組成員開啟記帳本後，會出現在這裡。</div>';
      updateSplitBalanceNotice();
    }

    function renderMemberActions(member) {
      if (member.userId === currentUserId()) return '<span></span>';
      const buttons = [];
      if (!member.historical) {
        buttons.push('<button class="icon-button danger" type="button" data-member-delete="' + escapeHtml(member.userId) + '" data-member-name="' + escapeHtml(member.displayName || "未命名成員") + '" aria-label="刪除成員" title="刪除成員">' + deleteIcon + '</button>');
      }
      return buttons.length ? '<span class="member-actions">' + buttons.join("") + '</span>' : '<span></span>';
    }

    function normalizedLedgerMembers() {
      const members = activeLedgerMembers().map((member) => ({
        user_id: member.userId,
        display_name: member.displayName,
        picture_url: member.pictureUrl,
      }));
      if (state.editingPayerId && !members.some((member) => (member.user_id || member.userId) === state.editingPayerId)) {
        members.push({ user_id: state.editingPayerId, display_name: state.editingPayerName || "原付款人" });
      }
      const unique = new Map();
      for (const member of members.map((member) => ({
        userId: member.user_id || member.userId,
        displayName: member.display_name || member.displayName || "未命名成員",
        pictureUrl: member.picture_url || member.pictureUrl || "",
      })).filter((member) => member.userId)) {
        unique.set(member.userId, member);
      }
      return [...unique.values()];
    }

    function formLedgerMembers(selectedMembers = null) {
      const active = activeLedgerMembers();
      const activeIds = new Set(active.map((member) => member.userId));
      const historySource = selectedMembers || (state.editingId ? state.editingHistoricalSplitMembers : []);
      const historical = historySource
        .map((member) => ({
          userId: memberId(member),
          displayName: member.displayName || member.display_name || "未命名成員",
          amount: member.amount,
          historical: true,
        }))
        .filter((member) => member.userId && !activeIds.has(member.userId));
      return [...active, ...historical];
    }

    function activeLedgerMembers() {
      const members = [...state.ledgerMembers];
      if (currentUserId() && !members.some((member) => (member.user_id || member.userId) === currentUserId())) {
        members.push({ user_id: currentUserId(), display_name: currentUserName(), picture_url: currentUserPictureUrl() });
      }
      const unique = new Map();
      for (const member of members.map((member) => ({
        userId: member.user_id || member.userId,
        displayName: member.display_name || member.displayName || "未命名成員",
        pictureUrl: member.picture_url || member.pictureUrl || "",
      })).filter((member) => member.userId)) {
        unique.set(member.userId, member);
      }
      return [...unique.values()];
    }

    function renderPayerOptions(members) {
      if (!$("payer")) return;
      const current = state.editingPayerId || $("payer").value || currentUserId();
      $("payer").innerHTML = members.map((member) =>
        '<option value="' + escapeHtml(member.userId) + '"' + (member.userId === current ? " selected" : "") + '>' + escapeHtml(member.displayName) + '</option>'
      ).join("");
      if (members.some((member) => member.userId === current)) {
        $("payer").value = current;
      } else if (members.length) {
        $("payer").value = members[0].userId;
      }
    }

    function selectedPayer() {
      if (state.addScope !== "group") {
        return { userId: currentUserId(), displayName: currentUserName() };
      }
      const payerId = $("payer").value || currentUserId();
      const payer = normalizedLedgerMembers().find((member) => member.userId === payerId);
      return {
        userId: payer?.userId || payerId,
        displayName: payer?.displayName || currentUserName(),
      };
    }

    function handlePayerChange() {
      state.editingPayerId = $("payer").value;
    }

    function handleSplitAmountInput(event) {
      const input = event.target.closest("[data-split-amount]");
      if (!input) return;
      state.editingCustomSplitAmounts[input.dataset.splitAmount] = input.value;
      updateSplitBalanceNotice();
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
      const members = activeLedgerMembers();
      const inputs = [...document.querySelectorAll("[data-split-member]")];
      const checked = inputs.filter((input) => input.checked).map((input) => input.dataset.splitMember);
      const selectedIds = new Set(inputs.length ? checked : [currentUserId()].filter(Boolean));
      return members.filter((member) => selectedIds.has(member.userId)).map((member) => {
        if (state.splitMethod !== "custom") return member;
        return {
          ...member,
          amount: roundMoney(splitAmountValue(member.userId)),
        };
      });
    }

    function splitAmountValue(userId) {
      const input = splitAmountInput(userId);
      const value = input ? input.value : state.editingCustomSplitAmounts[userId];
      return value == null ? "" : String(value);
    }

    function splitAmountInput(userId) {
      return [...document.querySelectorAll("[data-split-amount]")].find((input) => input.dataset.splitAmount === userId) || null;
    }

    function updateSplitBalanceNotice() {
      const root = $("split-balance");
      if (!root) return;
      root.className = "split-balance";
      if (state.addScope !== "group" || state.splitMethod !== "custom") {
        root.textContent = "";
        return;
      }
      const amount = roundMoney(Number($("amount").value) || 0);
      const selected = selectedCustomAmountInputs();
      if (!amount || !selected.length) {
        root.textContent = "";
        return;
      }
      const total = roundMoney(selected.reduce((sum, input) => sum + (Number(input.value) || 0), 0));
      const diff = roundMoney(amount - total);
      if (Math.abs(diff) <= 0.01) {
        root.textContent = "指定金額加總已符合消費金額。";
        root.classList.add("ok");
        return;
      }
      root.textContent = diff > 0
        ? "目前尚差 " + numberText(diff) + " 元未紀錄。"
        : "目前超出 " + numberText(Math.abs(diff)) + " 元。";
      root.classList.add("warning");
    }

    function selectedCustomAmountInputs() {
      return [...document.querySelectorAll("[data-split-member]:checked")]
        .map((input) => splitAmountInput(input.dataset.splitMember))
        .filter((input) => input && !input.disabled);
    }

    function parseSplitMembers(item) {
      try {
        const members = JSON.parse(item.split_members || "[]");
        return Array.isArray(members) ? members.map((member) => ({
          userId: member.userId || member.user_id || "",
          displayName: member.displayName || member.display_name || "未命名成員",
          amount: member.amount == null ? null : Number(member.amount),
        })).filter((member) => member.userId) : [];
      } catch {
        return [];
      }
    }

    function splitText(item) {
      const members = activeSplitMembers(item);
      if (!isGroupExpense(item) || !members.length) return "";
      return '｜分攤：' + members.length + '人' + (item.split_method === "custom" ? "｜指定金額" : "");
    }

    function activeSplitMembers(item) {
      return parseSplitMembers(item).filter((member) => isActiveLedgerMember(member.userId));
    }

    function renderSplitSummary() {
      const summaries = splitSummaries();
      const suggestions = settlementSuggestions();
      const simplifiedSuggestions = simplifiedSettlementSuggestions(summaries);
      if (!summaries.length && !suggestions.length) return "";
      const splitCard = summaries.length
        ? '<section class="summary-card">' +
          '<div class="summary-title">' +
            '<span class="summary-title-main">分帳統計</span>' +
            '<span class="summary-title-note">' + infoIcon + '每個人的支付與分攤總覽。</span>' +
          '</div>' +
          '<div class="split-summary">' + renderSplitCurrencySections(summaries) + '</div>' +
        '</section>'
        : "";
      return splitCard + renderSettlementSuggestions(suggestions, simplifiedSuggestions);
    }

    function renderSplitCurrencySections(summaries) {
      return splitCurrencySections(summaries).map((section) =>
        '<section class="split-currency-block">' +
          '<div class="split-currency-title">' + circleDollarIcon + '<span>' + escapeHtml(section.label) + '</span></div>' +
          renderSplitCalculationDetails(section) +
          renderSplitNetDetails(section) +
        '</section>'
      ).join("");
    }

    function renderMemberAvatar(userId, name) {
      const pictureUrl = memberPictureUrl(userId);
      if (pictureUrl) {
        return '<span class="member-avatar"><img src="' + escapeHtml(pictureUrl) + '" alt="' + escapeHtml(name || "成員") + '" loading="lazy"></span>';
      }
      return '<span class="member-avatar default" aria-hidden="true">' + circleUserIcon + '</span>';
    }

    function memberPictureUrl(userId) {
      const id = String(userId || "");
      if (!id || id.startsWith("manual:")) return "";
      const member = activeLedgerMembers().find((item) => item.userId === id);
      return member?.pictureUrl || "";
    }

    function renderSplitMetric(label, value) {
      return '<div class="split-metric">' +
        '<div class="split-metric-label">' + escapeHtml(label) + '</div>' +
        '<div class="split-metric-value">' + escapeHtml(value) + '</div>' +
      '</div>';
    }

    function renderSplitCalculationDetails(section) {
      const body = section.expenses.length
        ? '<ol class="split-calc-list">' + section.expenses.map(renderSplitCalculationItem).join("") + '</ol>'
        : '<div class="settlement-text">目前沒有可顯示的消費計算。</div>';
      return renderCalcDetails("計算過程", body);
    }

    function renderSplitCalculationItem(item, index) {
      const title = escapeHtml((index + 1) + ". " + item.category + (item.note ? "/" + item.note : "") + " ") + amountEmphasis(moneyText(item.symbol, item.amount));
      const splitLine = item.method === "custom"
        ? '<div>個別分攤：</div><ul class="split-calc-sublist">' + item.allocations.map((allocation) =>
            '<li>' + escapeHtml(allocation.displayName) + ' ' + amountEmphasis(moneyText(item.symbol, allocation.amount)) + '</li>'
          ).join("") + '</ul>'
        : '<div>每人分攤：' + escapeHtml(moneyText(item.symbol, item.amount)) + ' ÷ ' + escapeHtml(String(item.allocations.length)) + ' = ' + amountEmphasis(moneyText(item.symbol, item.allocations[0]?.amount || 0)) + '</div>';
      return '<li class="split-calc-item">' +
        '<div class="split-calc-item-title">' + title + '</div>' +
        '<div>付款人：' + memberPill(item.payerName) + '</div>' +
        '<div>分攤成員：' + escapeHtml(item.allocations.map((allocation) => allocation.displayName).join("、")) + '</div>' +
        splitLine +
      '</li>';
    }

    function renderSplitNetDetails(section) {
      const body = section.people.length
        ? '<div class="split-calc-list">' + section.people.map((person) => renderSplitNetPerson(person, section)).join("") + '</div>'
        : '<div class="settlement-text">目前沒有可顯示的每人淨額。</div>';
      return renderCalcDetails("每人淨額", body);
    }

    function renderSplitNetPerson(person, section) {
      const paidText = moneyText(section.symbol, person.paid);
      const shareText = person.shares.length
        ? person.shares.map((item) => item.label + " " + moneyText(section.symbol, item.amount)).join(" + ") + " = " + moneyText(section.symbol, person.share)
        : moneyText(section.symbol, 0);
      const balanceText = person.balance > 0.01
        ? "應收 " + moneyText(section.symbol, person.balance)
        : person.balance < -0.01
          ? "應付 " + moneyText(section.symbol, Math.abs(person.balance))
          : "已平衡";
      return '<div class="split-net-person">' +
        '<div class="split-net-person-name">' + renderMemberAvatar(person.id, person.name) + memberPill(person.name) + '</div>' +
        '<div>已支付：' + escapeHtml(paidText) + '</div>' +
        '<div>應分攤：' + escapeHtml(shareText) + '</div>' +
        '<div>淨額：' + escapeHtml(paidText) + ' - ' + escapeHtml(moneyText(section.symbol, person.share)) + ' = ' + amountEmphasis(balanceText) + '</div>' +
      '</div>';
    }

    function renderCalcDetails(title, body) {
      return '<details class="split-calc-details">' +
        '<summary><span>' + escapeHtml(title) + '</span><span class="split-calc-toggle" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"></path></svg></span></summary>' +
        '<div class="split-calc-body">' + body + '</div>' +
      '</details>';
    }

    function memberPill(name) {
      return '<span class="member-pill">' + escapeHtml(name || "未命名成員") + '</span>';
    }

    function amountEmphasis(value) {
      return '<b class="amount-emphasis">' + escapeHtml(value) + '</b>';
    }

    function splitSummaries() {
      const people = new Map();
      for (const expense of state.expenses.filter(isGroupExpense)) {
        if (!isActiveLedgerMember(expense.payer_id)) continue;
        const code = expense.currency_code;
        const symbol = expense.currency_symbol || "";
        const amount = Number(expense.amount) || 0;
        const payer = ensurePerson(people, expense.payer_id, expense.payer_name);
        payer.paid[code] = (payer.paid[code] || 0) + amount;
        payer.symbols[code] = symbol;
        payer.labels[code] = expense.currency_label;
        for (const allocation of splitAllocations(expense)) {
          const person = ensurePerson(people, allocation.userId, allocation.displayName);
          person.share[code] = (person.share[code] || 0) + allocation.amount;
          person.symbols[code] = symbol;
          person.labels[code] = expense.currency_label;
        }
      }
      return [...people.values()].map((person) => ({
        id: person.id,
        name: person.name,
        paid: person.paid,
        share: person.share,
        symbols: person.symbols,
        labels: person.labels,
        paidText: currencyMapText(person.paid, person.symbols),
        shareText: currencyMapText(person.share, person.symbols),
        balanceText: currencyBalanceText(person.paid, person.share, person.symbols),
        receivableText: balanceDirectionText(person.paid, person.share, person.symbols, "receivable"),
        payableText: balanceDirectionText(person.paid, person.share, person.symbols, "payable"),
      }));
    }

    function splitCurrencySections(summaries) {
      const sections = new Map();
      const shareDetails = new Map();
      const ensureSection = (code, label, symbol) => {
        if (!sections.has(code)) {
          sections.set(code, {
            code,
            label: label || code,
            symbol: symbol || "",
            expenses: [],
            people: [],
          });
        }
        return sections.get(code);
      };
      const shareKey = (code, userId) => code + "|" + userId;
      for (const expense of state.expenses.filter(isGroupExpense)) {
        if (!isActiveLedgerMember(expense.payer_id)) continue;
        const code = expense.currency_code;
        const symbol = expense.currency_symbol || "";
        const section = ensureSection(code, expense.currency_label, symbol);
        const allocations = splitAllocations(expense);
        if (!allocations.length) continue;
        const label = expense.note || expense.category || "無備註";
        section.expenses.push({
          id: expense.id,
          category: expense.category || "其他",
          note: expense.note || "",
          amount: Number(expense.amount) || 0,
          symbol,
          method: expense.split_method === "custom" ? "custom" : "equal",
          payerName: expense.payer_name || "未命名付款人",
          allocations,
        });
        for (const allocation of allocations) {
          const key = shareKey(code, allocation.userId);
          if (!shareDetails.has(key)) shareDetails.set(key, []);
          shareDetails.get(key).push({
            label,
            amount: allocation.amount,
          });
        }
      }
      for (const person of summaries) {
        const codes = new Set([...Object.keys(person.paid), ...Object.keys(person.share)]);
        for (const code of codes) {
          const section = ensureSection(code, person.labels[code] || code, person.symbols[code] || "");
          const paid = Number(person.paid[code]) || 0;
          const share = Number(person.share[code]) || 0;
          section.people.push({
            id: person.id,
            name: person.name,
            paid: roundMoney(paid),
            share: roundMoney(share),
            balance: roundMoney(paid - share),
            shares: shareDetails.get(shareKey(code, person.id)) || [],
          });
        }
      }
      return [...sections.values()]
        .map((section) => ({
          ...section,
          people: section.people.sort((a, b) => String(a.name).localeCompare(String(b.name), "zh-Hant")),
        }))
        .sort((a, b) => currencyRank(a.code) - currencyRank(b.code));
    }

    function splitAllocations(expense) {
      const members = activeSplitMembers(expense);
      if (!members.length) return [];
      if (expense.split_method === "custom") {
        return members.map((member) => ({
          userId: member.userId,
          displayName: member.displayName,
          amount: roundMoney(member.amount),
        })).filter((member) => member.amount > 0);
      }
      const amount = Number(expense.amount) || 0;
      const share = amount / members.length;
      return members.map((member) => ({
        userId: member.userId,
        displayName: member.displayName,
        amount: share,
      }));
    }

    function ensurePerson(people, id, name) {
      const key = id || name || "unknown";
      if (!people.has(key)) people.set(key, { id: key, name: name || "未命名成員", paid: {}, share: {}, symbols: {}, labels: {} });
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

    function balanceDirectionText(paid, share, symbols, direction) {
      const values = [];
      for (const code of new Set([...Object.keys(paid), ...Object.keys(share)])) {
        const balance = roundMoney((paid[code] || 0) - (share[code] || 0));
        const text = (symbols[code] ? symbols[code] + " " : "") + numberText(Math.abs(balance));
        if (direction === "receivable" && balance > 0.01) values.push(text);
        if (direction === "payable" && balance < -0.01) values.push(text);
      }
      return values.length ? values.join("、") : "0";
    }

    function settlementSuggestions() {
      const groups = new Map();
      for (const expense of state.expenses.filter(isGroupExpense)) {
        const payerId = expense.payer_id || "";
        if (!isActiveLedgerMember(payerId)) continue;
        const payerName = expense.payer_name || "未命名付款人";
        for (const allocation of splitAllocations(expense)) {
          if (!allocation.userId || allocation.userId === payerId || allocation.amount <= 0) continue;
          const key = [allocation.userId, payerId, expense.currency_code].join("|");
          if (!groups.has(key)) {
            groups.set(key, {
              currencyCode: expense.currency_code,
              currencyLabel: expense.currency_label,
              currencySymbol: expense.currency_symbol || "",
              fromUserId: allocation.userId,
              fromName: allocation.displayName,
              toUserId: payerId,
              toName: payerName,
              amount: 0,
              details: [],
            });
          }
          const group = groups.get(key);
          group.amount = roundMoney(group.amount + allocation.amount);
          group.details.push({
            note: expense.note || expense.category || "無備註",
            amount: allocation.amount,
            symbol: expense.currency_symbol || "",
          });
        }
      }
      return [...groups.values()].map((item) => ({
        ...item,
        key: settlementKey(item.currencyCode, item.fromUserId, item.toUserId, item.amount),
      }));
    }

    function simplifiedSettlementSuggestions(summaries) {
      const currencies = new Map();
      for (const person of summaries) {
        const codes = new Set([...Object.keys(person.paid), ...Object.keys(person.share)]);
        for (const code of codes) {
          const balance = roundMoney((person.paid[code] || 0) - (person.share[code] || 0));
          if (Math.abs(balance) <= 0.01) continue;
          if (!currencies.has(code)) {
            currencies.set(code, { debtors: [], creditors: [] });
          }
          const entry = {
            userId: person.id,
            name: person.name,
            currencyCode: code,
            currencyLabel: person.labels[code] || code,
            currencySymbol: person.symbols[code] || "",
            amount: Math.abs(balance),
          };
          if (balance < 0) {
            currencies.get(code).debtors.push(entry);
          } else {
            currencies.get(code).creditors.push(entry);
          }
        }
      }
      const suggestions = [];
      for (const currency of currencies.values()) {
        const debtors = currency.debtors.sort((a, b) => String(a.name).localeCompare(String(b.name), "zh-Hant"));
        const creditors = currency.creditors.sort((a, b) => String(a.name).localeCompare(String(b.name), "zh-Hant"));
        let debtorIndex = 0;
        let creditorIndex = 0;
        while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
          const debtor = debtors[debtorIndex];
          const creditor = creditors[creditorIndex];
          const amount = roundMoney(Math.min(debtor.amount, creditor.amount));
          if (amount > 0.01) {
            suggestions.push({
              currencyCode: debtor.currencyCode,
              currencyLabel: debtor.currencyLabel,
              currencySymbol: debtor.currencySymbol,
              fromUserId: debtor.userId,
              fromName: debtor.name,
              toUserId: creditor.userId,
              toName: creditor.name,
              amount,
              details: [],
              key: settlementKey(debtor.currencyCode, debtor.userId, creditor.userId, amount),
            });
          }
          debtor.amount = roundMoney(debtor.amount - amount);
          creditor.amount = roundMoney(creditor.amount - amount);
          if (debtor.amount <= 0.01) debtorIndex += 1;
          if (creditor.amount <= 0.01) creditorIndex += 1;
        }
      }
      return suggestions;
    }

    function renderSettlementSuggestions(suggestions, simplifiedSuggestions) {
      const title = '<div class="settlement-title">' +
        '<span class="summary-title-main">結算清單</span>' +
        '<span class="summary-title-note">' + infoIcon + '成員間的付款建議與結算依據，已依同幣別淨額簡化付款對象。</span>' +
      '</div>';
      if (!simplifiedSuggestions.length) {
        return '<section class="summary-card">' + title + '<div class="settlement-list"><div class="settlement-text">目前沒有需要結算的差額。</div></div></section>';
      }
      const sorted = [...simplifiedSuggestions].sort((a, b) => {
        const from = String(a.fromName).localeCompare(String(b.fromName), "zh-Hant");
        if (from) return from;
        const to = String(a.toName).localeCompare(String(b.toName), "zh-Hant");
        if (to) return to;
        return currencyRank(a.currencyCode) - currencyRank(b.currencyCode);
      });
      const groups = new Map();
      for (const item of sorted) {
        if (!groups.has(item.fromUserId)) {
          groups.set(item.fromUserId, { fromUserId: item.fromUserId, fromName: item.fromName, items: [] });
        }
        groups.get(item.fromUserId).items.push(item);
      }
      return '<section class="summary-card">' + title + '<div class="settlement-list">' + [...groups.values()].map((group) =>
        '<div class="settlement-row">' +
          '<div class="settlement-from">' + renderMemberAvatar(group.fromUserId, group.fromName) + '<span class="member-name">' + escapeHtml(group.fromName) + '</span></div>' +
          '<div class="settlement-main-wrap">' +
            '<div class="settlement-main-box">' + group.items.map(renderSettlementMain).join("") + '</div>' +
          '</div>' +
        '</div>'
      ).join("") + '</div></section>';
    }

    function renderSettlementMain(item) {
      const detail = settlementDetailText(item);
      return '<div class="settlement-main">' +
        '<div class="settlement-to">' +
          '<div>付給 ' + memberPill(item.toName) + ' ' + amountEmphasis(moneyText(item.currencySymbol, item.amount)) + '</div>' +
          (detail ? '<div class="settlement-detail">' + escapeHtml(detail) + '</div>' : '') +
        '</div>' +
      '</div>';
    }

    function renderSettlementSources(group, suggestions) {
      const sources = settlementSourcesForGroup(group, suggestions);
      if (!sources.length) return "";
      const summary = '相關結算依據（' + sources.length + '筆）';
      return '<details class="settlement-source">' +
        '<summary>' + escapeHtml(summary) + '</summary>' +
        '<div class="settlement-source-list">' +
          sources.map((item, index) => renderSettlementSourceRow(item, index)).join("") +
        '</div>' +
      '</details>';
    }

    function settlementSourcesForGroup(group, suggestions) {
      return suggestions.filter((item) =>
        item.fromUserId === group.fromUserId
      ).sort((a, b) => {
        const currency = currencyRank(a.currencyCode) - currencyRank(b.currencyCode);
        if (currency) return currency;
        return String(a.toName).localeCompare(String(b.toName), "zh-Hant");
      });
    }

    function renderSettlementSourceRow(item, index) {
      return '<div class="settlement-source-row">' +
        '<span class="settlement-source-index">' + escapeHtml(String(index + 1)) + '.</span>' +
        '<span>' + escapeHtml(item.fromName) + ' 應付 ' + escapeHtml(item.toName) + '</span>' +
        '<b>' + escapeHtml(moneyText(item.currencySymbol, item.amount)) + '</b>' +
        '<small>' + escapeHtml(settlementDetailText(item) || "原始分帳明細") + '</small>' +
      '</div>';
    }

    function settlementDetailText(item) {
      const details = Array.isArray(item.details) ? item.details : [];
      if (!details.length) return "";
      return details.map((detail) => {
        const note = detail.note || "無備註";
        const symbol = detail.symbol || item.currencySymbol || "";
        return note + " " + moneyText(symbol, detail.amount);
      }).join(" + ");
    }

    function isActiveLedgerMember(userId) {
      const id = String(userId || "");
      if (!id) return false;
      return activeLedgerMembers().some((member) => member.userId === id);
    }

    function formatAmount(item) {
      return (item.currency_symbol ? item.currency_symbol + " " : "") + numberText(item.amount) + " (" + item.currency_label + ")";
    }

    function moneyText(symbol, amount) {
      return (symbol ? symbol + " " : "") + numberText(amount);
    }

    function settlementKey(currencyCode, fromUserId, toUserId, amount) {
      return [currencyCode, fromUserId, toUserId, roundMoney(amount).toFixed(2)].join("|");
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

    function roundMoney(value) {
      return Math.round((Number(value) || 0) * 100) / 100;
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
