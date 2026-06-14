# AI Development SOP

This file is the shared operating guide for Lize and AI assistants. Keep it in Git so the same rules are available from home, office, and future Codex threads.

Codex sidebar project data should be a short instruction summary that points back to this file and `AGENTS.md`. Do not treat Codex project data as the only source of truth, because it can drift from the repository.

## Start Here Every Time

1. Confirm the current repo:

```bash
pwd
git remote -v
git status --short
```

2. Sync before changing files:

```bash
git pull --ff-only origin main
```

If `git pull` fails because there are local changes, stop and inspect `git status --short` before doing anything else.

3. Read these files in order:

- `LizeNext.md`
- `PROJECT_HANDOFF.md`
- `WORKLOG.md`
- `FILE_INDEX.md`
- This file

4. Before editing, restate the next task in short steps so Lize can catch wrong assumptions early.

## Development Rules

- Prefer small, focused changes.
- Keep project decisions, handoff notes, and setup instructions in Git.
- Do not depend on only one Codex chat as the source of truth.
- Do not commit generated caches, `node_modules`, `.env`, or local scratch files.
- Before commit, run `git status --short` and review the staged file list.
- When a change affects deployment, update `WORKLOG.md` or `PROJECT_HANDOFF.md`.
- When a future developer needs to continue from this point, update `LizeNext.md`.

## Required Checks

For reminder script changes:

```bash
python send_line_reminder.py --build
python send_line_reminder.py --day 3 --dry-run
python send_line_reminder.py --mode greeting --day 3 --dry-run
```

For Cloudflare Worker / LIFF changes:

```bash
node --check webhook/cloudflare-worker/src/index.js
node --check webhook/cloudflare-worker/src/accounting-page.js
```

Before deploying Worker changes:

```bash
cd webhook/cloudflare-worker
npm run build:data
```

If migrations were added, apply them before deploy:

```bash
npx wrangler d1 migrations apply lize-tour-accounting --remote
npm run deploy
```

If no migrations were added:

```bash
cd webhook/cloudflare-worker
npm run deploy
```

## Secrets Rule

Never commit real secrets.

Also never paste real secrets into Codex sidebar project data.

Allowed in Git:

- `README.md`, `PROJECT_HANDOFF.md`, `WORKLOG.md`, `LizeNext.md`
- SOPs and setup docs
- `.env.example`
- Public names and IDs needed to understand the project
- Non-secret config such as `TRIP_ID`, LIFF app ID, Worker URL, and D1 binding name

Not allowed in Git:

- `.env`
- LINE channel access token
- LINE channel secret
- GitHub personal access tokens
- Cloudflare API tokens
- Private keys
- Production database credentials
- Any copied value from GitHub Secrets or Cloudflare Secrets

## Reminder Checklist For Lize

When moving between home and office:

- Start with `git pull --ff-only origin main`.
- Confirm you are in the correct repo before running deploy commands.
- If Codex says there are local changes you do not remember, do not overwrite them.
- If you changed code and want the other computer to continue, commit and push before stopping.
- If you changed only Codex chat context, summarize it into `LizeNext.md` or `WORKLOG.md`.
- If you changed a secret in LINE, GitHub, or Cloudflare, update the matching platform secret immediately.
- If you created or edited a Codex sidebar project, keep only non-secret SOP text there and keep detailed instructions in this repository.

## When To Pause And Ask

AI should pause and ask before:

- Rotating or deleting secrets.
- Renaming the GitHub repository.
- Changing production Cloudflare resources.
- Replacing the D1 database.
- Force-pushing, resetting, or discarding local changes.
- Moving from D1 to Google Sheet as the main database.
