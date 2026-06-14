# Worklog

## 2026-06-14

### 今日確認

- LINE 群組 LIFF 記帳流程已由使用者實測 OK。
- 指定金額分攤、逐筆結算、待結清/已結清切換已確認可用。
- 調整後的 `消費項目`、`分帳統計`、`結算清單` 排版已確認 OK。
- 原規劃在 `統計 > 團體消費` 新增的 `幣別淨額` 區塊已取消，不再列入待辦。

### 今日修正

- 修正群組情境中的 `我的消費` 帳本隔離：
  - 原本 `我的消費` 只依 LINE userId 建立 `personal:<userId>`，導致同一使用者在 A/B/C 不同 LINE 群組中會看到同一批個人消費。
  - 調整後，從 LINE 群組開啟時會使用 `personal:group:<groupId>:user:<userId>`；從多人聊天室開啟時會使用 `personal:room:<roomId>:user:<userId>`。
  - 一對一個人使用仍維持原本 `personal:<userId>`。
  - `我的消費` 查詢也會同時篩選 `payer_id` 與 `ledger_id`，避免跨群混用。
  - 既有舊 personal 資料因為缺少原始群組來源，不會自動搬移。

### 後續保留

1. 第三階段再處理 LINE id token 強驗證、離開群組後撤權、行程提醒 workflow restore/save 復測。
2. repo rename 仍暫緩，之後確認時再改為 `azuma-papago`。

## 2026-06-12

### 今日完成

- 依回饋調整 LIFF 記帳 UI：
  - `消費項目` 卡片化，標題改為序號、`#編號`、分類 pill 與備註文字。
  - `分帳統計` 與 `結算清單` 拆成獨立 `summary-card`，並在標題 note 加 info icon。
  - `分帳統計` 成員列與 `結算清單` 成員列支援 LINE 頭貼；沒有頭貼或手動成員使用 `circle-user` 預設 icon。
- 新增 LINE 頭貼資料欄位：
  - 新增 `webhook/cloudflare-worker/migrations/0007_add_ledger_member_picture_url.sql`。
  - remote D1 已套用 migration。
  - 前後端已保存與讀取 `ledger_members.picture_url`。
- 調整結算清單邏輯：
  - 主畫面 `建議付款方式` 改用同幣別淨額簡化，不同幣別不互相抵銷。
  - 仍保留原始逐筆結算作為核對依據。
  - `推導依據` 改名為 `相關結算依據（N筆）`。
  - `相關結算依據` 只顯示該成員本人作為原始應付人的明細，不顯示與該成員無關的消費項目。
  - 相關依據列新增序號，清單改為內部 scroll，不用 `再顯示 N 筆` 按鈕。
- 產出參考 mockup：
  - `generated/mockups/settlement-simplified-mockup.svg`。
- 已部署 Worker，版本 ID：`6efd1927-1473-4591-b6ad-ad7775205ba8`。

### 今日已驗證

- `node --check webhook/cloudflare-worker/src/index.js` 通過。
- `node --check webhook/cloudflare-worker/src/accounting-page.js` 通過。
- `npm run build:data` 通過。
- `npm run deploy` 成功。

### 下次接續

1. LINE 群組 LIFF、指定金額分攤、逐筆結算、待結清/已結清切換，以及調整後排版已於 2026-06-14 實測 OK。
2. 第三階段保留：LINE id token 強驗證、離開群組後撤權、行程提醒 workflow restore/save 復測。

## 2026-06-11

### 今日完成

- 展開多人記帳第二階段核心功能：
  - 團體消費新增 `平均分攤` / `指定金額` 分攤方式。
  - 指定金額分攤會在每位分攤成員旁顯示金額欄位，前端與後端皆檢查加總需等於消費金額。
  - `split_members` JSON 在 `custom` 模式下會保存每位成員的指定分攤金額。
- 強化團體統計：
  - `統計 > 團體消費 > 分帳統計` 保留成員摘要：付款、應付、差額。
  - 新增誰欠誰建議，依幣別分開計算，不做匯率換算。
  - 新增結算狀態，可將建議轉帳標記為 `已結清`，也可取消結清。
- 新增結算資料表：
  - 新增 `webhook/cloudflare-worker/migrations/0006_create_settlements.sql`。
  - 結算狀態以 `trip_id + ledger_id + settlement_key` 保存；若消費修改造成建議金額改變，會形成新的待結算建議。
- 更新文件：
  - `docs/accounting-book.md`
  - `docs/liff-accounting-setup.md`
- 依使用者回饋調整第二階段 LIFF 顯示：
  - `消費項目 > 團體消費` 每筆資料改為清楚顯示 `#編號 分類｜備註`、付款人、分攤成員。
  - `統計 > 團體消費 > 分帳統計` 成員摘要改為三欄：`已先付`、`代墊金額`、`差額`。
  - 結算建議改為依付款人與狀態分組，後續列只顯示 `付給誰 + 金額`，按鈕靠右對齊。
  - 已部署 Worker，版本 ID：`cd852ff5-1552-4a31-bffe-66c3f828c469`。
- 依後續回饋再次調整 LIFF 顯示：
  - `分帳統計` 改為兩欄：`已支付`、`應收款項`，不再顯示 `代墊金額`。
  - `結算` 區塊新增標題，移除獨立狀態欄位，結算列改為兩欄：付款成員、收款資訊加操作按鈕。
  - 已部署 Worker，版本 ID：`27b49bea-064e-4a35-bccd-351b24c86b4d`。
- 依截圖確認指定金額有被統計，但原畫面把負差額放在 `應收款項` 中且結算清單混合幣別，容易誤判為加錯：
  - 分帳統計改為依正負差額顯示 `應收款項`、`應付款項`、`應收 / 應付` 或 `已平衡`。
  - 結算清單改為依幣別分組，例如 `台幣結算`、`日幣結算`。
  - 已部署 Worker，版本 ID：`31bb138f-82ac-4977-831b-bc1174686aea`。
- 依 UI 截圖再調整 `分帳統計`：
  - `split-metrics` 改為三欄均分：`已支付`、`應收款項`、`應付款項`。
  - 應收與應付分開顯示，沒有金額時顯示 `0`。
  - 已部署 Worker，版本 ID：`ddbbb66f-7725-4538-a242-9d5c2fc09fa9`。
- 依使用者確認，結算區改為較單純的逐筆分攤，不再做跨人淨額抵扣：
  - 每筆消費由分攤成員直接付給該筆付款人。
  - 結算顯示改為欠款人、收款人、幣別總額與明細，例如 `烈酒 NT$1,500`。
  - 已部署 Worker，版本 ID：`4f3a84e2-7688-4650-82c0-9674023db9b4`。
- 依 DOM 回饋調整結算區：
  - 移除 `settlement-currency` 幣別標題與判斷。
  - 每個 `settlement-row` 代表一位欠款成員，子層為 `settlement-from` 與一個或多個 `settlement-main`。
  - `settlement-action` 文字改為 `待結清` / `已結清`。
  - 已部署 Worker，版本 ID：`778fe092-031a-42b9-8738-7b90cc6bd56b`。
- 依 CSS/DOM 回饋調整結算區：
  - 新增 `settlement-main-wrap` 包住多個 `settlement-main`，讓 `settlement-from` 垂直置中。
  - `settlement-to` 拆成 `付給 <b>成員</b> <span>金額</span>`，並套用成員 pill 與金額色彩。
  - `settlement-detail` 改為 normal font weight，移除 `split-summary` 與 `settlement-title` 的上框線。
  - 已部署 Worker，版本 ID：`7722cb47-f939-413e-a20f-c57f1482ea95`。

### 今日已驗證

- `node --check webhook/cloudflare-worker/src/index.js` 通過。
- `node --check webhook/cloudflare-worker/src/accounting-page.js` 通過。

### 下次接續

1. 2026-06-14 已確認 LINE 群組實測 OK。
2. 原規劃新增的 `幣別淨額` 區塊已取消，不再處理。
3. 第三階段再處理 LINE id token 強驗證、離開群組後撤權與行程提醒 workflow 復測。

## 2026-06-10

### 今日完成

- 建立 Cloudflare Worker 自動部署流程：
  - 新增 `.github/workflows/deploy-cloudflare-worker.yml`。
  - GitHub push 到 `main` 且 Worker / trip data 相關檔案變更時，會自動 `npm ci`、語法檢查、`npm run build:data`、`npx wrangler deploy`。
  - GitHub secret 使用 `CLOUDFLARE_TOKEN`。
- 建立 D1 記帳資料維護流程：
  - 新增 `.github/workflows/accounting-maintenance.yml`。
  - 可手動輸入 `trip_id` 與確認字串，軟刪除指定 trip 的 active expenses，並停用 active ledger members。
  - 已用此 workflow 清除 `2026-05-turkey` 殘留測試資料，驗證 active expenses / ledger members 皆為 0。
- 建立開發測試旅程：
  - 新增 `trips/dev-sandbox.json`，`trip_id` 為 `dev-sandbox`，顯示名稱為 `開發沙盒旅程`。
  - Worker 預設 `TRIP_ID` 改為 `dev-sandbox`，讓 LIFF 記帳測試不污染過去的土耳其旅程帳本。
  - `config.json` 未改，行程提醒仍使用 `trips/2026-05-turkey.json`。
- 調整 LIFF 記帳 UX：
  - 成功操作改用可關閉 toast；成功 toast 2.5 秒自動關閉，錯誤 toast 不自動關閉。
  - 新增 / 更新成功後回到 `消費項目` 列表，並在該筆資料上顯示 `已新增` / `已更新` tag。
  - 儲存按鈕加入 saving 狀態，避免重複送出。
  - 清掉上一個步驟殘留的頁尾狀態文字，避免 `正在修改 #...` 或旅程 debug 類文字停留在列表。
  - 編輯模式把 `正在修改 #...` 移到表單上方次標題，並在 `儲存修改` 旁新增 `取消`；取消會回到列表。
- 調整團體分帳邏輯：
  - 團體消費新增 `付款人` 下拉選單。
  - `付款人` 與 `分攤成員` 拆開；付款人不再被強制加入分攤成員。
  - 前端送出 `payerId/payerName` 與 `createdById/createdByName`。
  - 後端 `normalizeExpense()` 已改為分別保存實際付款人與建立者。
  - 編輯既有團體消費時，會帶回原付款人與原分攤成員。
- 調整幣別與欄位順序：
  - 表單順序改為 `消費日期`、`幣別`、`金額`、`分類`、`備註`。
  - 幣別目前以 `台幣`、`日幣` 為主，並依此排序。
- 分帳成員清單加入刪除 icon button，刪除成員時使用 D1 `ledger_members.status = inactive`。

### 今日已驗證

- `node --check webhook/cloudflare-worker/src/index.js` 通過。
- `node --check webhook/cloudflare-worker/src/accounting-page.js` 通過。
- `npm run build:data` 通過。
- 多次 GitHub Actions `Deploy Cloudflare Worker` 成功。
- `Accounting maintenance` workflow 成功清除指定 trip 的 remote D1 active 測試資料。

### 下次接續

1. 在 LINE 群組使用 `dev-sandbox` 帳本實測：
   - 新增團體消費。
   - 選擇不同付款人。
   - 分攤成員不包含付款人。
   - 編輯既有項目時確認付款人與分攤成員都能維持原值。
   - 統計頁確認付款 / 應付 / 差額符合預期。
2. 若付款人與分攤成員流程穩定，下一步再做誰欠誰建議與結算狀態。
3. 繼續暫緩 repo rename；未來確認時再改為 `azuma-papago`。

### 命名決策更新

- 未來通用旅行助理的預計 repo / 專案名稱改為 `azuma-papago`。
- 目前 GitHub repo 仍維持 `2026-turkey-travel-line-reminder`，先不要立即 rename。
- 正式 rename 時需同步更新：
  - GitHub repo 名稱。
  - 本機 git remote。
  - README、LizeNext、AGENTS 與相關文件中的舊名稱。
  - Codex app 專案指向的 repo。
- LINE Official Account 顯示名稱 `阿珠媽旅行提醒` 可先保持不變。

## 2026-05-31

### 今日完成

- 完成第一批行程推播可靠性修正：
  - `send_line_reminder.py` 不再使用固定 2 小時時間窗阻擋推播。
  - 晚間行程提醒改為：到達 reminder date 的指定時間後即可補送。
  - 早安提醒改為：到達 itinerary day 的指定時間後即可補送。
  - 推播判斷仍使用 itinerary day 的 IANA timezone，例如 `Asia/Taipei`、`Europe/Istanbul`。
- 加入已送紀錄機制：
  - 支援 `SENT_RECORD_PATH` 環境變數。
  - 以 `trip_id + message_type + target_date` 產生 sent key。
  - GitHub Actions 透過 `.sent-reminders/reminders.json` 與 `actions/cache` 保存已送紀錄，降低重複推播風險。
- 強化 Actions log：
  - 輸出旅程 ID 與旅程名稱。
  - 輸出 selection reason。
  - 輸出使用時區、當地時間、發送時間、提醒日期。
  - 輸出每個 itinerary day 的診斷資訊。
- 加入多旅程相容的小調整：
  - `trips/2026-05-turkey.json` 補上穩定 `trip_id`。
  - LINE 推播文案不再硬寫「土耳其旅行提醒」或「土耳其之旅」，改用旅程資料中的名稱。
  - 後續新增其他國家/城市旅程時，可先沿用同一套推播判斷邏輯。
- 更新 workflow：
  - `send-travel-reminder.yml` 與 `send-morning-greeting.yml` 都會 restore/save sent records cache。
  - `.gitignore` 加入 `.sent-reminders/`，避免本機測試紀錄被提交。
- 開始多人與訂閱設計第一段調整：
  - 群組呼叫記帳本時，回覆的 LIFF 連結會帶 `trip` 參數。
  - 群組/多人聊天室呼叫記帳本時，LIFF 連結也會帶 `chatType` 與 `groupId`/`roomId`，避免關閉重開後遺失 LINE context 而查到空帳本。
  - LIFF API 會帶入 `tripId`，讓團體帳本以 `trip_id + groupId/roomId` 作為實際歸屬。
  - 新增 `0005_add_group_trip_settings.sql`，作為未來「群組目前啟用旅程」設定基礎。
  - 分帳成員改採混合來源：已點 LIFF 的 LINE 成員自動加入，也可手動新增旅伴。
  - 移除 UI 對 LINE 自動同步完整群組成員的依賴，避免再顯示 `LINE member IDs failed: 400`。
- 推送第一批修正到 GitHub：
  - commit：`03d2802 Fix scheduled travel reminder reliability`
  - 已 push 到 `main`。

### 今晚排查

- 根據 13 張 LINE 截圖確認團體記帳異常：
  - 新增團體消費後，當下可在 `消費項目` 與 `統計` 看見資料，代表資料有成功寫入。
  - 關閉 LIFF 後重新從群組連結開啟，`分帳成員`、`消費項目`、`統計` 會消失。
  - 再新增新資料後，只會看到新資料，看不到重開前新增的資料。
- 判斷主因不是 D1 無法紀錄，而是團體帳本識別不穩：
  - 新增當下與重新開啟後可能使用不同的 `groupId` / `roomId` / `ledger_id`。
  - 造成同一個 LINE 群組看起來像讀到不同帳本。
- 已先修正同一群組固定讀同一本 D1 帳本的核心邏輯：
  - 前端會解析 LINE LIFF 重新導向後可能藏在 `liff.state` 裡的原始參數。
  - 團體帳本優先使用阿珠媽在群組回覆連結時帶上的 `chatType` 與 `groupId`/`roomId`。
  - `我要記帳`、`消費項目`、`統計` 會共用同一組群組 context。
- 已由使用者部署今晚最後一段修正；接下來可直接在 LINE 群組重新呼叫 `阿珠`，用最新連結測試。

### 已驗證

- `PYTHONPYCACHEPREFIX=.pycache python3 -m py_compile send_line_reminder.py` 通過。
- 模擬 `2026-05-18T14:57:10Z`，也就是台灣 2026-05-18 22:57，晚間提醒會選到 Day 2 / `2026-05-19`。
- 模擬 `2026-05-19T06:59:54Z`，也就是土耳其 2026-05-19 09:59，早安提醒會選到 Day 2 / `2026-05-19`。
- `node --check webhook/cloudflare-worker/src/index.js` 通過。
- `node --check webhook/cloudflare-worker/src/accounting-page.js` 通過。
- 本機模擬 `liff.state` 解析，可正確取回 `trip`、`chatType`、`groupId`。

### 明日接續

1. 在同一個 LINE 群組重新輸入 `阿珠`，使用最新 LIFF 連結測試。
2. 測試流程：新增手動分帳成員、新增團體消費、切到消費項目/統計確認，再關閉 LIFF 重開確認資料仍存在。
3. 若舊測試資料仍分散在不同 ledger，先以新資料驗證穩定性，再評估是否需要清理或搬移舊資料。

## 2026-05-30

### 今日排查

- 回顧 2026-05-18 至 2026-05-29 旅行期間，阿珠媽的晚間行程提醒與早安提醒沒有穩定出現在 LINE。
- 透過 GitHub Actions API 檢查後確認：
  - `Send travel reminder` 與 `Send morning greeting` workflow 皆有 schedule run。
  - 多數 run 顯示 `success`，不是 workflow 完全沒有啟動。
  - 但 GitHub Actions schedule 經常延遲，許多執行時間落在程式允許的 2 小時發送時間窗之外。
- 目前腳本行為：
  - 晚間提醒只接受當地時間 `20:00-21:59`。
  - 早安提醒只接受當地時間 `06:30-08:29`。
  - 超過時間窗時會印出 `No itinerary matched today/day/date; nothing to send.`，並以 success 結束，因此 GitHub 畫面看起來正常，但實際沒有推 LINE。
- 5/17 晚上有收到 Day 1 行程提醒，是因為該次 Actions 剛好在台灣時間 21:00 執行，仍落在允許時間窗內。

### 後續修改項目

1. 移除或放寬 `send_line_reminder.py` 的窄時間窗，避免 Actions 延遲後不送。
2. 改為以 itinerary day 的 IANA timezone 判斷旅程日期，例如 `Europe/Istanbul`；`country` / `city` 僅作顯示用途。
3. 加入已送紀錄，依 `trip_id + message_type + target_date` 判斷是否已推播，避免補送或重跑造成重複發送。
4. 強化 log：輸出判斷日期、使用時區、目標行程日、是否送出、未送原因。
5. 未來若讓朋友訂閱主動推播，需區分 `旅人` / `親友` / `群組` 角色，避免台灣親友跟著土耳其早上 6 點在台灣凌晨收到提醒。

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
