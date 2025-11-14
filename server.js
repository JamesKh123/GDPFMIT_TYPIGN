const express = require('express')
const next = require('next')
const http = require('http')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Simple in-memory lobbies map
const lobbies = new Map()

function makeToken(len = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}

app.prepare().then(() => {
  const server = express()
  const httpServer = http.createServer(server)
  const io = new Server(httpServer)

  io.on('connection', (socket) => {
    console.log('socket connected', socket.id)

    socket.on('lobby:create', ({ adminName } = {}, cb) => {
      const token = makeToken(8)
      const lobby = {
        id: token,
        adminSocketId: socket.id,
        inviteToken: token,
        settings: { text: 'The quick brown fox jumps over the lazy dog', timerSec: 0 },
        players: [],
        status: 'waiting'
      }
      lobbies.set(token, lobby)
      socket.join(token)
      if (cb) cb({ ok: true, lobby })
      io.to(token).emit('lobby:state', lobby)
    })

    socket.on('lobby:join', ({ inviteToken, name } = {}, cb) => {
      console.log('lobby:join', { inviteToken, from: socket.id, name })
      const lobby = lobbies.get(inviteToken)
      if (!lobby) return cb && cb({ ok: false, error: 'Lobby not found' })
      if (lobby.players.length >= 4) return cb && cb({ ok: false, error: 'Lobby full' })
      const slot = lobby.players.length + 1
      const player = { slot, name, socketId: socket.id, iconType: 'car', progress: 0, wpm: 0, accuracy: 100, finishedAt: null }
      lobby.players.push(player)
      socket.join(lobby.id)
      io.to(lobby.id).emit('lobby:state', lobby)
      if (cb) cb({ ok: true, lobby })
    })

    // HTTP endpoint for fetching lobby state (useful for debugging)
    // Note: defined per-connection but uses the same express `server` instance

    socket.on('lobby:updateSettings', ({ lobbyId, settings } = {}, cb) => {
      const lobby = lobbies.get(lobbyId)
      if (!lobby) return cb && cb({ ok: false })
      if (socket.id !== lobby.adminSocketId) return cb && cb({ ok: false, error: 'Not admin' })
      lobby.settings = { ...lobby.settings, ...settings }
      io.to(lobbyId).emit('lobby:state', lobby)
      if (cb) cb({ ok: true })
    })

    socket.on('lobby:start', ({ lobbyId } = {}, cb) => {
      const lobby = lobbies.get(lobbyId)
      if (!lobby) return cb && cb({ ok: false })
      if (socket.id !== lobby.adminSocketId) return cb && cb({ ok: false, error: 'Not admin' })
      lobby.status = 'running'
      io.to(lobbyId).emit('race:countdown', { seconds: 3 })
      // after countdown, emit start
      setTimeout(() => {
        io.to(lobbyId).emit('race:start', { settings: lobby.settings })
      }, 3500)
      io.to(lobbyId).emit('lobby:state', lobby)
      if (cb) cb({ ok: true })
    })

    socket.on('race:progress', ({ lobbyId, slot, progress } = {}) => {
      const lobby = lobbies.get(lobbyId)
      if (!lobby) return
      const player = lobby.players.find((p) => p.slot === slot && p.socketId === socket.id)
      if (!player) return
      player.progress = progress
      io.to(lobbyId).emit('race:stateUpdate', { players: lobby.players.map(p => ({ slot: p.slot, name: p.name, progress: p.progress })) })
    })

    socket.on('disconnect', () => {
      // remove player from any lobby
      for (const [id, lobby] of lobbies.entries()) {
        const idx = lobby.players.findIndex(p => p.socketId === socket.id)
        if (idx !== -1) {
          lobby.players.splice(idx, 1)
          io.to(id).emit('lobby:state', lobby)
        }
        if (lobby.adminSocketId === socket.id) {
          // admin left: close lobby
          io.to(id).emit('lobby:closed')
          lobbies.delete(id)
        }
      }
    })
  })

  // Next.js request handler
  // Add a simple HTTP endpoint to fetch lobby state for debugging
  server.get('/api/lobby/:id', (req, res) => {
    const id = req.params.id
    const lobby = lobbies.get(id)
    if (!lobby) return res.status(404).json({ error: 'Lobby not found' })
    return res.json(lobby)
  })

  server.all('*', (req, res) => {
    return handle(req, res)
  })

  const port = parseInt(process.env.PORT || '3000', 10)
  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
