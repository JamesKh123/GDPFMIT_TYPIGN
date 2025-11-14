let socket = null

export function getSocket() {
  if (typeof window === 'undefined') return null
  if (socket) return socket
  // require here so import only runs in the browser bundle
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const io = require('socket.io-client')
  socket = io()
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
