# Lize Next

Updated at: 2026-05-17 16:55 CST

```text
請接續 2026-turkey-travel-line-reminder，先讀取 LizeNext.md。
GitHub repo: https://github.com/LizeWu/2026-turkey-travel-line-reminder
請再讀取 PROJECT_HANDOFF.md、WORKLOG.md、FILE_INDEX.md、docs/accounting-book.md、docs/liff-accounting-setup.md。
目前狀態：LIFF 旅行記帳本已支援個人/團體消費基本流程，包含我要記帳、消費項目、統計、日期月曆、指定項目修改/刪除、幣別統計卡片；團體消費已改為依 LINE groupId/roomId 建立群組帳本並顯示付款人；一對一個人使用會隱藏團體切換，群組開啟會顯示團體消費；AI 辨識已移除；阿珠媽 LINE 加好友連結與分享小卡已完成。
命名決策：專案未來要從 2026-turkey-travel-line-reminder 重新命名為 azuma-travel-assistant，以支援未來不同旅程沿用。
目前未完成：多人分帳功能尚未穩定。分帳 UI、split 欄位與分帳統計雛形已做，但 `分帳成員` 目前只穩定顯示從該群組開啟 LIFF 的使用者；嘗試用 LINE Messaging API 自動同步群組成員時出現 `LINE member IDs failed: 400`，不能依賴 bot 自動抓完整群組名單。重新開啟 LIFF 後，`統計 > 團體消費` 曾出現資料消失，仍需排查。
下一步主題：先修正分帳成員來源與團體統計重開後資料一致性。可評估兩條路：A. 明確要求每位成員從群組點一次 LIFF 連結完成登錄；B. 改做手動新增分帳成員暱稱，避開 LINE 群組成員 API 限制。
部署順序：若有新增 migration，先執行 npx wrangler d1 migrations apply lize-tour-accounting --remote，再 npm run deploy。請先確認 0004_add_split_fields.sql 是否已套用到 remote D1。
後續多人記帳第二階段：強化 LINE id token 驗證、離開群組後撤權、指定金額分攤、誰欠誰建議與結算狀態。
請先提出分帳成員策略與結算流程，再執行第二階段程式修改。
推 GitHub 前請檢查 staging 清單，避免提交 node_modules；package-lock.json 是否提交需先確認。
請用簡明步驟帶我操作。
```
