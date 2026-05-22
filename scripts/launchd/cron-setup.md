# Scheduling `tfg session --auto`

There are two supported ways to wake the agent up daily for follow-ups:
launchd (preferred on macOS) or cron (everywhere).

## launchd (macOS)

1. Edit `tfg-daily.plist` and replace every `CHANGE_ME` with your username.
2. Copy the plist into `~/Library/LaunchAgents/`:
   ```
   cp scripts/launchd/tfg-daily.plist ~/Library/LaunchAgents/
   ```
3. Load it:
   ```
   launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.adv0r.tfg.daily.plist
   launchctl enable gui/$UID/com.adv0r.tfg.daily
   ```
4. Verify:
   ```
   launchctl list com.adv0r.tfg.daily
   tail ~/.local/share/token-for-good/logs/tfg-daily.out.log
   ```
5. Disable later:
   ```
   launchctl bootout gui/$UID ~/Library/LaunchAgents/com.adv0r.tfg.daily.plist
   ```

The job runs `tfg session --auto` at 09:00 local time daily. In `--auto`
mode the agent only acts on tier-1 contribution types in friendly repos
with probe cap honoured; everything else just observes and logs.

## cron (Linux / portable)

```cron
# Daily at 09:00 — same effect as the launchd plist above.
0 9 * * * /home/$USER/Desktop/token-for-good/scripts/tfg session --auto >> /home/$USER/.local/share/token-for-good/logs/tfg-daily.out.log 2>> /home/$USER/.local/share/token-for-good/logs/tfg-daily.err.log
```

Open `crontab -e`, paste, save.

## What `--auto` actually does

1. `tfg refresh` (always safe — read-only against `gh`).
2. `tfg followup` (read-only — observes and updates `next_checkpoint_at`).
3. `tfg triage` (read-only).
4. `tfg stats --update-readme` (idempotent; only writes if data changed).
5. **No new contributions in `--auto` mode unless** the operator has set
   `session_defaults.mode: auto` in `user-state.json` AND the round
   conditions are met (friendly repo, tier-1 type, probe cap free).

In practice we keep `--auto` to refresh-only by default, and run
`tfg session` (confirmed mode) interactively when contributing.

## Off-host scheduling

If you'd rather schedule from GitHub Actions or some other CI, that's
fine — just call `tfg session --auto` from the same machine and make sure
`~/.local/share/token-for-good/` is mounted persistently.
