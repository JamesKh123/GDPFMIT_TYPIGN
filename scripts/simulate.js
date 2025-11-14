const io = require('socket.io-client')

const SERVER = process.env.SOCKET_SERVER_URL || 'http://localhost:3000'

function wait(ms) { return new Promise(r => setTimeout(r, ms)) }

async function run() {
  console.log('Connecting admin...')
  const admin = io(SERVER, { reconnectionDelayMax: 1000 })
  admin.on('connect', () => console.log('Admin connected', admin.id))

  admin.emit('lobby:create', { adminName: 'AdminSim' }, async (res) => {
    console.log('lobby:create response:', res && res.lobby && res.lobby.inviteToken)
    if (!res || !res.lobby) {
      console.error('Failed to create lobby', res)
      process.exit(1)
    }
    const token = res.lobby.inviteToken

    await wait(200)

    console.log('Connecting player...')
    const player = io(SERVER, { reconnectionDelayMax: 1000 })
    player.on('connect', () => console.log('Player connected', player.id))
    player.emit('lobby:join', { inviteToken: token, name: 'PlayerSim' }, (joinRes) => {
      console.log('lobby:join response:', joinRes)
      // keep alive briefly to allow server broadcasts
      setTimeout(() => {
        admin.disconnect()
        player.disconnect()
        process.exit(0)
      }, 1000)
    })
  })
}

run().catch(err => { console.error(err); process.exit(1) })
