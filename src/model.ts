export interface GameSendingData {
  type: 'changePlayers' | 'newJoin' | 'startGame' | 'giveAnswer' | 'voteInsiderPhase' | 'submitVoteInsider'
  playerName?: string
  message?: string | number
  players?: GamePlayer[]
  player?: GamePlayer
}

export interface GamePlayer {
  peer: string
  playerName: string
  isRoomLeader: boolean
  isReady: boolean
  isVoted: boolean
  role?: GamePlayerRole
  votingPlayers?: Pick<GamePlayer, 'playerName' | 'peer'>[]
}

export type GamePlayerRole = 'insider' | 'villager' | 'leader'

export type GameStatus = 'gameStart' | 'voteInsiderPhase' | null
