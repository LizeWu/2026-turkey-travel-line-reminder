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

- `我要記帳`：手動新增消費，含消費日期、金額、幣別、分類、備註。
- `消費項目`：列出所有消費，可依日期或幣別切換排序。
- `統計`：顯示幣別消費統計，每個幣別獨立成卡片。

目前功能：

- 新增記帳。
- 消費日期預設為當日。
- 使用自訂月曆選擇日期，避免 iOS 原生日期欄位寬度問題。
- 每筆消費可用 icon 按鈕修改或刪除。
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

統計：

```text
幣別消費統計

里拉目前消費 ₺ 1,240
  1. 2026/05/20｜餐食｜₺ 520 (里拉)
  2. 2026/05/21｜交通｜₺ 180 (里拉)
```

## 不在第一版處理

- 自動匯率換算。
- 多人分帳。
- 發票照片辨識或 AI 圖片辨識。
- 匯出 CSV。

這些可以在第一版穩定後再加。

## 目前實作檔案

| 檔案 | 功能 |
| --- | --- |
| `webhook/cloudflare-worker/src/accounting-page.js` | LIFF 記帳本頁面。 |
| `webhook/cloudflare-worker/src/index.js` | 記帳 API、D1 讀寫、統計、指定項目修改與刪除。 |
| `webhook/cloudflare-worker/migrations/0001_create_expenses.sql` | D1 資料表 migration。 |
