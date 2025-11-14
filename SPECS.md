# SPECS & Implementation Notes

This file expands the README acceptance checklist into actionable technical specs and contributor tasks.

## Acceptance checklist (developer-friendly)

- [ ] Lobby creation: `lobby:create` returns `lobbyId` + `inviteToken`.
- [ ] Join flow: `lobby:join(token, name)` adds player (max 4) and returns current lobby state.
- [ ] Admin settings: `lobby:updateSettings` updates `text` and `timerSec`.
- [ ] Ready/start: players can toggle ready; `lobby:start` (admin only) triggers synchronized countdown.
- [ ] Typing UI: per-char state (`correct|current|incorrect`) and word-restart on mistake.
- [ ] Race sync: `race:progress` updates server; server broadcasts `race:stateUpdate` to clients.
- [ ] Race end: `race:end` with final ranks, WPM, and accuracy.

## Minimal server Socket contract

Socket events (client → server):

- `lobby:create` → { adminName } → returns `{ lobbyId, inviteToken }`
- `lobby:join` → { inviteToken, name } → returns `{ ok, lobbyState }`
- `lobby:updateSettings` (admin only)
- `lobby:ready` → { lobbyId, playerSlot, ready }
- `lobby:start` (admin only)
- `race:progress` → { lobbyId, playerSlot, progressPercent, correctChars, timestamp }

Server → client events:

- `lobby:state` → full lobby state
- `race:stateUpdate` → minimal progress payload for each player
- `race:countdown` → synchronized countdown before start
- `race:end` → final results

## Data model (example)

See `README.md` section 7. Keep `lobbies` in-memory for MVP, keyed by `inviteToken` and `lobbyId`.

## WPM & accuracy calculation notes

- WPM should count only correctly typed characters.
- Penalize restarts: if a user mistypes a word and restarts it, those incorrect keystrokes do not increment correct-char count.
- Example: WPM = (correctChars / 5) / (elapsedMinutes)

Unit tests should validate:

- CorrectChars increment on correct keystroke.
- Mistyped word restart does not count incorrect chars.
- WPM calculation over various elapsed times and mistakes.

## UI components (files suggested)

- `src/components/Lobby/*`
- `src/components/Track/*`
- `src/components/TypingArea/*`
- `src/pages/index.{tsx,jsx}` (landing / join)
- `src/pages/lobby/[id].{tsx,jsx}` (lobby)
- `src/pages/race/[id].{tsx,jsx}` (in-race view)

## Testing & manual scenarios

Manual test scenarios:

1. Create lobby, generate link, join with 3 other clients, start race.
2. Mistype a word: ensure the UI highlights mistakes and player cannot advance until corrected.
3. Timer mode: start race with timer; ensure ranking by progress when timer ends.
4. Disconnect / reconnect: ensure the lobby updates and slot is freed if socket leaves.

Automated tests to add (MVP):

- Unit tests for WPM & accuracy calculations.
- Integration test (simulated sockets) for lobby join/start flow (optional).

## Contributor workflow

1. Branch from `main`.
2. Implement small, testable feature (e.g., lobby:create).
3. Add tests and update `SPECS.md` if behavior changes.
4. Open PR with description and link to related spec lines.

---

If you'd like I can now scaffold a minimal Next/Tailwind + Express Socket.IO starter (dev-ready for Codespaces). Say the word and I'll scaffold it.
