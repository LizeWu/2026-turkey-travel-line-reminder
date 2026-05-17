# Worklog

## 2026-05-18

### 今日完成

- 修正 Rich Menu `今日行程` / `明日行程` 的選日邏輯：
  - 原本 Worker 逐一使用每個 itinerary day 的時區計算相對日期，容易在旅程開始前或跨時區時找不到對應行程。
  - 改為先判斷目前是否落在某個旅行日；若尚未落在旅行日，使用旅程預設時區 `Asia/Taipei` 作為基準。
  - 5/17 晚上點 `明日行程` 會對應到 2026-05-18 Day 1。

### 已驗證

- `node --check src/index.js` 通過。
- `npm run build:data` 通過。
- 本機模擬：
  - `2026-05-17T13:00:00Z` 對應台灣 5/17 21:00，`明日行程` 會選到 `2026-05-18`。
  - 5/18 當天 `今日行程` 會選到 `2026-05-18`，`明日行程` 會選到 `2026-05-19`。

## 2026-05-17

### 今日完成

- 建立多人記帳第一階段：
  - `我要記帳`、`消費項目`、`統計` 皆支援 `我的消費` / `團體消費`。
  - 個人一對一開啟 LIFF 時隱藏 `我的消費` / `團體消費` toggle，固定為個人記帳。
  - 從 LINE 群組或多人聊天室開啟時顯示 toggle，並預設切到 `團體消費`。
- 建立群組帳本隔離：
  - 團體帳本改用 LINE `groupId` / `roomId` 產生 ledger。
  - 不同 LINE 群組會對應不同團體帳本。
  - 不是從群組或多人聊天室開啟時，不允許使用團體消費。
- 新增 D1 migration：
  - `0002_add_expense_scope.sql`：新增個人/團體消費 scope 與 ledger 欄位。
  - `0003_add_ledger_members.sql`：新增群組帳本成員表。
  - `0004_add_split_fields.sql`：新增分帳方式與分帳成員欄位。
- 調整 LINE 群組呼叫方式：
  - 新增記帳本呼叫關鍵字：`阿珠`、`阿珠媽`、`珠珠`、`豬豬`、`記帳本`、`記帳`。
  - 群組中輸入關鍵字後，阿珠媽回覆 LIFF 連結。
  - `wrangler.toml` 補上 `LINE_LIFF_ID=2010099376-ZFLjEHk4`，避免回覆一般 Worker URL。
- 調整 LIFF UI：
  - `消費項目` 控制區拆成兩個區塊：範圍 toggle 與排序/清單卡片。
  - `我要記帳` 的團體/個人 toggle 移到表單卡片外。
  - `統計` 套用與 `消費項目` 一致的 toggle。
  - 移除 `統計` 上方 `幣別消費統計` 標題。
- 嘗試開發多人分帳第一版：
  - 團體記帳加入 `分帳成員` 區塊。
  - 使用複選項目選擇分帳成員。
  - 團體記帳至少需選一位分帳成員。
  - 統計頁加入分帳統計雛形：付款、應付、差額。
- 同步修正文件狀態：
  - `LizeNext.md` 已改為目前接手用摘要。
  - `docs/accounting-book.md` 與 `docs/liff-accounting-setup.md` 已標明分帳仍是雛形，尚未穩定完成。

### 今日已測試

- Cloudflare Worker deploy 成功，並確認 variables：
  - `TRIP_ID`
  - `LINE_LIFF_ID`
  - `WORKER_BASE_URL`
- 遠端 D1 migration 已成功套用至 `0003_add_ledger_members.sql`。
- `0004_add_split_fields.sql` 已建立，但 remote D1 是否已套用仍需下次確認。
- LINE Login channel 從 Developing 調整後，朋友可開啟 LIFF。
- 阿珠媽可被加入 LINE 群組。
- 群組中輸入 `阿珠` / `珠珠` 可呼叫阿珠媽回覆 LIFF 連結。
- 從群組 LIFF 開啟後可看到團體消費 UI。
- 個人一對一使用時，團體消費 toggle 會隱藏。

### 尚未完成 / 已知問題

- 分帳功能尚未調整成功。
- 目前 `分帳成員` 仍只穩定顯示開啟 LIFF 的使用者本人。
- 嘗試用 LINE Messaging API 同步群組成員時，畫面診斷顯示：
  - `群組 context：group`
  - `成員 1 人`
  - `LINE 同步 0 人`
  - `LINE member IDs failed: 400`
- 因此目前不能依賴 bot 自動抓完整群組成員。
- 暫定可行規則：
  - 誰從該 LINE 群組點過 LIFF 記帳本，誰才會進入分帳成員名單。
  - 但這個流程仍需再確認與優化。
- 重新開啟 LIFF 後，`統計 > 團體消費` 曾出現資料消失的畫面；已移除前端 `loadingExpenses` 擋板，但仍需後續實測確認。

### 下一步

1. 先穩定群組成員加入分帳名單的流程。
2. 評估是否改採「手動新增分帳成員暱稱」作為第一版，避免受 LINE 群組成員 API 限制。
3. 移除或隱藏目前暫時加入的成員同步診斷文字。
4. 再繼續處理分帳統計：
   - 付款
   - 應付
   - 差額
   - 誰應該付給誰
5. 測試穩定後再 commit / push。

## 2026-05-16

### 今日完成

- 接續公司筆電開發成果，在家中 Mac Studio 完成 Cloudflare Wrangler token 登入與部署流程確認。
- 確認 Cloudflare D1 binding 設定：
  - Database：`lize-tour-accounting`
  - Binding：`ACCOUNTING_DB`
  - Database ID：`10a439ff-7a2c-4056-b2f0-eed34047ebfc`
- 調整 LIFF `旅行記帳本` 資訊架構：
  - 移除 `今日` 分頁。
  - 將 `新增` 改為 `我要記帳`。
  - 將 `統計` 原本的位置調整為 `消費項目`。
  - 新增獨立 `統計` 分頁。
- 調整 `我要記帳`：
  - 新增消費日期欄位，預設為當日。
  - 改用自訂月曆選擇器，避開 iOS 日期欄位寬度凸出的問題。
  - 移除新增畫面的刪除、修改按鈕。
  - 移除 AI 照片辨識功能。
  - 移除 `拍照辨識`、`選照片辨識` 兩個入口。
- 調整 `消費項目`：
  - 以消費日期分組顯示。
  - 支援依日期、依幣別切換排序。
  - 每筆消費加入 icon 形式的修改與刪除按鈕。
  - 金額格式改為 `NT$ 金額 (台幣)`、`₺ 金額 (里拉)`。
  - 每筆項目顯示調整為：
    - 上排：`1. 備註文字    NT$ 金額 (台幣)`，粗黑。
    - 下排：`#9 購物`，較小灰字。
- 調整 `統計`：
  - 新增 `幣別消費統計` 次標題。
  - 次標題獨立放在卡片外。
  - 每個幣別獨立成一張卡片。
  - 卡片標題移除序號，例如 `里拉目前消費 ₺ 120`。
  - 卡片可用 icon 按鈕展開或收合。
  - 展開後的消費項目用有序清單呈現，包含日期、分類、金額。
- 移除後端 AI 相關功能：
  - 移除 `/api/accounting/analyze-photo`。
  - 移除 OpenAI Vision 呼叫與解析邏輯。
  - 確認程式碼不再使用 `OPENAI_API_KEY`。
- 協助建立阿珠媽分享入口：
  - 取得 LINE 加好友連結：`https://lin.ee/tqlXqAmN`
  - 下載 LINE 官方加入好友行動條碼。
  - 製作分享小卡：
    - `generated/share-card/azuma-line-share-card.png`
    - `generated/share-card/azuma-line-share-card.svg`
  - 手機掃描小卡 QR Code 測試成功。

### 今日已測試

- `npx wrangler whoami` 使用 Cloudflare API token 成功。
- `npm run deploy` 成功部署 Worker。
- 手機 LINE 可開啟更新後的 LIFF 記帳本。
- `我要記帳` 日期欄位對齊正常，並保有月曆功能。
- `消費項目` 分組、排序、修改、刪除 icon 顯示正常。
- `統計` 幣別卡片與展開/收合功能可用。
- `node --check src/accounting-page.js` 通過。
- `node --check src/index.js` 通過。
- `npm run build:data` 通過。
- LINE 加好友連結與 QR Code 掃描成功。

### 重要設定

- LINE Official Account：`阿珠媽旅行提醒`
- LINE ID：`@435uwhmo`
- LINE 加好友連結：`https://lin.ee/tqlXqAmN`
- 分享小卡：
  - `generated/share-card/azuma-line-share-card.png`
  - `generated/share-card/azuma-line-share-card.svg`
- Cloudflare Worker：`lize-tour-bot-webhook`
- Cloudflare D1 database：`lize-tour-accounting`
- D1 binding name：`ACCOUNTING_DB`
- D1 database ID：`10a439ff-7a2c-4056-b2f0-eed34047ebfc`
- Cloudflare API token 僅供本機 Wrangler 使用，不應寫入 repo。
- `OPENAI_API_KEY` 已不再被程式使用；可從 Cloudflare Worker secrets 刪除。

### 下一步

1. 依手機實際畫面微調 `旅行記帳本` UI 細節。
2. 確認是否要把 `OPENAI_API_KEY` 從 Cloudflare Worker secrets 中刪除。
3. 更新 `PROJECT_HANDOFF.md` 與 `LizeNext.md`，讓下一次開工指令指向 `WORKLOG.md`。
4. 之後再評估：
   - 共享旅程帳本。
   - 分帳。
   - 匯率換算。
   - Google Sheets 或其他外部備份。

## 2026-05-15

### 今日完成

- 完成 LINE Official Account `阿珠媽旅行提醒` 的 Messaging API / webhook 串接。
- 完成 Rich Menu：
  - 今日行程
  - 明日行程
  - 旅行記帳本
- Rich Menu 上方文案更新為：
  - `手機、護照、皮包、鑰匙、信用卡✧( •˓◞•̀ )`
- 完成 Open-Meteo 天氣整合：
  - GitHub Actions 排程推播會在發送時抓目的地預報。
  - Rich Menu 今日/明日行程也會即時抓天氣。
- 完成 Cloudflare Worker webhook：
  - 今日行程
  - 明日行程
  - 天氣
  - LIFF 記帳頁
  - 記帳 API
- 完成 Cloudflare D1：
  - Database：`lize-tour-accounting`
  - Binding：`ACCOUNTING_DB`
  - Table：`expenses`
- 完成 LINE Login channel：
  - `阿珠媽旅行記帳本`
- 完成 LIFF 記帳本 MVP：
  - 新增記帳
  - 今日記帳列表
  - 統計
  - 修改最近一筆
  - 刪除最近一筆
- Rich Menu 第三格已改為 LIFF URL action。

### 今日已測試

- GitHub Actions 手動跑 Day 3，LINE 成功收到行程與 `2026/05/20 卡帕多奇亞` 預報。
- 手機 LINE 可開啟 Rich Menu。
- `今日行程`、`明日行程` webhook 可回覆。
- Cloudflare Worker `/accounting` 可打開記帳頁。
- 手機點 Rich Menu `旅行記帳本` 可開啟 LIFF 記帳本。
- 已新增一筆測試記帳，並在 `今日` 列表看得到。

### 重要設定

- GitHub repo：`https://github.com/LizeWu/2026-turkey-travel-line-reminder`
- Cloudflare Worker：`lize-tour-bot-webhook`
- Cloudflare D1 database：`lize-tour-accounting`
- D1 binding name：`ACCOUNTING_DB`
- LINE Provider：`LizeTourBot`
- Messaging API channel：`阿珠媽旅行提醒`
- LINE Login channel：`阿珠媽旅行記帳本`
- Worker variables：
  - `LINE_LIFF_ID`
  - `TRIP_ID=2026-05-turkey`
- Worker secrets：
  - `LINE_CHANNEL_ACCESS_TOKEN`
  - `LINE_CHANNEL_SECRET`
- GitHub Secrets：
  - `LINE_CHANNEL_ACCESS_TOKEN`
  - `LINE_USER_ID`

### 明日或回家後下一步

1. 測試 LIFF `統計`。
2. 測試 `修改最近一筆`。
3. 測試 `刪除最近一筆`。
4. 視手機操作感受微調 LIFF UI。
5. 確認 Rich Menu 第三格是否在所有手機畫面都穩定開啟 LIFF。
6. 之後再評估：
   - Google Sheets 同步
   - 匯率換算
   - 群組記帳
   - 分帳

### 回家後可貼給 Codex 的第一句話

```text
請接續 2026-turkey-travel-line-reminder 專案。
GitHub repo: https://github.com/LizeWu/2026-turkey-travel-line-reminder
請先讀取 PROJECT_HANDOFF.md、WORKLOG.md、docs/liff-accounting-setup.md。
昨天已完成 Cloudflare D1、LINE Login LIFF、LIFF 記帳本 MVP，並已測試新增一筆記帳可出現在今日列表。
下一步請帶我測試：統計、修改最近一筆、刪除最近一筆，並視需要微調手機 UI。
請用簡明步驟帶我操作。
```
