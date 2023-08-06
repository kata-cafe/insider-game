import type { DataConnection } from 'peerjs'
import Peer from 'peerjs'
import { ref } from 'vue'
import useGame from './useGame'
import type { GameConnection } from './model'

const gameId = ref(makeid(4).toUpperCase())

const { playerName } = useGame()

export const peerConn = ref<DataConnection>()

export const isRoomLeader = ref(false)

export const myPeer = new Peer(gameId.value)

export function createGame() {
  isRoomLeader.value = true
}

export function connect(peerId: string) {
  peerConn.value = myPeer.connect(peerId)

  peerConn.value.on('open', () => {
    sendGameData(peerConn.value, {
      type: 'join',
      playerName: playerName.value,
      message: 'Hi!',
    })
  })
}

myPeer.on('connection', (conn) => {
  conn.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.log(conn.peer, data)
  })
  conn.on('open', () => {
    // eslint-disable-next-line no-console
    console.log('open !!')
  })
})

function sendGameData(conn: DataConnection, data: GameConnection) {
  conn.send(data)
}

function makeid(length: number) {
  let result = ''
  const characters = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789'
  const charactersLength = characters.length
  let counter = 0
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}
