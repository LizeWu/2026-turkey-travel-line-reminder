# LIFF 記帳本設定步驟

## 目前已完成的程式

- `/accounting`：LIFF 記帳本頁面。
- `/api/accounting/config`：提供 LIFF ID 與旅程資訊。
- `/api/expenses`：新增與查詢記帳。
- `/api/expenses/recent`：修改或刪除最近一筆。
- `/api/expenses/stats`：查詢統計。

## Cloudflare D1

建立 D1 database 後，把 binding 加到 `webhook/cloudflare-worker/wrangler.toml`：

```toml
[[d1_databases]]
binding = "ACCOUNTING_DB"
database_name = "lize-tour-accounting"
database_id = "<cloudflare-d1-database-id>"
```

套用 migration：

```bash
cd webhook/cloudflare-worker
npx wrangler d1 migrations apply lize-tour-accounting --remote
```

## LINE LIFF

在 LINE Developers Console 新增 LIFF app：

- Endpoint URL：`https://<worker-url>/accounting`
- Scope：`profile`
- Size：建議 `Full`

取得 LIFF ID 後，在 Cloudflare Worker 設定環境變數：

```text
LINE_LIFF_ID=<line-liff-id>
TRIP_ID=2026-05-turkey
```

## Rich Menu 改成直接開啟 LIFF

產生 Rich Menu 設定時提供 `ACCOUNTING_LIFF_URL`：

```bash
ACCOUNTING_LIFF_URL="https://liff.line.me/<line-liff-id>" python3 tools/create_rich_menu_assets.py
LINE_CHANNEL_ACCESS_TOKEN="你的 Channel access token" python3 tools/create_rich_menu.py
```

完成後，點 Rich Menu 的 `旅行記帳本` 會直接開啟 LIFF 記帳表單。
