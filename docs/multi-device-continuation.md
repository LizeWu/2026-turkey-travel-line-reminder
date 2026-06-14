# Multi-Device Continuation Guide

Use this guide when continuing development from another computer, another Codex thread, or after a long break.

## Canonical Project

- GitHub repo: `https://github.com/LizeWu/2026-turkey-travel-line-reminder`
- Current local home workspace:
  - `/Users/lizewu/Documents/Codex/2026-05-16/ai-agent-lizewu-2026-turkey-travel/repo`
- Main branch: `main`

GitHub is the source of truth for code and shareable settings. Codex sidebar project data is the quick instruction layer for new chats. Codex chat history is helpful context, but it is not the source of truth.

## First-Time Setup On Another Computer

```bash
git clone git@github.com:LizeWu/2026-turkey-travel-line-reminder.git
cd 2026-turkey-travel-line-reminder
```

If SSH is not ready on that computer, use HTTPS instead:

```bash
git clone https://github.com/LizeWu/2026-turkey-travel-line-reminder.git
cd 2026-turkey-travel-line-reminder
```

Install Worker dependencies only when working on webhook, LIFF, or Cloudflare deployment:

```bash
cd webhook/cloudflare-worker
npm install
```

## Daily Start

```bash
cd /path/to/2026-turkey-travel-line-reminder
git status --short
git pull --ff-only origin main
```

Then read:

- `LizeNext.md`
- `WORKLOG.md`
- `PROJECT_HANDOFF.md`
- `docs/ai-development-sop.md`

## Daily Stop

Before leaving a computer:

```bash
git status --short
```

If there are useful changes:

```bash
git add <files>
git status --short
git commit -m "Describe the change"
git push origin main
```

If the work is not ready to commit, update `LizeNext.md` with:

- What was changed
- What still needs testing
- Which files are not committed
- What the next computer should avoid overwriting

## Shareable Settings

Put these in Git:

- AI development SOP
- Project handoff notes
- File index
- Setup steps
- Deploy checklist
- Test checklist
- `.env.example`
- Public service names, public URLs, and non-secret IDs

Keep these outside Git:

- `.env`
- GitHub Secrets values
- Cloudflare Secrets values
- LINE channel secrets and access tokens
- Personal API tokens

## Current External Settings To Remember

GitHub repository secrets:

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_USER_ID`

Cloudflare Worker binding / variables:

- D1 binding: `ACCOUNTING_DB`
- D1 database name: `lize-tour-accounting`
- `TRIP_ID=2026-05-turkey`
- `LINE_LIFF_ID`
- `WORKER_BASE_URL`

Cloudflare Worker secrets:

- `LINE_CHANNEL_ACCESS_TOKEN`
- `LINE_CHANNEL_SECRET`

## Codex Project Data

Treat Codex project data as shareable only if it contains project instructions, SOP, architecture notes, or non-secret setup guidance.

Do not place tokens, passwords, private keys, or production secret values into Codex project data. If a detail is needed but secret, write the variable name and where to set it, not the value.

Recommended setup:

- Create one Codex sidebar project for `阿珠媽 / azuma-papago`.
- Link it to this repository/workspace.
- Put only the short instruction block below into the project data.
- Keep detailed and evolving SOP in Git, especially `AGENTS.md`, `LizeNext.md`, and `docs/ai-development-sop.md`.

Recommended Codex project instruction:

```text
這是阿珠媽旅行提醒 / azuma-papago 專案。

請接續 LizeWu/2026-turkey-travel-line-reminder。
每次開始前先執行 git status --short，再執行 git pull --rebase。
接著先讀 AGENTS.md、LizeNext.md、PROJECT_HANDOFF.md、WORKLOG.md、FILE_INDEX.md。
若要改 LIFF / 記帳功能，再讀 docs/accounting-book.md、docs/liff-accounting-setup.md。
若要補 SOP 或跨設備設定，再讀 docs/ai-development-sop.md、docs/multi-device-continuation.md。
修改前先確認 git status；完成後提醒我是否需要 commit/push，避免公司/居家不同步。
不要提交 .env、tokens、secrets、node_modules。
真實 LINE / GitHub / Cloudflare secret 只能放在平台 secrets 或本機 .env，不可放入 Codex 專案資料。
部署前確認是否有 D1 migration；若有，先套 migration 再 deploy。
不要擅自 rename repo、換資料庫、刪 secret、force push 或覆蓋本機變更。
請用簡明步驟帶我操作，必要時提醒我注意同步、secret、commit/push。
```
