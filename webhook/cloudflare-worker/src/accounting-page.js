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
      border-color: transparent;
      background: transparent;
    }
    .member-actions {
      display: inline-flex;
      justify-content: flex-end;
      gap: 4px;
      min-width: 76px;
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
      text-align: right;
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
    .settlement-main {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }
    .settlement-main + .settlement-main {
      padding-top: 8px;
      border-top: 1px solid var(--line);
    }
    .settlement-section-label {
      color: var(--green);
      font-size: .9rem;
      font-weight: 900;
      line-height: 1.45;
    }
    .settlement-net-note {
      color: var(--muted);
      font-size: .78rem;
      font-weight: 700;
      line-height: 1.45;
      overflow-wrap: anywhere;
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
    .settlement-to div b {
      background: #fff;
      padding: 4px 8px;
      border-radius: 12px;
      font-weight: normal;
      box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
      margin: 0 2px;
      white-space: nowrap;
    }
    .settlement-to div span {
      color: #009688;
      white-space: nowrap;
    }
    .settlement-action {
      min-height: 34px;
      padding: 0 10px;
      border-radius: 999px;
      color: var(--green);
      font-size: .86rem;
      white-space: nowrap;
    }
    .settlement-action.settled {
      border-color: var(--green);
      background: var(--green-soft);
    }
    .settlement-source {
      min-width: 0;
      border-top: 1px solid var(--line);
      padding-top: 8px;
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
      .settlement-from {
        font-size: inherit;
        line-height: 2;
      }
      .settlement-main {
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
      settlements: [],
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
    const mergeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 7h8a4 4 0 0 1 0 8h-1"></path><path d="M7 7l-4 4 4 4"></path><path d="M16 17H8a4 4 0 0 1 0-8h1"></path><path d="M17 17l4-4-4-4"></path></svg>';
    const infoIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>';
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
      if (state.statsScope === "group") {
        await loadLedgerMembers();
        await loadSettlements();
      } else {
        state.settlements = [];
      }
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
      const settlementButton = event.target.closest("button[data-settlement-action]");
      if (settlementButton) {
        toggleSettlement(settlementButton);
        return;
      }
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

    async function loadSettlements() {
      if (!hasGroupLedgerContext()) return;
      const params = new URLSearchParams({
        tripId: state.tripId,
        ...ledgerContextPayload(),
      });
      const data = await api("/api/settlements?" + params.toString());
      state.settlements = data.settlements || [];
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
      const mergeButton = event.target.closest("button[data-member-merge]");
      if (mergeButton) {
        event.preventDefault();
        event.stopPropagation();
        mergeLedgerMember(mergeButton.dataset.memberMerge, mergeButton.dataset.memberName || "");
        return;
      }
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
      if (!state.editingId) return;
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
      if (!confirm("確定刪除分帳成員「" + name + "」？\\n\\n若這位成員其實是另一個 LINE 成員，請改用 ID 合併。刪除後統計與結算將不再納入此成員。")) return;
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

    async function mergeLedgerMember(sourceUserId, sourceName) {
      if (!sourceUserId) return;
      const members = normalizedLedgerMembers().filter((member) => member.userId !== sourceUserId);
      if (!members.length) {
        showError("目前沒有可合併的目標成員。");
        return;
      }
      const choices = members.map((member, index) => (index + 1) + ". " + member.displayName).join("\\n");
      const answer = prompt("將「" + (sourceName || "這位成員") + "」合併到哪一位成員？\\n\\n" + choices + "\\n\\n請輸入編號：");
      if (answer == null) return;
      const index = Number(answer.trim()) - 1;
      const target = members[index];
      if (!target) {
        showError("請輸入有效的合併目標編號。");
        return;
      }
      if (!confirm("確認將「" + (sourceName || "來源成員") + "」的歷史付款與分攤資料合併到「" + target.displayName + "」？\\n\\n合併後來源 ID 會從分帳成員中移除，金額不會重新分攤。")) return;
      try {
        await api("/api/ledger-members/" + encodeURIComponent(sourceUserId) + "/merge", {
          method: "POST",
          body: {
            tripId: state.tripId,
            targetUserId: target.userId,
            ...ledgerContextPayload(),
          },
        });
        await loadLedgerMembers();
        await refreshItems();
        await refreshStats();
        showToast("已合併成員到：" + target.displayName, "success");
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
      const meta = renderExpenseMeta(item);
      const tag = Number(item.id) === state.highlightedExpenseId
        ? '<span class="expense-tag">' + escapeHtml(state.highlightType === "updated" ? "已更新" : "已新增") + '</span>'
        : "";
      const title = '<span class="expense-seq">' + (index + 1) + '.</span>' +
        '<span class="expense-id">#' + item.id + '</span>' +
        '<span class="expense-category">' + escapeHtml(item.category) + '</span>' +
        '<span class="expense-note">' + escapeHtml(item.note || "無備註") + '</span>';
      return '<li><article class="expense">' +
        '<div class="expense-main">' +
          '<div class="expense-title"><span class="expense-title-main">' + title + tag + '</span><span class="amount">' + formatAmount(item) + '</span></div>' +
          '<div class="meta">' + meta + '</div>' +
        '</div>' +
        '<div class="icon-actions">' +
          '<button class="icon-button" type="button" data-action="edit" data-id="' + item.id + '" aria-label="修改" title="修改">' + editIcon + '</button>' +
          '<button class="icon-button danger" type="button" data-action="delete" data-id="' + item.id + '" aria-label="刪除" title="刪除">' + deleteIcon + '</button>' +
        '</div>' +
      '</article></li>';
    }

    function renderExpenseMeta(item) {
      if (!isGroupExpense(item)) {
        return "";
      }
      const payer = item.payer_name || "未命名付款人";
      const members = parseSplitMembers(item).map((member) => member.displayName || "未命名成員");
      const memberText = members.length ? members.join("、") : "未選擇";
      return '<div class="expense-meta">' +
        '<div class="meta-line">付款人：' + escapeHtml(payer) + '</div>' +
        '<div class="meta-line">分攤成員：' + escapeHtml(memberText) + '</div>' +
      '</div>';
    }

    function resetForm() {
      state.editingId = null;
      state.editingSplitMemberIds = null;
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
      return scope === "group" ? "團體" : "我的";
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
      const members = normalizedLedgerMembers();
      renderPayerOptions(members);
      if (!options.preserveSelection && !selectedMembers && !state.editingId) {
        members.forEach((member) => selectedIds.add(member.userId));
      }
      $("split-members").innerHTML = members.length
        ? members.map((member) =>
            '<div class="member-option' + (state.splitMethod === "custom" ? "" : " equal-mode") + '"><label class="member-check"><input type="checkbox" data-split-member="' + escapeHtml(member.userId) + '"' +
            (selectedIds.has(member.userId) ? " checked" : "") + '> <span>' + escapeHtml(member.displayName || "未命名成員") + '</span></label>' +
            (state.splitMethod === "custom"
              ? '<input class="split-amount" data-split-amount="' + escapeHtml(member.userId) + '" inputmode="decimal" placeholder="金額" value="' + escapeHtml(splitAmountValue(member.userId)) + '"' + (selectedIds.has(member.userId) ? "" : " disabled") + '>'
              : "") +
            (member.userId === currentUserId()
              ? '<span></span>'
              : '<span class="member-actions"><button class="icon-button" type="button" data-member-merge="' + escapeHtml(member.userId) + '" data-member-name="' + escapeHtml(member.displayName || "未命名成員") + '" aria-label="ID合併" title="ID合併">' + mergeIcon + '</button>' +
                '<button class="icon-button danger" type="button" data-member-delete="' + escapeHtml(member.userId) + '" data-member-name="' + escapeHtml(member.displayName || "未命名成員") + '" aria-label="刪除成員" title="刪除成員">' + deleteIcon + '</button></span>') +
            '</div>'
          ).join("")
        : '<div class="meta">群組成員開啟記帳本後，會出現在這裡。</div>';
    }

    function normalizedLedgerMembers() {
      const members = [...state.ledgerMembers];
      if (currentUserId() && !members.some((member) => member.user_id === currentUserId())) {
        members.push({ user_id: currentUserId(), display_name: currentUserName(), picture_url: currentUserPictureUrl() });
      }
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
      const members = parseSplitMembers(item);
      if (!isGroupExpense(item) || !members.length) return "";
      return '｜分攤：' + members.length + '人' + (item.split_method === "custom" ? "｜指定金額" : "");
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
            '<span class="summary-title-note">' + infoIcon + '每個人的支付與分攤總覽</span>' +
          '</div>' +
          '<div class="split-summary">' + summaries.map(renderSplitPersonSummary).join("") + '</div>' +
        '</section>'
        : "";
      return splitCard + renderSettlementSuggestions(suggestions, simplifiedSuggestions);
    }

    function renderSplitPersonSummary(item) {
      return '<div class="split-person">' +
        '<div class="split-person-name">' + renderMemberAvatar(item.id, item.name) + '<span class="member-name">' + escapeHtml(item.name) + '</span></div>' +
        '<div class="split-metrics">' +
          renderSplitMetric("已支付", item.paidText) +
          renderSplitMetric("應收款項", item.receivableText) +
          renderSplitMetric("應付款項", item.payableText) +
        '</div>' +
      '</div>';
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
      const member = normalizedLedgerMembers().find((item) => item.userId === id);
      return member?.pictureUrl || "";
    }

    function renderSplitMetric(label, value) {
      return '<div class="split-metric">' +
        '<div class="split-metric-label">' + escapeHtml(label) + '</div>' +
        '<div class="split-metric-value">' + escapeHtml(value) + '</div>' +
      '</div>';
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

    function splitAllocations(expense) {
      const members = parseSplitMembers(expense).filter((member) => isActiveLedgerMember(member.userId));
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
        '<span class="summary-title-note">' + infoIcon + '成員間的付款建議與結算依據</span>' +
      '</div>';
      if (!simplifiedSuggestions.length) {
        return '<section class="summary-card">' + title + '<div class="settlement-list"><div class="settlement-text">目前沒有需要結算的差額。</div></div></section>';
      }
      const settled = new Set(state.settlements.map((item) => item.settlement_key));
      const sorted = [...simplifiedSuggestions].sort((a, b) => {
        const from = String(a.fromName).localeCompare(String(b.fromName), "zh-Hant");
        if (from) return from;
        const to = String(a.toName).localeCompare(String(b.toName), "zh-Hant");
        if (to) return to;
        const currency = currencyRank(a.currencyCode) - currencyRank(b.currencyCode);
        if (currency) return currency;
        return Number(settled.has(a.key)) - Number(settled.has(b.key));
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
            '<div class="settlement-section-label">建議付款方式</div>' +
            group.items.map((item) => renderSettlementMain(item, settled.has(item.key))).join("") +
            '<div class="settlement-net-note">已依同幣別淨額簡化付款對象。</div>' +
            renderSettlementSources(group, suggestions) +
          '</div>' +
        '</div>'
      ).join("") + '</div></section>';
    }

    function renderSettlementMain(item, isSettled) {
      const detail = settlementDetailText(item);
      return '<div class="settlement-main">' +
        '<div class="settlement-to">' +
          '<div>付給 <b>' + escapeHtml(item.toName) + '</b> <span>' + escapeHtml(moneyText(item.currencySymbol, item.amount)) + '</span></div>' +
          (detail ? '<div class="settlement-detail">' + escapeHtml(detail) + '</div>' : '') +
        '</div>' +
        '<button class="settlement-action' + (isSettled ? " settled" : "") + '" type="button" data-settlement-action="' + (isSettled ? "unset" : "settle") + '"' +
          ' data-settlement-key="' + escapeHtml(item.key) + '"' +
          ' data-currency-code="' + escapeHtml(item.currencyCode) + '"' +
          ' data-currency-label="' + escapeHtml(item.currencyLabel) + '"' +
          ' data-currency-symbol="' + escapeHtml(item.currencySymbol) + '"' +
          ' data-from-user-id="' + escapeHtml(item.fromUserId) + '"' +
          ' data-from-name="' + escapeHtml(item.fromName) + '"' +
          ' data-to-user-id="' + escapeHtml(item.toUserId) + '"' +
          ' data-to-name="' + escapeHtml(item.toName) + '"' +
          ' data-amount="' + escapeHtml(String(item.amount)) + '">' + (isSettled ? "已結清" : "待結清") + '</button>' +
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
      return normalizedLedgerMembers().some((member) => member.userId === id);
    }

    async function toggleSettlement(button) {
      const action = button.dataset.settlementAction;
      const key = button.dataset.settlementKey;
      if (!key) return;
      button.disabled = true;
      try {
        if (action === "settle") {
          await api("/api/settlements", {
            method: "POST",
            body: {
              tripId: state.tripId,
              currencyCode: button.dataset.currencyCode,
              currencyLabel: button.dataset.currencyLabel,
              currencySymbol: button.dataset.currencySymbol,
              fromUserId: button.dataset.fromUserId,
              fromName: button.dataset.fromName,
              toUserId: button.dataset.toUserId,
              toName: button.dataset.toName,
              amount: Number(button.dataset.amount),
              settledById: currentUserId(),
              settledByName: currentUserName(),
              ...ledgerContextPayload(),
            },
          });
          showToast("已標記結清", "success");
        } else {
          const params = new URLSearchParams({
            tripId: state.tripId,
            ...ledgerContextPayload(),
          });
          await api("/api/settlements/" + encodeURIComponent(key) + "?" + params.toString(), { method: "DELETE" });
          showToast("已取消結清", "success");
        }
        await refreshStats();
      } catch (error) {
        showError(error.message);
      } finally {
        button.disabled = false;
      }
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
