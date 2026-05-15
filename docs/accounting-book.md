# 旅行記帳本規格

## 目標

在 LINE 中快速記錄旅行支出，旅行結束後可以查看每日總額、分類總額、旅程總額，並保留未來多旅程沿用的彈性。

## MVP 範圍

第一版先做文字輸入，不做複雜表單。

支援三個指令：

```text
記帳 120 TRY 午餐 烤肉
記帳 300 TWD 交通 計程車
記帳統計
記帳說明
```

欄位定義：

| 欄位 | 說明 |
| --- | --- |
| `trip_id` | 旅程代號，例如 `2026-05-turkey`。 |
| `date` | 依 LINE 訊息收到當下的旅程時區自動判斷。 |
| `amount` | 金額。 |
| `currency` | 幣別，例如 `TRY`、`TWD`、`EUR`、`USD`。 |
| `category` | 分類，例如餐食、交通、購物、門票、其他。 |
| `note` | 備註，例如烤肉、計程車、紀念品。 |
| `created_at` | 記帳時間。 |

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
  currency TEXT NOT NULL,
  category TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL
);
```

## 回覆格式

成功記帳：

```text
已記帳
日期：2026/05/20
金額：120 TRY
分類：午餐
備註：烤肉
```

統計：

```text
旅行記帳統計
TRY：1,240
TWD：3,500

分類：
餐食：520 TRY
交通：180 TRY
購物：540 TRY
```

## 不在第一版處理

- 自動匯率換算。
- 多人分帳。
- 發票照片辨識。
- 修改、刪除單筆記帳。
- 匯出 CSV。

這些可以在第一版穩定後再加。
