# Lize Next

Updated at: 2026-05-31 15:50 CST

```text
請接續 2026-turkey-travel-line-reminder，先讀取 LizeNext.md。
GitHub repo: https://github.com/LizeWu/2026-turkey-travel-line-reminder
請再讀取 PROJECT_HANDOFF.md、WORKLOG.md、FILE_INDEX.md、docs/accounting-book.md、docs/liff-accounting-setup.md。
目前狀態：LIFF 旅行記帳本已支援個人/團體消費基本流程，包含我要記帳、消費項目、統計、日期月曆、指定項目修改/刪除、幣別統計卡片；團體消費已改為依 LINE groupId/roomId 建立群組帳本並顯示付款人；一對一個人使用會隱藏團體切換，群組開啟會顯示團體消費；AI 辨識已移除；阿珠媽 LINE 加好友連結與分享小卡已完成。
最新修正：Rich Menu `今日行程` / `明日行程` 的 Worker 選日邏輯已修正。5/17 晚上點 `明日行程` 應可對應到 2026-05-18 Day 1；部署後需在 LINE 實測。
5/30 排查：GitHub Actions 在 5/18-5/29 旅行期間有執行，但多數 schedule run 被 GitHub 延遲到程式設定的 2 小時發送時間窗外，因此腳本以 success 結束但沒有推 LINE。
5/31 修正：第一批行程推播可靠性已調整。`send_line_reminder.py` 不再用固定 2 小時時間窗阻擋推播，改為到達 itinerary/reminder local date 的指定時間後可補送；workflow 透過 `.sent-reminders/reminders.json` 與 `actions/cache` 保存已送紀錄；log 已加強顯示旅程 ID、旅程名稱、判斷時區、當地時間、目標行程日、是否送出與未送原因。也已補上 `trip_id`，並將 LINE 推播文案改為讀取旅程名稱，不再硬寫土耳其，讓此階段先具備基本多旅程相容。需推上 GitHub 後用 workflow_dispatch 或下一次 schedule 實測。
命名決策：專案未來要從 2026-turkey-travel-line-reminder 重新命名為 azuma-travel-assistant，以支援未來不同旅程沿用。
目前未完成：多人分帳功能尚未穩定。分帳 UI、split 欄位與分帳統計雛形已做，但 `分帳成員` 目前只穩定顯示從該群組開啟 LIFF 的使用者；嘗試用 LINE Messaging API 自動同步群組成員時出現 `LINE member IDs failed: 400`，不能依賴 bot 自動抓完整群組名單。重新開啟 LIFF 後，`統計 > 團體消費` 曾出現資料消失，仍需排查。
下一步主題：先實測新版行程推播 workflow，確認 sent record cache 能 restore/save 且不重複推播。之後設計朋友訂閱推播時，需要區分旅人/親友/群組角色，避免台灣親友跟著土耳其早上 6 點在台灣凌晨收到訊息。repo rename 仍暫緩，下次再把 repo 從 2026-turkey-travel-line-reminder 重新命名為 azuma-travel-assistant，並同步更新本機 git remote、README、LizeNext、文件中的舊名稱。之後再修正分帳成員來源與團體統計重開後資料一致性。
部署順序：若有新增 migration，先執行 npx wrangler d1 migrations apply lize-tour-accounting --remote，再 npm run deploy。請先確認 0004_add_split_fields.sql 是否已套用到 remote D1。
後續多人記帳第二階段：強化 LINE id token 驗證、離開群組後撤權、指定金額分攤、誰欠誰建議與結算狀態。
請先提出分帳成員策略與結算流程，再執行第二階段程式修改。
推 GitHub 前請檢查 staging 清單，避免提交 node_modules；package-lock.json 是否提交需先確認。
請用簡明步驟帶我操作。
```
