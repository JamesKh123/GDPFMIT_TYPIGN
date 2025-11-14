import { useState, useEffect } from 'react'
import { getSocket } from '../lib/socket'
import { useRouter } from 'next/router'


export default function Home() {
  const [lobby, setLobby] = useState(null)
  const [adminName, setAdminName] = useState('Host')
  const router = useRouter()

  useEffect(() => {
    const s = getSocket()
    if (s) s.on('connect', () => console.log('connected', s.id))
    return () => {}
  }, [])

  const createLobby = () => {
    const s = getSocket()
    if (!s) return alert('Socket not available')
    s.emit('lobby:create', { adminName }, (res) => {
      if (res && res.lobby) {
        setLobby(res.lobby)
        // open lobby page
        router.push(`/lobby/${res.lobby.inviteToken}`)
      }
    })
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
          <button onClick={createLobby} className="px-4 py-2 bg-indigo-600 text-white rounded">Create Lobby</button>
        </div>
      </div>
    </div>
  )
}
