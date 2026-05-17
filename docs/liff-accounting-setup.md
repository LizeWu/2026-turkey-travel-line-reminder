# LIFF 記帳本設定步驟

## 目前已完成的程式

- `/accounting`：LIFF 記帳本頁面。
- `/api/accounting/config`：提供 LIFF ID 與旅程資訊。
- `/api/expenses`：新增與查詢記帳。
- `/api/expenses/:id`：修改或刪除指定記帳項目。
- `/api/expenses/recent`：修改或刪除最近一筆，保留作為相容 API；目前 LIFF UI 主要使用指定項目修改/刪除。
- `/api/expenses/stats`：查詢統計。

目前 LIFF 頁面包含：

- `我要記帳`：用 toggle 新增我的消費或團體消費，含自訂月曆日期選擇。
- `消費項目`：可切換我的消費或團體消費，依日期或幣別分組，並提供修改/刪除 icon。
- `統計`：可切換我的消費或團體消費，幣別卡片可展開查看明細。

多人記帳第一階段採用群組帳本：

- `個人`：只列出目前 LIFF 使用者自己的消費。
- `團體`：依 LINE `groupId` 或 `roomId` 建立獨立共享團體消費，並顯示付款人。
- 若不是從 LINE 群組或多人聊天室開啟，團體帳本會提示需從群組開啟。
- 團體分帳已完成 UI 與資料欄位雛形，可選擇分帳成員；目前成員需先從該群組開啟過記帳本，才會穩定出現在名單。
- 曾嘗試透過 LINE Messaging API 自動同步完整群組成員，但目前測試會回傳 `LINE member IDs failed: 400`，暫時不能依賴自動抓完整群組名單。
- 團體統計已有付款、應付與差額雛形；不同幣別分開計算，但重新開啟 LIFF 後仍需確認資料一致性。
- 尚未實作指定金額分攤、結算狀態或自動產生誰該轉帳給誰。

已移除 AI 照片辨識，Worker 程式不再使用 `OPENAI_API_KEY`。

## Cloudflare D1

建立 D1 database 後，把 binding 加到 `webhook/cloudflare-worker/wrangler.toml`：

```toml
[[d1_databases]]
binding = "ACCOUNTING_DB"
database_name = "lize-tour-accounting"
database_id = "<cloudflare-d1-database-id>"
```

目前 production D1：

```text
database_name = "lize-tour-accounting"
database_id = "10a439ff-7a2c-4056-b2f0-eed34047ebfc"
```

套用 migration：

```bash
cd webhook/cloudflare-worker
npx wrangler d1 migrations apply lize-tour-accounting --remote
```

若新增多人記帳欄位，部署前請先套用 migration：

```bash
cd webhook/cloudflare-worker
npx wrangler d1 migrations apply lize-tour-accounting --remote
npm run deploy
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

## 分享給同行朋友

LINE Official Account：

```text
阿珠媽旅行提醒
@435uwhmo
```

加好友連結：

```text
https://lin.ee/tqlXqAmN
```

分享小卡：

```text
generated/share-card/azuma-line-share-card.png
```
