export interface GameSendingData {
  type: 'changePlayers' | 'newJoin' | 'startGame' | 'giveAnswer'
  playerName?: string
  message?: string | number
  players?: GamePlayer[]
}

export interface GamePlayer {
  peer: string
  playerName: string
  isRoomLeader: boolean
  isReady: boolean
  role?: GamePlayerRole
}

export type GamePlayerRole = 'insider' | 'villager' | 'leader'
