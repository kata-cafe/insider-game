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
  players.value = [{
    peer: myPeer.id,
    playerName: playerName.value,
    isRoomLeader: true,
    isReady: false,
  }]
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

export function toggleReady() {
  const mapReadyPlayers = players.value.map(
    player => player.peer === myPeer.id
      ? ({ ...player, isReady: true })
      : player,
  )

  players.value = mapReadyPlayers

  broadcastPeers({
    type: 'changePlayers',
    players: mapReadyPlayers,
  })
}

export function quitGame() {
  players.value = []
  peerConn.value.close()
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
        isReady: false,
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

  conn.on('close', () => {
    const filterClosePlayers = players.value.filter(player => player.peer !== conn.peer)
    players.value = filterClosePlayers

    broadcastPeers(
      {
        type: 'changePlayers',
        players: filterClosePlayers,
      },
      true,
    )
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
    newPeer.send({
      ...data,
      playerName: data.playerName || playerName.value,
    })
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
