import { useEffect, useState, useRef } from 'react'
import { getSocket } from '../../lib/socket'
import { useRouter } from 'next/router'


export default function RacePage() {
  const router = useRouter()
  const { id } = router.query
  const [lobby, setLobby] = useState(null)
  const [started, setStarted] = useState(false)
  const [text, setText] = useState('')
  const [input, setInput] = useState('')
  const [progress, setProgress] = useState(0)
  const textRef = useRef(null)

  useEffect(() => {
    const s = getSocket()
    if (!s) return
    s.on('lobby:state', (sLobby) => setLobby(sLobby))
    s.on('race:countdown', (c) => console.log('countdown', c))
    s.on('race:start', (data) => {
      setStarted(true)
      setText(data.settings.text)
    })
    s.on('race:stateUpdate', (data) => {
      // could use to update other players
    })
    return () => {}
  }, [])

  useEffect(() => {
    const pct = text.length ? Math.min(100, Math.round((input.length / text.length) * 100)) : 0
    setProgress(pct)
    if (lobby) {
      const s = getSocket()
      if (!s) return
      const slot = lobby.players.find(p => p.socketId === s.id)?.slot
      if (slot) s.emit('race:progress', { lobbyId: lobby.id, slot, progress: pct })
    }
  }, [input, text, lobby])

  const onInput = (e) => {
    setInput(e.target.value)
  }

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Race</h2>
        <div className="mb-4">Progress: {progress}%</div>
        <div className="mb-4 p-4 bg-slate-100 rounded">
          <div className="text-sm text-slate-700 break-words" ref={textRef}>{text || 'Waiting for race to start...'}</div>
        </div>
        <textarea value={input} onChange={onInput} disabled={!started} rows={4} className="w-full rounded border p-2" />
      </div>
    </div>
  )
}
