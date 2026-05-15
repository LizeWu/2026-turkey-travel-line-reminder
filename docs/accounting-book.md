# 旅行記帳本規格

## 目標

在 LINE 中快速記錄旅行支出，旅行結束後可以查看每日總額、分類總額、旅程總額，並保留未來多旅程沿用的彈性。

## LIFF MVP 範圍

第一版改為 LIFF 小網頁表單，不要求旅行中背指令。

入口：

```text
LINE Rich Menu → 旅行記帳本 → 開啟 LIFF 頁面
```

頁面功能：

- 新增記帳。
- 今日記帳列表。
- 記帳統計。
- 修改最近一筆。
- 刪除最近一筆。

欄位定義：

| 欄位 | 說明 |
| --- | --- |
| `trip_id` | 旅程代號，例如 `2026-05-turkey`。 |
| `date` | 依 LINE 訊息收到當下的旅程時區自動判斷。 |
| `amount` | 金額。 |
| `currency_code` | 內部幣別代碼，例如 `TRY`、`TWD`、`EUR`、`USD`。 |
| `currency_label` | 顯示用幣別，例如里拉、台幣、歐元、美金。 |
| `currency_symbol` | 幣值符號，例如 `₺`、`NT$`、`€`、`US$`。 |
| `category` | 分類，例如餐食、交通、購物、門票、其他。 |
| `note` | 備註，例如烤肉、計程車、紀念品。 |
| `payer_id` | LIFF 取得的 LINE 使用者 ID，未來群組分帳會使用。 |
| `payer_name` | LIFF 取得的 LINE 顯示名稱。 |
| `chat_type` | 預留欄位：`user` 或 `group`。 |
| `chat_id` | 預留欄位：個人或群組 ID。 |
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
  created_at TEXT NOT NULL,
  updated_at TEXT,
  deleted_at TEXT
);
```

## LIFF 顯示格式

成功記帳：

```text
已記帳
日期：2026/05/20
金額：120 里拉（₺）
分類：午餐
備註：烤肉
```

統計：

```text
旅行記帳統計
里拉：1,240
台幣：3,500

分類：
餐食 / 里拉：520
交通 / 里拉：180
購物 / 台幣：540
```

## 不在第一版處理

- 自動匯率換算。
- 多人分帳。
- 發票照片辨識。
- 匯出 CSV。

這些可以在第一版穩定後再加。

## 目前實作檔案

| 檔案 | 功能 |
| --- | --- |
| `webhook/cloudflare-worker/src/accounting-page.js` | LIFF 記帳本頁面。 |
| `webhook/cloudflare-worker/src/index.js` | 記帳 API、D1 讀寫、統計、修改最近一筆、刪除最近一筆。 |
| `webhook/cloudflare-worker/migrations/0001_create_expenses.sql` | D1 資料表 migration。 |
