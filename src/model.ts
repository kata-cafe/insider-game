export interface GameConnection {
  type: 'join'
  playerName: string
  message?: string | number
}
