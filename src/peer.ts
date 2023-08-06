import type { DataConnection } from 'peerjs'
import Peer from 'peerjs'
import { ref } from 'vue'
import useGame from './useGame'
import type { GameConnection, GamePlayer } from './model'

const gameId = ref(makeid(4).toUpperCase())

const { playerName } = useGame()

export const players = ref<GamePlayer[]>([])

export const peerConn = ref<DataConnection>()

export const isRoomLeader = ref(false)

export const myPeer = new Peer(gameId.value)

export function createGame() {
  isRoomLeader.value = true
  players.value = [{ peer: myPeer.id, playerName: playerName.value, isRoomLeader: true }]
}

export function connect(peerId: string) {
  peerConn.value = myPeer.connect(peerId)

  peerConn.value.on('open', () => {
    sendGameData(peerConn.value, {
      type: 'newJoin',
      playerName: playerName.value,
      message: 'Hi!',
    })
  })
}

myPeer.on('connection', (conn) => {
  conn.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.log(conn.peer, data)

    const peerData = data as GameConnection

    if (peerData.type === 'newJoin') {
      players.value.push({
        peer: conn.peer,
        playerName: peerData.playerName,
        isRoomLeader: false,
      })

      players.value
        .filter(player => !player.isRoomLeader)
        .forEach(player => sendGameDataToPeer(
          player.peer, { type: 'join', players: players.value }),
        )
    }
    else if (peerData.type === 'join') {
      console.log('join')
      players.value = [...peerData.players]
    }
  })
  conn.on('open', () => {
    // eslint-disable-next-line no-console
    console.log('open !!')
  })
})

function sendGameData(conn: DataConnection, data: GameConnection) {
  conn.send(data)
}

function sendGameDataToPeer(peer: DataConnection['peer'], data: GameConnection) {
  const newPeer = myPeer.connect(peer)

  newPeer.on('open', () => {
    newPeer.send(data)
  })
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
