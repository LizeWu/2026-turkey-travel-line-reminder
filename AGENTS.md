# Codex Agent Guide

This file is the first handoff point for Codex sessions on any machine.

## Start Here

1. Treat GitHub as the source of truth:
   `https://github.com/LizeWu/2026-turkey-travel-line-reminder`
2. Before changing code, check local state:
   `git status --short`
3. Read these files in this order:
   - `LizeNext.md`
   - `PROJECT_HANDOFF.md`
   - `WORKLOG.md`
   - `FILE_INDEX.md`
   - `docs/accounting-book.md`
   - `docs/liff-accounting-setup.md`
4. If local changes exist, do not overwrite them. Assume they belong to the user or another Codex session.

## Current Product

The product is `阿珠媽旅行提醒`, a LINE travel assistant for scheduled itinerary reminders, rich menu replies, weather, and a LIFF travel accounting book.

Current GitHub repo name is still `2026-turkey-travel-line-reminder`, but the intended future product direction is `azuma-travel-assistant` for reuse across trips.

## Development Rules

- Keep user-facing docs in Traditional Chinese when they are written for the user.
- Keep code, command names, config keys, and comments in English unless the existing file uses Chinese.
- Do not commit secrets, `.env`, `.sent-reminders/`, `node_modules/`, or local PDF extraction drafts.
- Do not rotate LINE or Cloudflare secrets unless the user explicitly asks.
- Do not rename the GitHub repo until the user confirms the timing.
- Prefer small commits with clear messages.

## Common Checks

Run the checks that match the files changed:

```bash
python3 send_line_reminder.py --build
python3 send_line_reminder.py --day 3 --dry-run
python3 send_line_reminder.py --mode greeting --day 3 --dry-run
node --check webhook/cloudflare-worker/src/index.js
node --check webhook/cloudflare-worker/src/accounting-page.js
```

For Worker deploys:

```bash
cd webhook/cloudflare-worker
npm run build:data
npm run deploy
```

If migrations are added, apply them remotely before deploy:

```bash
cd webhook/cloudflare-worker
npx wrangler d1 migrations apply lize-tour-accounting --remote
npm run deploy
```

## Two-Machine Sync Routine

At the beginning of work:

```bash
git status --short
git pull --rebase
```

At the end of work:

```bash
git status --short
git add <changed-files>
git commit -m "<short change summary>"
git push
```

If switching between company MacBook and home Apple Studio, update `LizeNext.md` only with the newest actionable context. Keep long history in `WORKLOG.md`.

## Known Next Focus

- Verify group LIFF accounting after reopening from LINE group context.
- Verify scheduled reminder workflow restore/save behavior for `.sent-reminders/reminders.json`.
- Later, after confirmation, rename the project from `2026-turkey-travel-line-reminder` to `azuma-travel-assistant`.
