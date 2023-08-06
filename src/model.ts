export interface GameConnection {
  type: 'join' | 'newJoin'
  playerName?: string
  message?: string | number
  players?: GamePlayer[]
}

export interface GamePlayer {
  peer: string
  playerName: string
  isRoomLeader: boolean
}
