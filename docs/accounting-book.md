# 旅行記帳本規格

## 目標

在 LINE 中快速記錄旅行支出，旅行中可用手機新增、修改、刪除與查看統計；旅行結束後可以整理每日與幣別消費，並保留未來多旅程、共享帳本與分帳的彈性。

## 目前 LIFF 範圍

目前使用 LIFF 小網頁表單，不要求旅行中背指令。

入口：

```text
LINE Rich Menu → 旅行記帳本 → 開啟 LIFF 頁面
```

頁面分頁：

- `我要記帳`：手動新增我的消費或團體消費，含消費日期、金額、幣別、分類、備註。
- `消費項目`：列出我的消費或團體消費，可依日期或幣別切換排序。
- `統計`：區分我的消費與團體消費，顯示幣別消費統計，每個幣別獨立成卡片。

目前功能：

- 新增記帳。
- 消費形式支援 `個人` 與 `團體`。
- 消費日期預設為當日。
- 使用自訂月曆選擇日期，避免 iOS 原生日期欄位寬度問題。
- 每筆消費可用 icon 按鈕修改或刪除。
- 消費項目可切換 `我的消費` / `團體消費`。
- 我的消費只顯示目前 LIFF 使用者建立的個人消費。
- 團體消費依 LINE 群組或多人聊天室建立獨立共享流水帳，並標示付款人。
- 團體分帳採混合成員來源：從該群組開啟過 LIFF 的 LINE 成員會自動加入，也可手動新增尚未綁定 LINE 的旅伴。
- 團體消費可指定付款人；付款人與分攤成員可不同，例如某人先刷卡但不參與分攤。
- 團體統計已有付款、應付與差額雛形；不同幣別分開計算，不做匯率換算，但重新開啟 LIFF 後仍需驗證資料一致性。
- 消費項目可依日期分組，也可切換為依幣別分組。
- 統計頁以幣別卡片呈現總額。
- 統計卡片可展開或收合，展開後以有序清單顯示該幣別的消費項目、金額與日期。
- AI 照片辨識已移除，使用者自行輸入文字。

欄位定義：

| 欄位 | 說明 |
| --- | --- |
| `trip_id` | 旅程代號，例如 `2026-05-turkey`。 |
| `date` | 消費日期，新增時預設為當日，可用月曆手動調整。 |
| `amount` | 金額。 |
| `currency_code` | 內部幣別代碼，例如 `TRY`、`TWD`、`EUR`、`USD`。 |
| `currency_label` | 顯示用幣別，例如里拉、台幣、歐元、美金。 |
| `currency_symbol` | 幣值符號，例如 `₺`、`NT$`、`€`、`US$`。 |
| `category` | 分類，例如餐食、交通、購物、門票、其他。 |
| `note` | 備註，例如烤肉、計程車、紀念品。 |
| `expense_scope` | 消費形式：`personal` 或 `group`。 |
| `ledger_id` | 帳本範圍。個人消費為 `personal:<userId>`；團體消費為 `group:<groupId>` 或 `room:<roomId>`，並與 `trip_id` 一起決定實際帳本。 |
| `payer_id` | 實際付款人 ID，團體消費可從分帳成員中選擇。 |
| `payer_name` | 實際付款人顯示名稱。 |
| `created_by_id` | 建立或修改這筆紀錄的 LIFF 使用者 ID。 |
| `created_by_name` | 建立或修改這筆紀錄的 LIFF 使用者顯示名稱。 |
| `split_method` | 分帳方式雛形，目前團體消費規劃使用 `equal`，個人消費為 `none`。 |
| `split_members` | 分攤成員 JSON，包含 LINE userId 或 `manual:<id>` 與 displayName；不會自動包含付款人。 |
| `chat_type` | `user`、`group` 或 `room`。 |
| `chat_id` | 個人 LINE user ID、LINE group ID 或 room ID。 |
| `created_at` | 記帳時間。 |
| `updated_at` | 修改時間。 |
| `deleted_at` | 軟刪除時間。 |

## 建議儲存方式

使用 Cloudflare D1。

原因：

- Mac 關機也能使用。
- 與目前 Cloudflare Worker webhook 同平台。
- 適合小型個人記帳資料。
- 不需要額外架伺服器。

資料表草案：

```sql
CREATE TABLE expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id TEXT NOT NULL,
  date TEXT NOT NULL,
  amount REAL NOT NULL,
  currency_code TEXT NOT NULL,
  currency_label TEXT NOT NULL,
  currency_symbol TEXT,
  category TEXT NOT NULL,
  note TEXT,
  payer_id TEXT,
  payer_name TEXT,
  chat_type TEXT NOT NULL DEFAULT 'user',
  chat_id TEXT,
  expense_scope TEXT NOT NULL DEFAULT 'personal',
  ledger_id TEXT,
  created_by_id TEXT,
  created_by_name TEXT,
  split_method TEXT NOT NULL DEFAULT 'none',
  split_members TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT
);
```

多人帳本成員表：

```sql
CREATE TABLE ledger_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  chat_type TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  UNIQUE (trip_id, ledger_id, user_id)
);
```

群組目前旅程設定表：

```sql
CREATE TABLE group_trip_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_type TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  active_trip_id TEXT NOT NULL,
  updated_by_user_id TEXT,
  updated_at TEXT NOT NULL,
  UNIQUE (chat_type, chat_id)
);
```

團體帳本歸屬規則：

```text
trip_id + LINE groupId/roomId = 同一本團體帳本
```

例如同一個 LINE 群組這次去和歌山、下次去東京，會分別形成不同旅程帳本，不會混用消費紀錄。

## LIFF 顯示格式

成功記帳狀態：

```text
已記帳 #9，NT$ 500 (台幣)
```

消費項目：

```text
2026/05/16

1. 玩具賽車模型       NT$ 500 (台幣)
#9 購物
```

團體消費項目：

```text
2026/05/16

1. 晚餐       ₺ 800 (里拉)
#12 餐食｜付款人：Bill
```

統計：

```text
幣別消費統計

里拉目前消費 ₺ 1,240
  1. 2026/05/20｜餐食｜₺ 520 (里拉)
  2. 2026/05/21｜交通｜₺ 180 (里拉)
```

團體統計展開後會顯示付款人：

```text
1. 2026/05/20｜餐食｜₺ 520 (里拉)｜付款人：Bill
```

分帳統計目前為雛形；付款人與分攤成員已可分開，下一步需在 LINE 群組中確認付款、應付與差額符合實際情境。

## 不在第一版處理

- 自動匯率換算。
- 自動抓取完整 LINE 群組成員名單。
- 指定金額分攤、結算狀態、誰該轉帳給誰。
- LINE id token 強驗證與離開群組後的自動撤權。
- 發票照片辨識或 AI 圖片辨識。
- 匯出 CSV。

這些可以在第一版穩定後再加。

## 目前實作檔案

| 檔案 | 功能 |
| --- | --- |
| `webhook/cloudflare-worker/src/accounting-page.js` | LIFF 記帳本頁面。 |
| `webhook/cloudflare-worker/src/index.js` | 記帳 API、D1 讀寫、統計、指定項目修改與刪除。 |
| `webhook/cloudflare-worker/migrations/0001_create_expenses.sql` | D1 資料表 migration。 |
| `webhook/cloudflare-worker/migrations/0002_add_expense_scope.sql` | 新增個人/團體消費 scope 與共享 ledger 欄位。 |
| `webhook/cloudflare-worker/migrations/0003_add_ledger_members.sql` | 新增群組帳本成員表。 |
| `webhook/cloudflare-worker/migrations/0004_add_split_fields.sql` | 新增分帳方式與分攤成員欄位。 |
