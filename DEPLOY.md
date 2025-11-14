# Deployment Notes

This document provides quick guidance to deploy the Typing Racer MVP and describes Socket.IO hosting considerations.

## Quick (developer) deploy - Codespaces

1. Open the repo in a GitHub Codespace.
2. Install dependencies:

```bash
pnpm install   # or npm install
```

3. Start the dev server:

```bash
pnpm dev       # or npm run dev
```

4. Expose the app port (e.g. 3000) in Codespaces and open preview.

## Deploying frontend (Vercel)

- If you use Next.js for the frontend, connect the repo to Vercel and deploy the app as usual.
- Environment variables should be configured in the Vercel dashboard for any API URLs.

Important: Vercel Serverless Functions do not reliably support long-lived WebSocket connections. For real-time Socket.IO, consider one of the options below.

## Socket.IO hosting options (recommended)

1. Single Node server (simple): Deploy both frontend and Socket.IO server as a single Node app on a platform that supports persistent WebSockets (Render, Fly, Railway, Heroku). This is easiest for Socket.IO.

2. Split deployment (recommended for static frontend):
   - Frontend on Vercel (static / Next.js SSR).
   - WebSocket server (Socket.IO) on Render/Fly/Heroku.
   - Set `NEXT_PUBLIC_SOCKET_URL` (or similar) in frontend to point to your Socket.IO server.

3. Use a managed realtime service (Pusher, Supabase Realtime, Upstash Realtime) to avoid managing a socket server.

## Example ENV variables

- `SOCKET_SERVER_URL` — full URL to Socket.IO server (e.g., `https://sockets.example.com`)
- `NODE_ENV` — `production`

## Deploy steps (example: frontend on Vercel, server on Render)

1. Push repo to GitHub.
2. Create a Render service (Node) for `server/` folder; point to start script (`node server/index.js` or `npm run start`).
3. Deploy frontend to Vercel; set `NEXT_PUBLIC_SOCKET_URL` to the Render service URL.

## Local quick test

Run frontend + server locally (concurrently) with a dev script, for example:

```bash
pnpm run dev:server &
pnpm run dev:frontend
```

## Docker (single container)

Build and run the provided Dockerfile locally:

```bash
docker build -t typing-racer:local .
docker run -p 3000:3000 --env NODE_ENV=production typing-racer:local
```

Open http://localhost:3000 to verify the container.

## Deploy to Render using `render.yaml`

1. Push your repo to GitHub.
2. Create a new Web Service on Render and connect your GitHub repo (or use `render.yaml`).
3. Render will use the `buildCommand` and `startCommand` defined in `render.yaml`.

Set environment variables on Render if needed (e.g., `NODE_ENV=production`).

## Deploy frontend on Vercel (frontend-only)

- If hosting only the frontend on Vercel, set `NEXT_PUBLIC_SOCKET_URL` in Vercel Environment Variables to point to your Socket.IO server (e.g., Render service URL).
- Use `vercel.json` as an example configuration file — remember Vercel Serverless functions are not ideal for long-lived WebSockets so prefer a separate socket server.

## Notes & tradeoffs

- Serverless functions may work with short-lived polling or fallback transports, but for real-time racing you'll get lower latency and more reliable connections with a dedicated WebSocket-capable server.
- For production scale, use a managed pub/sub store (Redis) for multi-instance Socket.IO.

---

If you want, I can add example `Dockerfile` and Render/Vercel configuration next.
