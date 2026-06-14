# Lize Next

Updated at: 2026-06-14 00:00 CST

Note: New Codex sessions should read `AGENTS.md` first. It is the cross-machine handoff guide for company MacBook, home Apple Studio, and new Codex app chats. Additional SOP and multi-device notes are in `docs/ai-development-sop.md` and `docs/multi-device-continuation.md`.

```text
請接續 2026-turkey-travel-line-reminder，先讀取 AGENTS.md，再讀取 LizeNext.md。
GitHub repo: https://github.com/LizeWu/2026-turkey-travel-line-reminder
請再讀取 PROJECT_HANDOFF.md、WORKLOG.md、FILE_INDEX.md、docs/ai-development-sop.md、docs/multi-device-continuation.md、docs/accounting-book.md、docs/liff-accounting-setup.md。
跨設備接續規則：GitHub 是程式與可分享設定的同步來源。每次開始先確認 `git status --short`，再 `git pull --rebase` 或 `git pull --ff-only origin main`；每次收工若有可保留變更，請提醒 Lize 是否要 commit/push，避免公司/居家不同步。不要提交 `.env`、tokens、secrets、node_modules。
目前狀態：LIFF 旅行記帳本已支援個人/團體消費基本流程，包含我要記帳、消費項目、統計、日期月曆、指定項目修改/刪除、幣別統計卡片；團體消費依 LINE groupId/roomId 建立群組帳本；分帳成員採已開過 LIFF 的 LINE 成員 + 手動新增旅伴；付款人已可在團體消費中手動選擇，且付款人與分攤成員已拆開；一對一個人使用會隱藏團體切換，群組開啟會顯示團體消費；AI 辨識已移除；阿珠媽 LINE 加好友連結與分享小卡已完成。
2026-06-12 最新修正：第三階段先集中調整 LIFF 記帳統計 UI。消費項目卡片、分帳統計、結算清單已依手機版重新排版；分帳統計與結算清單拆成獨立 summary-card 並加 info icon 說明。ledger_members 新增 `picture_url`，LINE 成員可顯示頭貼，無頭貼或手動成員使用 lucide `circle-user`。結算清單改為以同幣別淨額簡化產生「建議付款方式」，不同幣別不互相抵銷；原始逐筆結算只作為該成員本人原始應付項目的「相關結算依據（N筆）」，清單內部 scroll 並加序號，不顯示與該成員無關的消費項目。新增 D1 migration `0007_add_ledger_member_picture_url.sql`，已套用 remote D1。最新 Worker version ID：`6efd1927-1473-4591-b6ad-ad7775205ba8`。
最新修正：2026-06-11 已展開多人記帳第二階段：團體消費新增 `平均分攤` / `指定金額`，指定金額會檢查每位成員金額加總等於消費金額；`統計 > 團體消費 > 分帳統計` 新增誰欠誰建議與結算狀態，可標記已結清或取消結清；新增 D1 migration `0006_create_settlements.sql`，已套用 remote D1 並部署 Worker。後續依回饋調整 LIFF 顯示：團體消費項目改為清楚列出 `#編號 分類｜備註`、付款人、分攤成員；分帳統計 `split-metrics` 改為三欄均分：`已支付`、`應收款項`、`應付款項`，無金額顯示 `0`；結算區塊改為逐筆分攤明細，不再做跨人淨額抵扣，每筆消費由分攤成員直接付給該筆付款人，並顯示明細例如 `烈酒 NT$1,500`；結算 DOM 移除幣別標題，每個 `settlement-row` 代表一位欠款成員，新增 `settlement-main-wrap` 內含多個 `settlement-main`，按鈕文字為 `待結清` / `已結清`。最新 Worker version ID：`7722cb47-f939-413e-a20f-c57f1482ea95`。2026-06-10 已完成 LIFF 記帳 UX 與分帳修正：新增/更新/刪除改用可關閉 toast；成功後回消費項目列表並標示 `已新增` / `已更新`；編輯時維持原分攤成員勾選；編輯模式上方顯示 `正在修改 #id` 並提供取消；團體消費新增付款人 select，送出時 `payer_*` 與 `created_by_*` 分開；付款人不再被強制加入分攤成員。
5/30 排查：GitHub Actions 在 5/18-5/29 旅行期間有執行，但多數 schedule run 被 GitHub 延遲到程式設定的 2 小時發送時間窗外，因此腳本以 success 結束但沒有推 LINE。
5/31 修正：第一批行程推播可靠性已調整。`send_line_reminder.py` 不再用固定 2 小時時間窗阻擋推播，改為到達 itinerary/reminder local date 的指定時間後可補送；workflow 透過 `.sent-reminders/reminders.json` 與 `actions/cache` 保存已送紀錄；log 已加強顯示旅程 ID、旅程名稱、判斷時區、當地時間、目標行程日、是否送出與未送原因。也已補上 `trip_id`，並將 LINE 推播文案改為讀取旅程名稱，不再硬寫土耳其，讓此階段先具備基本多旅程相容。第一批修正已 commit 並 push 到 GitHub：`03d2802 Fix scheduled travel reminder reliability`。
命名決策：專案未來要從 2026-turkey-travel-line-reminder 重新命名為 azuma-papago，以支援未來不同旅程沿用。
2026-06-14 實測更新：LINE 群組 LIFF 記帳流程已實測 OK；指定金額分攤、逐筆結算、待結清/已結清切換，以及調整後的消費項目/分帳統計/結算排版皆確認可用。原本規劃在 `統計 > 團體消費` 另新增的 `幣別淨額` 區塊已取消，不再作為待辦。LIFF 連結會帶 `trip`、`chatType`、`groupId`/`roomId` 參數，API 會以 `trip_id + groupId/roomId` 判定團體帳本。另已修正群組情境中的 `我的消費` 隔離：同一使用者在不同 LINE 群組會分別使用 `personal:group:<groupId>:user:<userId>`，多人聊天室使用 `personal:room:<roomId>:user:<userId>`，一對一個人使用才維持 `personal:<userId>`；並新增一次性相容搬移，若群組分攤成員同時包含 `俊榜`、`Jessie Chou`、`Miley Ho`、`Lize Wu`，使用者從該群組查看 `我的消費` 時，會把該使用者舊的 `personal:<userId>` 或空 ledger 個人消費搬到該群組 personal ledger。開發測試用旅程已改為 `dev-sandbox` / `開發沙盒旅程`，正式土耳其旅程資料仍保留在 `trips/2026-05-turkey.json`，`config.json` 未切到 dev-sandbox，因此行程提醒資料不受影響。
目前未完成：第三階段保留強化 LINE id token 驗證、離開群組後撤權、行程提醒 workflow restore/save 復測。repo rename 仍暫緩，之後確認時再把 repo 從 2026-turkey-travel-line-reminder 重新命名為 azuma-papago，並同步更新本機 git remote、README、LizeNext、文件中的舊名稱。
部署狀態：已新增 GitHub Actions `deploy-cloudflare-worker.yml`，push Worker 相關檔案到 `main` 會用 GitHub secret `CLOUDFLARE_TOKEN` 自動部署 Cloudflare Worker；也新增 `accounting-maintenance.yml` 可手動清理指定 trip 的 D1 記帳測試資料。若之後新增 migration，仍需先執行 npx wrangler d1 migrations apply lize-tour-accounting --remote，再部署。
第三階段保留：強化 LINE id token 驗證、離開群組後撤權、行程提醒 workflow restore/save 復測。
未來想調整，僅記錄先不討論：1. 新增幣別。2. 群組中成員能查閱旅程文件，例如第一天的景點、飯店、交通、路線等，提高大家對旅程的理解度。
推 GitHub 前請檢查 staging 清單，避免提交 node_modules；package-lock.json 是否提交需先確認。
請用簡明步驟帶我操作。
```
