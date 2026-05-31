# Lize Next

Updated at: 2026-05-31 22:00 CST

```text
請接續 2026-turkey-travel-line-reminder，先讀取 LizeNext.md。
GitHub repo: https://github.com/LizeWu/2026-turkey-travel-line-reminder
請再讀取 PROJECT_HANDOFF.md、WORKLOG.md、FILE_INDEX.md、docs/accounting-book.md、docs/liff-accounting-setup.md。
目前狀態：LIFF 旅行記帳本已支援個人/團體消費基本流程，包含我要記帳、消費項目、統計、日期月曆、指定項目修改/刪除、幣別統計卡片；團體消費已改為依 LINE groupId/roomId 建立群組帳本並顯示付款人；一對一個人使用會隱藏團體切換，群組開啟會顯示團體消費；AI 辨識已移除；阿珠媽 LINE 加好友連結與分享小卡已完成。
最新修正：Rich Menu `今日行程` / `明日行程` 的 Worker 選日邏輯已修正。5/17 晚上點 `明日行程` 應可對應到 2026-05-18 Day 1；部署後需在 LINE 實測。
5/30 排查：GitHub Actions 在 5/18-5/29 旅行期間有執行，但多數 schedule run 被 GitHub 延遲到程式設定的 2 小時發送時間窗外，因此腳本以 success 結束但沒有推 LINE。
5/31 修正：第一批行程推播可靠性已調整。`send_line_reminder.py` 不再用固定 2 小時時間窗阻擋推播，改為到達 itinerary/reminder local date 的指定時間後可補送；workflow 透過 `.sent-reminders/reminders.json` 與 `actions/cache` 保存已送紀錄；log 已加強顯示旅程 ID、旅程名稱、判斷時區、當地時間、目標行程日、是否送出與未送原因。也已補上 `trip_id`，並將 LINE 推播文案改為讀取旅程名稱，不再硬寫土耳其，讓此階段先具備基本多旅程相容。第一批修正已 commit 並 push 到 GitHub：`03d2802 Fix scheduled travel reminder reliability`。
命名決策：專案未來要從 2026-turkey-travel-line-reminder 重新命名為 azuma-travel-assistant，以支援未來不同旅程沿用。
目前未完成：多人分帳功能仍需實測。分帳成員來源已改為方案 C：已點 LIFF 的 LINE 成員自動加入，並可手動新增未綁定 LINE 的旅伴；不再依賴 LINE Messaging API 自動抓完整群組名單。LIFF 連結會帶 `trip`、`chatType`、`groupId`/`roomId` 參數，API 會以 `trip_id + groupId/roomId` 判定團體帳本。5/31 晚上根據 LINE 截圖排查，新增當下資料可見但關閉重開後消失，判斷是團體 ledger context 不穩，不是 D1 寫入失敗；已修正前端會解析 `liff.state`，並讓群組帳本優先使用阿珠媽回覆連結中的 URL context，確保 `我要記帳`、`消費項目`、`統計` 使用同一本群組帳。使用者已部署此最後一段修正，但尚未完成 LINE 群組重開實測。
下一步主題：在公司環境先 `git pull` 取得最新 GitHub 內容，注意目前本機仍有未提交異動；若公司端沒有這些異動，請先不要覆蓋，需從本機 push 或以 patch 方式帶過去。接著在 LINE 群組重新輸入 `阿珠`，使用最新 LIFF 連結測試：新增手動分帳成員、新增團體消費、切到消費項目/統計確認，再關閉 LIFF 重開確認資料仍存在。也需實測新版行程推播 workflow，確認 sent record cache 能 restore/save 且不重複推播。repo rename 仍暫緩，下次再把 repo 從 2026-turkey-travel-line-reminder 重新命名為 azuma-travel-assistant，並同步更新本機 git remote、README、LizeNext、文件中的舊名稱。
部署狀態：使用者已在 5/31 晚上部署團體 ledger context 修正。若之後新增 migration，先執行 npx wrangler d1 migrations apply lize-tour-accounting --remote，再 npm run deploy；請確認 0004_add_split_fields.sql 與 0005_add_group_trip_settings.sql 都已套用。
後續多人記帳第二階段：強化 LINE id token 驗證、離開群組後撤權、指定金額分攤、誰欠誰建議與結算狀態。
請先提出分帳成員策略與結算流程，再執行第二階段程式修改。
推 GitHub 前請檢查 staging 清單，避免提交 node_modules；package-lock.json 是否提交需先確認。
請用簡明步驟帶我操作。
```
