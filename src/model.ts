export interface GameSendingData {
  type:
  | 'changePlayers'
  | 'changeVotingPlayers'
  | 'changeSecondVotingPlayers'
  | 'playerReady'
  | 'newJoin'
  | 'startGame'
  | 'giveAnswer'
  | 'voteInsiderPhase'
  | 'submitVoteInsider'
  | 'gameResultPhase'
  playerName?: string
  message?: string | number | boolean
  players?: GamePlayer[]
  player?: GamePlayer
  gameResult?: GameResult
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

export type GameStatus = 'gameStart' | 'voteInsiderPhase' | 'gameResultPhase' | null

export type GameResult = 'win' | 'lose' | 'tie'
