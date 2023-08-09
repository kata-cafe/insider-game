import type { DataConnection } from 'peerjs'
import Peer from 'peerjs'
import { computed, ref } from 'vue'
import useGame from './useGame'
import type { GamePlayer, GameResult, GameSendingData, GameStatus } from './model'
import { thAnswers } from './answer/th'

const gameId = ref(makeid(4).toUpperCase())

const { playerName } = useGame()

export const players = ref<GamePlayer[]>([])

export const roomLeaderConn = ref<DataConnection>()

export const gameStatus = ref<GameStatus>(null)

export const gameAnswer = ref('')

export const gameResult = ref<GameResult>()

export const isRoomLeader = ref(false)

export const myPeer = new Peer(gameId.value)

const myPlayerData = computed(() => players.value.find(player => player.peer === myPeer.id))

export const myRole = computed(() => myPlayerData.value?.role)

export const isMyRoleLeader = computed(() => myRole.value === 'leader')

export const insiderPlayer = computed(() => players.value.find(player => player.role === 'insider'))

export const winnerSide = ref<'insider' | 'villager' | 'tie'>()

const villagerPlayers = computed(() => players.value.filter(player => player.role === 'villager'))

export function createGame() {
  isRoomLeader.value = true
  players.value = [{
    peer: myPeer.id,
    playerName: playerName.value,
    isRoomLeader: true,
    isReady: false,
    isVoted: false,
  }]
}

export function connect(peerId: string) {
  if (roomLeaderConn.value) {
    resetGameData()
    roomLeaderConn.value.close()
  }

  roomLeaderConn.value = myPeer.connect(peerId)

  roomLeaderConn.value.on('open', () => {
    sendGameData(roomLeaderConn.value, {
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

export function startGame() {
  const roomLeader = players.value.find(player => player.isRoomLeader)
  const normalPlayers = players.value.filter(player => !player.isRoomLeader)
  const insiderIndex = Math.round(
    Math.random() * (normalPlayers.length - 1),
  )

  const mapPlayersRole: GamePlayer[] = [
    { ...roomLeader, role: 'leader' },
    ...normalPlayers.map<GamePlayer>(
      (player, index) => ({ ...player, role: index === insiderIndex ? 'insider' : 'villager' }),
    ),
  ]

  players.value = mapPlayersRole

  broadcastPeers({
    type: 'startGame',
  })

  broadcastPeers({
    type: 'changePlayers',
    players: mapPlayersRole,
  })

  const insiderPeer = normalPlayers[insiderIndex].peer

  const answer = thAnswers[Math.round(Math.random() * (thAnswers.length - 1))]

  gameAnswer.value = answer

  sendGameDataToPeer(insiderPeer, {
    type: 'giveAnswer',
    message: answer,
  })

  gameStatus.value = 'gameStart'
}

export function finishGame() {
  gameStatus.value = 'voteInsiderPhase'
  broadcastPeers({
    type: 'voteInsiderPhase',
  })
}

export function submitVotePlayer(votePlayer: GamePlayer) {
  const leaderPeer = players.value.find(player => player.role === 'leader').peer
  sendGameDataToPeer(leaderPeer, { type: 'submitVoteInsider', player: votePlayer })
}

export function submitResultGame() {
  const highestVotePlayer = players.value.reduce(
    (acc, cur) => {
      if (acc === null || !acc.votingPlayers)
        return cur

      if (!cur.votingPlayers)
        return acc

      return cur.votingPlayers.length > acc.votingPlayers.length ? cur : acc
    }, null)

  if (highestVotePlayer.role === 'insider') {
    winnerSide.value = 'villager'
    broadcastVillagers({
      type: 'gameResultPhase',
      gameResult: 'win',
      players: players.value,
    })
    sendGameDataToPeer(insiderPlayer.value.peer, { type: 'gameResultPhase', gameResult: 'lose' })
  }
  else {
    winnerSide.value = 'insider'
    sendGameDataToPeer(insiderPlayer.value.peer, { type: 'gameResultPhase', gameResult: 'win' })
    broadcastVillagers({
      type: 'gameResultPhase',
      gameResult: 'lose',
    })
  }

  broadcastPeers({ type: 'changePlayers', players: players.value })

  gameStatus.value = 'gameResultPhase'
}

export function quitGame() {
  resetGameData()
  roomLeaderConn.value.close()
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
        isVoted: false,
      })

      broadcastPeers({ type: 'changePlayers', players: players.value }, true)
    }
    else if (peerData.type === 'changePlayers') {
      // eslint-disable-next-line no-console
      console.log('changePlayers')
      players.value = [...peerData.players]
    }
    else if (peerData.type === 'startGame') {
      gameStatus.value = 'gameStart'
    }
    else if (peerData.type === 'giveAnswer') {
      gameAnswer.value = peerData.message.toString()
    }
    else if (peerData.type === 'voteInsiderPhase') {
      gameStatus.value = 'voteInsiderPhase'
    }
    else if (peerData.type === 'submitVoteInsider') {
      const playerIndex = players.value.findIndex(player => player.peer === peerData.player.peer)

      if (players.value[playerIndex].votingPlayers) {
        players.value[playerIndex].votingPlayers.push(
          {
            peer: peerData.player.peer,
            playerName: peerData.player.playerName,
          },
        )
      }

      else {
        players.value[playerIndex].votingPlayers = [
          {
            peer: peerData.player.peer,
            playerName: peerData.player.playerName,
          },
        ]
      }

      const submitPlayerIndex = players.value.findIndex(
        player => player.peer === conn.peer,
      )

      players.value[submitPlayerIndex].isVoted = true
    }
    else if (peerData.type === 'gameResultPhase') {
      gameStatus.value = 'gameResultPhase'
      gameResult.value = peerData.gameResult
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

function resetGameData() {
  players.value = []
  gameAnswer.value = ''
  gameStatus.value = null
  isRoomLeader.value = false
  gameResult.value = undefined
}

function broadcastVillagers(data: GameSendingData) {
  villagerPlayers.value.forEach(player => sendGameDataToPeer(player.peer, data))
}

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
