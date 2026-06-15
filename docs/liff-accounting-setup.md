# LIFF 記帳本設定步驟

## 目前已完成的程式

- `/accounting`：LIFF 記帳本頁面。
- `/api/accounting/config`：提供 LIFF ID 與旅程資訊。
- `/api/expenses`：新增與查詢記帳。
- `/api/expenses/:id`：修改或刪除指定記帳項目。
- `/api/expenses/recent`：修改或刪除最近一筆，保留作為相容 API；目前 LIFF UI 主要使用指定項目修改/刪除。
- `/api/expenses/stats`：查詢統計。
- `/api/ledger-members`：查詢團體分帳成員；POST 可手動新增未綁定 LINE 的旅伴。
- `/api/settlements`：既有團體分帳結算狀態 API；目前 LIFF 前端不提供待結清 / 已結清操作。

目前 LIFF 頁面包含：

- `我要記帳`：用 toggle 新增我的消費或團體消費，含自訂月曆日期選擇。
- `消費項目`：可切換我的消費或團體消費，依日期或幣別分組，並提供修改/刪除 icon。
- `統計`：可切換我的消費或團體消費，幣別卡片可展開查看明細。

多人記帳第一階段採用群組帳本：

- `個人`：只列出目前 LIFF 使用者自己的消費。
- `團體`：依 LINE `groupId` 或 `roomId` 建立獨立共享團體消費，並顯示付款人。
- 若不是從 LINE 群組或多人聊天室開啟，團體帳本會提示需從群組開啟。
- 團體分帳採混合成員來源：已從該群組開啟 LIFF 的 LINE 成員會自動加入，也可手動新增旅伴。
- 團體消費可指定付款人；付款人與分攤成員可不同，付款人不會被自動加入分攤成員。
- 不再依賴 LINE Messaging API 自動同步完整群組成員；這條路曾回傳 `LINE member IDs failed: 400`，不適合作為主要流程。
- 群組呼叫阿珠媽時，記帳本 LIFF 連結會帶上 `trip` 與群組 context，例如 `https://liff.line.me/<line-liff-id>?trip=2026-05-turkey&chatType=group&groupId=<line-group-id>`。
- LIFF 頁面優先使用 LINE context；若重新開啟時 LINE context 不完整，會 fallback 使用 URL 上的 `groupId` / `roomId`，避免查到空的團體帳本。
- 團體帳本以 `trip_id + groupId/roomId` 判定，因此同一個 LINE 群組可在不同旅程擁有不同帳本。
- 群組情境中的 `我的消費` 也依群組或多人聊天室隔離；同一使用者在不同 LINE 群組不會共用 `我的消費`。
- 團體消費支援平均分攤與指定金額分攤；指定金額會檢查加總需等於消費金額。
- 團體統計已支援付款、應付、差額、計算過程、每人淨額與誰欠誰建議；不同幣別分開計算，不做匯率換算。
- LINE id token 強驗證與離開群組後撤權保留到之後第三階段。
- `統計 > 團體消費` 另新增 `幣別淨額` 區塊的規劃已取消。

開發測試：

- Worker 目前預設 `TRIP_ID=dev-sandbox`，LIFF 記帳開發測試會寫入 `開發沙盒旅程` 帳本。
- `config.json` 仍指向 `trips/2026-05-turkey.json`，行程提醒資料不受 `dev-sandbox` 影響。
- 可用 GitHub Actions `Accounting maintenance` workflow 清理指定 trip 的 remote D1 測試資料。

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

目前多人帳本相關 migration：

- `0003_add_ledger_members.sql`：團體帳本成員。
- `0004_add_split_fields.sql`：分帳方式與分帳成員欄位。
- `0005_add_group_trip_settings.sql`：群組目前啟用旅程設定。
- `0006_create_settlements.sql`：團體分帳結算狀態。
- `0007_add_ledger_member_picture_url.sql`：團體帳本成員 LINE 頭貼網址。

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
