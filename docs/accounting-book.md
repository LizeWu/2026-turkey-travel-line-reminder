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
- 團體消費支援平均分攤與指定金額分攤；指定金額分攤會檢查每位成員金額加總是否等於消費金額。
- 團體統計支援付款、應付、差額、誰欠誰建議與結算狀態；不同幣別分開計算，不做匯率換算。
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
| `ledger_id` | 帳本範圍。一對一個人消費為 `personal:<userId>`；群組中的個人消費為 `personal:group:<groupId>:user:<userId>`；多人聊天室中的個人消費為 `personal:room:<roomId>:user:<userId>`；團體消費為 `group:<groupId>` 或 `room:<roomId>`，並與 `trip_id` 一起決定實際帳本。 |
| `payer_id` | 實際付款人 ID，團體消費可從分帳成員中選擇。 |
| `payer_name` | 實際付款人顯示名稱。 |
| `created_by_id` | 建立或修改這筆紀錄的 LIFF 使用者 ID。 |
| `created_by_name` | 建立或修改這筆紀錄的 LIFF 使用者顯示名稱。 |
| `split_method` | 分帳方式：個人消費為 `none`，團體消費可為 `equal` 或 `custom`。 |
| `split_members` | 分攤成員 JSON，包含 LINE userId 或 `manual:<id>` 與 displayName；`custom` 時也包含該成員指定分攤金額；不會自動包含付款人。 |
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

結算狀態表：

```sql
CREATE TABLE settlements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id TEXT NOT NULL,
  ledger_id TEXT NOT NULL,
  chat_type TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  settlement_key TEXT NOT NULL,
  currency_code TEXT NOT NULL,
  currency_label TEXT NOT NULL,
  currency_symbol TEXT,
  from_user_id TEXT NOT NULL,
  from_name TEXT,
  to_user_id TEXT NOT NULL,
  to_name TEXT,
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'settled',
  settled_by_id TEXT,
  settled_by_name TEXT,
  settled_at TEXT NOT NULL,
  updated_at TEXT,
  note TEXT,
  UNIQUE (trip_id, ledger_id, settlement_key)
);
```

`settlement_key` 由幣別、付款人、收款人與金額組成；如果消費紀錄修改導致結算建議金額改變，會形成新的待結算建議，避免舊狀態錯套到新金額。

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

團體統計中的 `分帳統計` 顯示：

- 成員摘要：付款、應付、差額。
- 誰欠誰建議：依幣別分開計算，例如 `A 付給 B NT$ 300`。
- 結算狀態：每筆建議可標記 `已結清`，也可取消結清回到待結算。

群組情境中的 `我的消費` 也需依 LINE 群組或多人聊天室隔離：

- 從 LINE 群組開啟時，`我的消費` 使用 `personal:group:<groupId>:user:<userId>`。
- 從 LINE 多人聊天室開啟時，`我的消費` 使用 `personal:room:<roomId>:user:<userId>`。
- 一對一個人使用時，`我的消費` 才使用 `personal:<userId>`。
- 因此同一使用者在 A/B/C 不同 LINE 群組中的 `我的消費` 不會互相顯示。
- 針對舊資料相容，系統明確鎖定 `dev-sandbox` 的 LINE 群組 `C87ffe42ff346bc573d7eb45a9cbec853`；從該群組查看 `我的消費` 時，會把該使用者舊的全域 personal 消費搬到該群組 personal ledger。

分帳成員身份管理：

- 手動新增成員與 LINE 自動加入成員永遠不自動判定為同一人。
- 若兩個 ID 其實是同一位旅伴，需由使用者執行 `ID合併`。
- `ID合併` 會把來源成員的歷史付款人與分攤成員 ID 改成目標成員 ID；指定金額與平均分攤金額不重新分攤。
- `刪除` 只代表該成員不再參與目前帳本；統計與結算會排除 inactive 成員。

## 不在第一版處理

- 自動匯率換算。
- 自動抓取完整 LINE 群組成員名單。
- LINE id token 強驗證與離開群組後的自動撤權，預計保留到之後第三階段。
- `統計 > 團體消費` 另新增 `幣別淨額` 區塊的規劃已取消。
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
| `webhook/cloudflare-worker/migrations/0006_create_settlements.sql` | 新增團體分帳結算狀態表。 |
| `webhook/cloudflare-worker/migrations/0007_add_ledger_member_picture_url.sql` | 新增群組帳本成員 LINE 頭貼網址。 |
