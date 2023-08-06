import { useStorage } from '@vueuse/core'

export default function useGame() {
  const playerName = useStorage('playerName', '')

  return {
    playerName,
  }
}
