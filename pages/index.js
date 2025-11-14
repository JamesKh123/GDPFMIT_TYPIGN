import { useState, useEffect } from 'react'
import { getSocket } from '../lib/socket'
import { useRouter } from 'next/router'


export default function Home() {
  const [lobby, setLobby] = useState(null)
  const [adminName, setAdminName] = useState('Host')
  const router = useRouter()

  useEffect(() => {
    const s = getSocket()
    if (s) {
      s.on('connect', () => console.log('connected', s.id))
      s.on('connect_error', (err) => console.error('socket connect_error', err))
    }
    return () => {}
  }, [])

  const createLobby = () => {
    try {
      const s = getSocket()
      console.log('createLobby clicked, socket=', !!s)
      if (!s) return alert('Socket not available')
      s.emit('lobby:create', { adminName }, (res) => {
        console.log('lobby:create response', res)
        if (res && res.lobby) {
          setLobby(res.lobby)
          // open lobby page
          router.push(`/lobby/${res.lobby.inviteToken}`)
        } else {
          alert('Failed to create lobby')
        }
      })
    } catch (err) {
      console.error('createLobby error', err)
      alert('Error creating lobby: ' + String(err))
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="max-w-xl w-full p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-semibold mb-4">Typing Racer (MVP)</h1>
        <p className="mb-4 text-sm text-slate-600">Create a lobby and invite up to 3 players.</p>
        <div className="mb-4">
          <label className="block text-sm font-medium">Your name</label>
          <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={createLobby}
            onKeyDown={(e) => { if (e.key === 'Enter') createLobby() }}
            className="px-4 py-2 bg-indigo-600 text-white rounded cursor-pointer"
            aria-label="Create lobby"
            tabIndex={0}
            style={{ pointerEvents: 'auto' }}
          >
            Create Lobby
          </button>
        </div>
        <div className="mt-3 text-sm text-slate-500">
          Socket status: <strong>{typeof window !== 'undefined' && getSocket() && getSocket().connected ? 'connected' : 'not connected'}</strong>
        </div>
      </div>
    </div>
  )
}
