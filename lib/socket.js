let socket = null

export function getSocket() {
  if (typeof window === 'undefined') return null
  if (socket) return socket
  // require here so import only runs in the browser bundle
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const io = require('socket.io-client')
  console.log('[getSocket] window.location.href=', window.location.href)
  // Allow explicit override via NEXT_PUBLIC_SOCKET_URL when using preview/proxy environments.
  const url = (typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_SOCKET_URL) || undefined
  // Try to connect to same origin or the configured URL. In some dev/proxy environments you may need to set a full URL.
  socket = io(url, {
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 500,
  })
  socket.on('connect', () => console.log('[getSocket] connected', socket.id))
  socket.on('connect_error', (err) => console.warn('[getSocket] connect_error', err))
  socket.on('reconnect_attempt', (n) => console.log('[getSocket] reconnect attempt', n))
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
