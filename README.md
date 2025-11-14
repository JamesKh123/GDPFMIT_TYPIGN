# Typing Racer - MVP

## 1. Goal

Build a minimal, polished web app (deployable from a GitHub Codespace) that lets up to **4 players** race typing a customizable text. Each race shows a racing track (with a car or cute-animal icon per player), reports winners (1 / 2 / 3), and supports lobby + invite link workflow. Admin creates the lobby, manages invite codes and starts the race (admin does not play). UI/UX is modern and attractive.

## 2. Core MVP features (must-haves)

1. **Lobby & Invitations**

	 * Create a new lobby (max 4 player slots).
	 * App generates a **shareable invite link** (and optional short invite code).
	 * When clicking invite link, user fills display name and joins the lobby.
	 * Admin (lobby creator) can:

		 * See connected players (names + ready status).
		 * Create/regenerate invite code.
		 * Start the game (only admin can start); admin cannot become a racer.

2. **Game / Race**

	 * Supports exactly **4 players** (or fewer).
	 * Host sets:

		 * **Custom text** (paste or select from presets).
		 * **Timer** (race duration / time limit) or race-until-text-complete.
	 * When started, each player types the same text.
	 * Wrong keystrokes:

		 * Mark the character/word red and require correction before continuing (typing must be accurate).
		 * If a word is mistyped, player must restart that word.
	 * WPM and accuracy calculation:

		 * WPM calculation MUST account for mistakes (penalize restarts) — only correctly typed characters count.
	 * Real-time position tracking:

		 * Show progress bars / distance along track.
		 * Racing track displays a **car or cute animal icon** for each player that moves as they type.

3. **Ranking & Results**

	 * Show final ranking (1 / 2 / 3 / 4) by finish time or highest progress when timer ends.
	 * Award top 3 winners with badges and show WPM + accuracy stats.
	 * Show history of the race in lobby for review (simple summary).

4. **UI / UX**

	 * Modern, responsive interface (desktop-first, mobile-ready).
	 * Clean buttons, clear CTAs, and readable typography.
	 * Racing track visuals use images/icons from the internet (must use assets with permissive license or proper attribution).
	 * Micro-interactions: hover, subtle animations when players advance / podium reveal.

5. **Technical**

	 * Real-time multiplayer via WebSockets (or WebRTC + signaling). Simple and robust: use Socket.IO (Node) or similar.
	 * Host app runnable in **GitHub Codespaces** out-of-the-box.
	 * Deployable to Vercel (instructions included).
	 * Minimal backend: Node/Express server to manage lobbies and sockets; optional ephemeral in-memory store for MVP.
	 * Persistent DB not required for MVP (but document upgrade path to Redis/Postgres).

## 3. Non-functional requirements

* Secure invite links (unguessable tokens).
* Room size limit enforced (4 players).
* Minimal latency; keep messages small (position updates, ready/started events).
* Accessibility: keyboard focus, readable contrast, screen-reader-friendly labels.
* Respect asset licensing: prefer SVG / public-domain / CC0 icons or host your own.

## 4. User stories (prioritized)

1. As an admin, I can create a lobby and receive a shareable invite link and code.
2. As a joiner, I can open the invite link, enter my display name, and join the lobby.
3. As admin, I can set custom text and race timer, then start the race.
4. As a player, I can type the provided text; mistakes are marked and must be corrected before proceeding.
5. As a player, I see my avatar (car/animal) move along a track representing progress.
6. As a spectator/admin, I see the real-time positions of all players.
7. When the race ends, the app shows ranking, WPM, and accuracy; top 3 receive podium badges.

## 5. Acceptance criteria / Definition of Done

* [ ] Create Lobby flow works: admin created, invite link/code generated, up to 4 joiners can join.
* [ ] Join flow works: clicking link -> name input -> lobby shows joined players (names).
* [ ] Admin can set race text and timer in the lobby screen.
* [ ] Starting race triggers synchronized start for all connected players.
* [ ] Typing interface:

	* Correct characters are advanced.
	* Mistakes are highlighted and block progress until corrected.
	* WPM reflects only correct input and accounts for restarts.
* [ ] Real-time movement of icons on track for each player (progress visible).
* [ ] End-of-race summary with ranks, WPM, accuracy; first three visually emphasized.
* [ ] Responsive modern UI with polished buttons and animations.
* [ ] The repository includes a README with Codespace and Vercel deployment steps.
* [ ] Works reliably with up to 4 players on standard consumer connections.

## 6. Suggested tech stack (MVP)

* Frontend: React (Vite or Next.js) + TailwindCSS (modern UI, fast dev)
* Realtime: Socket.IO (Node.js) — simple to integrate with Next.js API routes or Express.
* Backend: Node.js + Express (or Next.js API routes). In-memory store for lobbies (Map).
* Auth: none for MVP (display name only), invite token secures lobby.
* Dev / Host: GitHub Codespaces for development; Vercel for deployment.
* Icons/Assets: SVGs from public-domain or Freepik/UnDraw/FontAwesome (ensure license) — or host simple SVG sprites.

## 7. Data model (in-memory)

```js
lobbies = {
	[lobbyId]: {
		id: string,
		adminSocketId: string,
		inviteToken: string, // in invite link
		settings: {
			text: string,
			timerSec: number,
			presetId?: string
		},
		players: [
			{ slot: 1..4, name, socketId, iconType: 'car'|'animal', progress: 0, wpm:0, accuracy:0, finishedAt: null }
		],
		status: 'waiting' | 'running' | 'finished'
	}
}
```

## 8. Socket events (minimum)

* `lobby:create` → returns lobbyId + inviteToken
* `lobby:join` (token, name) → join result + current lobby state
* `lobby:updateSettings` (admin)
* `lobby:ready` (player)
* `lobby:start` (admin)
* `race:progress` (client → server, position/progress timestamp)
* `race:stateUpdate` (server → all clients)
* `race:end` (server → all clients)
* `lobby:regenerateInvite` (admin)

## 9. UI/UX details & components

* **Lobby screen**

	* Left: lobby card (title, invite link, copy button, invite code)
	* Center: player grid (4 slots) with avatars and ready indicator
	* Right: admin panel: text input (custom text), timer dropdown, start button, regenerate invite
* **Game screen**

	* Top: mini scoreboard (names, small avatars, current WPM)
	* Middle: racing track (horizontal lanes). Each lane has a car/animal icon that moves using CSS transforms.
	* Bottom: typing area (text with per-character styling: correct, current, incorrect). Show next-word highlight.
	* Floating podium popup after race with top-3 and stats.
* **Microinteractions**

	* Smooth icon movement (CSS transition).
	* Button hover states, focus rings for accessibility.
	* Responsive layout (collapse admin panel below content on small widths).

## 10. Visual assets & licensing

* Use icons from:

	* **UnDraw** (CC0) or **OpenMoji** (Open License) for animals/cars.
	* Or host simple SVG sprites you create.
* If using external imagery, include `ASSETS.md` listing source and license.
* For MVP, prefer simple, flat SVGs (smaller network cost, easy animation).

## 11. Repo & Codespace setup (README-friendly)

### Quickstart (developer)

1. `git clone <repo>`
2. Open in GitHub Codespace (prebuilt dev container recommended)
3. `pnpm install` or `npm install`
4. `pnpm dev` or `npm run dev`  — runs frontend + server (or Next.js dev)
5. In Codespace, expose port `3000` (or Next default) and open preview.

### Deploy (Vercel)

* If using Next.js, connect repo to Vercel and set `VERCEL_ENV` variables if needed. For Socket.IO, use Vercel Serverless functions or a small Node server deployed separately (document both options).

## 12. Minimum UI design system (for consistency)

* Font: Inter / system stack
* Spacing scale: 4px unit (p-4, p-8)
* Buttons: rounded-lg (2xl radius), soft shadow, subtle gradient
* Colors: primary (vibrant teal or indigo), neutral background, accent for winners (gold/bronze/silver)
* Motion: use CSS transitions; avoid heavy animations for performance

## 13. Testing & metrics (MVP)

* Manual test cases: lobby creation/join, start race with 2–4 players, mistakes restart word, rank correctness.
* Basic unit tests for WPM & accuracy calculation.
* Collect minimal telemetry: race duration, average WPM, disconnect rates (for future improvement).

## 14. Stretch ideas (post-MVP)

* Persistent user profiles & leaderboards
* Multiple languages (Khmer + English) and localized UI
* Race modes: timed vs. finish-the-text
* Custom avatars / shop
* Replays and shareable results
* Spectator mode

## 15. Quick README template (you can paste into repo)

```md
# Typing Racer - MVP

## What it is
A 4-player real-time typing racing game: create lobby, invite friends, race the same text with car/animal avatars.

## MVP features
- Lobby + invite link (max 4 players)
- Admin controls (invite code, set text, set timer, start)
- Real-time typing race with mistake handling & WPM/accuracy
- Racing track with moving icons, final ranking & podium

## Tech
- Frontend: React + Tailwind
- Realtime: Socket.IO
- Dev: GitHub Codespaces
- Deploy: Vercel (instructions in DEPLOY.md)

## Run locally
1. `pnpm install`
2. `pnpm dev`
3. Open http://localhost:3000

## Asset licensing
See ASSETS.md for sources & licenses (use CC0/UnDraw/OpenMoji for MVP).

## Acceptance criteria
(See project spec in SPECS.md)
```

---

If you'd like, I can now scaffold `ASSETS.md`, `DEPLOY.md`, and `SPECS.md` placeholders and commit them. Which should I create next?
 
## Run the scaffolded app (Codespaces)

1. Install dependencies:

```bash
pnpm install
```

2. Start the app (this runs Next + Socket.IO server):

```bash
pnpm dev
```

3. Open http://localhost:3000 in the Codespace preview.

Notes: this scaffold is intentionally minimal — it provides a single-process Next.js app with an Express + Socket.IO server and example pages for creating/joining a lobby and a simple race view. It's a starting point for the full MVP.