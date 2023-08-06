import type { DataConnection } from 'peerjs'
import Peer from 'peerjs'
import { ref } from 'vue'
import useGame from './useGame'
import type { GamePlayer, GameSendingData } from './model'

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
  if (peerConn.value) {
    players.value = []
    peerConn.value.close()
  }

  peerConn.value = myPeer.connect(peerId)

  peerConn.value.on('open', () => {
    sendGameData(peerConn.value, {
      type: 'newJoin',
      playerName: playerName.value,
    })
  })
}

export function quitGame() {
  broadcastPeers({
    type: 'changePlayers',
    playerName: playerName.value,
    players: players.value.filter(player => player.peer !== myPeer.id),
  })
}

myPeer.on('connection', (conn) => {
  conn.on('data', (data) => {
    // eslint-disable-next-line no-console
    console.log(conn.peer, data)

    const peerData = data as GameSendingData

    if (peerData.type === 'newJoin') {
      players.value.push({
        peer: conn.peer,
        playerName: peerData.playerName,
        isRoomLeader: false,
      })

      broadcastPeers({ type: 'changePlayers', players: players.value }, true)
    }
    else if (peerData.type === 'changePlayers') {
      // eslint-disable-next-line no-console
      console.log('changePlayers')
      players.value = [...peerData.players]
    }
  })

  conn.on('open', () => {
    // eslint-disable-next-line no-console
    console.log('open !!')
  })
})

function broadcastPeers(data: GameSendingData, excludeRoomLeader = false) {
  players.value
    .filter(player => !excludeRoomLeader || !player.isRoomLeader)
    .forEach(player => sendGameDataToPeer(player.peer, data))
}

function sendGameData(conn: DataConnection, data: GameSendingData) {
  conn.send(data)
}

function sendGameDataToPeer(peer: DataConnection['peer'], data: GameSendingData) {
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
