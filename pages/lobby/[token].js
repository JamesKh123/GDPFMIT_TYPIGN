import { useEffect, useState, useRef } from 'react'
import { getSocket } from '../../lib/socket'
import io from 'socket.io-client'
import { useRouter } from 'next/router'

let socket

export default function LobbyPage() {
  const router = useRouter()
  const { token } = router.query
  const [lobby, setLobby] = useState(null)
  const [name, setName] = useState('Player')
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState(null)
  const initialized = useRef(false)

  useEffect(() => {
    // Wait for Next router to be ready (token available)
    if (!router.isReady) return
    if (initialized.current) return
    initialized.current = true

    const s = getSocket()
    if (!s) return
    s.on('connect', () => console.log('socket connected', s.id))
    s.on('lobby:state', (sLobby) => setLobby(sLobby))
    s.on('lobby:closed', () => {
      alert('Lobby closed')
      router.push('/')
    })
    s.on('connect_error', (err) => console.error('connect_error', err))

    return () => {}
  }, [router.isReady])

  useEffect(() => {
    if (!lobby || !socket) return
    setIsAdmin(lobby.adminSocketId === socket.id)
  }, [lobby])

  const join = () => {
    setError(null)
    if (!token) {
      setError('Invite token missing — please open the invite link.')
      return
    }
    const s = getSocket()
    if (!s) {
      setError('Socket not connected yet — wait a moment and try again.')
      return
    }
    s.emit('lobby:join', { inviteToken: token, name }, (res) => {
      if (!res) return setError('No response from server')
      if (res.ok) setLobby(res.lobby)
      else setError(res.error || 'Could not join lobby')
    })
  }

  const start = () => {
    if (!lobby) return
    socket.emit('lobby:start', { lobbyId: lobby.id }, (res) => {
      if (!res.ok) setError(res.error || 'Could not start')
      else router.push(`/race/${lobby.id}`)
    })
  }

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Lobby: {token || '...'}</h2>
        <div className="mb-4">
          <label className="block text-sm">Display name to join</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded border px-3 py-2" />
          <button onClick={join} className="mt-2 px-3 py-1 bg-green-600 text-white rounded">Join Lobby</button>
          {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          {Array.from({ length: 4 }).map((_, i) => {
            const player = lobby?.players?.[i]
            return (
              <div key={i} className="p-3 border rounded h-24 flex flex-col items-start">
                <div className="text-sm font-medium">Slot {i + 1}</div>
                <div className="text-sm text-slate-600">{player ? player.name : 'Open'}</div>
              </div>
            )
          })}
        </div>

        {isAdmin && (
          <div className="flex gap-2">
            <button onClick={start} className="px-4 py-2 bg-indigo-600 text-white rounded">Start Race</button>
          </div>
        )}
      </div>
    </div>
  )
}
