import type { DataConnection } from 'peerjs'
import Peer from 'peerjs'
import { computed, ref } from 'vue'
import useGame from './useGame'
import type { GamePlayer, GameResult, GameSendingData, GameStatus } from './model'

const gameId = ref(makeid(4).toUpperCase())

const { playerName } = useGame()

export const players = ref<GamePlayer[]>([])

export const votingPlayers = ref<GamePlayer[]>([])

export const selectedPlayer = ref<GamePlayer | null>(null)

export const secondVotingPlayers = ref<GamePlayer[]>([])

export const roomLeaderConn = ref<DataConnection>()

export const gameStatus = ref<GameStatus>(null)

export const gameAnswer = ref('')

export const gameResult = ref<GameResult>()

export const isSubmittedVotePlayer = ref(false)

export const myPeer = new Peer(gameId.value)

const myPlayerData = computed(() => players.value.find(player => player.peer === myPeer.id))

export const isRoomLeader = computed(() => myPlayerData.value && myPlayerData.value.isRoomLeader)

export const myPlayerIndex = computed(() => findPlayerIndexByPeer(players.value, myPeer.id))

export const myRole = computed(() => myPlayerData.value?.role)

export const isMyRoleLeader = computed(() => myRole.value === 'leader')

export const insiderPlayer = computed(() => players.value.find(player => player.role === 'insider'))

export const winnerSide = ref<'insider' | 'villager' | 'tie'>()

export function createGame() {
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

  sendDataToRoomLeader(
    {
      type: 'newJoin',
      playerName: playerName.value,
    },
  )
}

export function quitGame() {
  roomLeaderConn.value.close()
  resetGameData()
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

      broadcastPeers({ type: 'changePlayers', players: players.value })
    }
    if (peerData.type === 'playerReady') {
      const playerIndex = findPlayerIndexByPeer(players.value, conn.peer)
      players.value[playerIndex].isReady = !!peerData.message
      broadcastPeers({ type: 'changePlayers', players: players.value }, [conn.peer])
    }
    else if (peerData.type === 'changePlayers') {
      // eslint-disable-next-line no-console
      console.log('changePlayers')
      players.value = [...peerData.players]
    }
    else if (peerData.type === 'changeVotingPlayers') {
      votingPlayers.value = [...peerData.players]
    }
    else if (peerData.type === 'changeSecondVotingPlayers') {
      isSubmittedVotePlayer.value = false
      selectedPlayer.value = null
      secondVotingPlayers.value = [...peerData.players]
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
    )
  })
})

function resetGameData() {
  players.value = []
  votingPlayers.value = []
  gameAnswer.value = ''
  gameStatus.value = null
  gameResult.value = undefined
}

export function broadcastPeers(data: GameSendingData, excludePeers: string[] = []) {
  players.value
    .filter(player => excludePeers.length === 0 || !excludePeers.includes(player.peer))
    .forEach(player => sendGameDataToPeer(player.peer, data))
}

export function sendDataToRoomLeader(data: GameSendingData) {
  sendGameDataToPeer(roomLeaderConn.value.peer, data)
}

export function sendGameDataToPeer(peer: DataConnection['peer'], data: GameSendingData) {
  const newPeer = myPeer.connect(peer)

  newPeer.once('open', () => {
    newPeer.send({
      ...data,
      playerName: data.playerName || playerName.value,
    })
  })
}

export function setSelectedPlayer(player: GamePlayer | null) {
  selectedPlayer.value = player
}

export function findPlayerIndexByPeer(players: GamePlayer[], peer: string) {
  return players.findIndex(player => player.peer === peer)
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
