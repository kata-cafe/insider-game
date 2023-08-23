<script setup lang="ts">
import { useRouter } from 'vue-router'
import { computed, watch } from 'vue'
import BaseButton from '../components/BaseButton.vue'
import { broadcastPeers, gameAnswer, gameStatus, isRoomLeader, myPeer, myPlayerIndex, players, quitGame, roomLeaderConn, sendDataToRoomLeader, sendGameDataToPeer } from '../store'
import { thAnswers } from '../answer/th'
import type { GamePlayer } from '../model'

const router = useRouter()

watch(gameStatus, () => {
  if (gameStatus.value === 'gameStart')
    router.push({ name: 'in-game' })
})

const arePlayersExceedMinimum = computed(() => players.value.length >= 4)

const canStartGame = computed(
  () => arePlayersExceedMinimum.value && players.value.every(
    player => player.isRoomLeader || player.isReady,
  ),
)

const startGameButtonText = computed(() => {
  if (!arePlayersExceedMinimum.value)
    return 'Must have at least 4 players'

  if (!canStartGame.value)
    return 'Waiting all players ready'

  return 'Start Game'
})

function handleReady() {
  const newIsReadyValue = !players.value[myPlayerIndex.value].isReady

  players.value[myPlayerIndex.value].isReady = newIsReadyValue

  sendDataToRoomLeader({ type: 'playerReady', message: newIsReadyValue })
}

function handleQuit() {
  quitGame()
  router.push({ name: 'home' })
}

function startGame() {
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

  gameStatus.value = 'gameStart'

  sendGameDataToPeer(insiderPeer, {
    type: 'giveAnswer',
    message: answer,
  })
}
</script>

<template>
  <div class="text-4xl font-bold text-primary">
    Game Room
  </div>
  <div class="text-4xl font-bold">
    {{ isRoomLeader ? myPeer.id : roomLeaderConn.peer }}
  </div>

  <div v-for="player of players" :key="player.peer" class="flex w-full max-w-xs items-center gap-4">
    <svg v-if="player.isRoomLeader" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="#cfcfcf" d="M243.84 76.19a12.08 12.08 0 0 0-13.34-1.7l-50.21 25l-41.92-69.63a12.11 12.11 0 0 0-20.74 0L75.71 99.52l-50.19-25a12.11 12.11 0 0 0-16.9 14.6l37 113.36a8 8 0 0 0 11.68 4.4c.25-.15 25.82-14.88 70.7-14.88s70.45 14.73 70.68 14.87a8 8 0 0 0 11.71-4.39l37-113.33a12.06 12.06 0 0 0-3.55-12.96ZM198 188.83c-12-5.09-35.92-12.83-70-12.83s-58 7.74-70 12.83L26.71 93l45.07 22.47a12.17 12.17 0 0 0 15.78-4.59L128 43.66l40.44 67.2a12.18 12.18 0 0 0 15.77 4.59L229.29 93Zm-22.13-32a8 8 0 0 1-7.87 6.61a8.36 8.36 0 0 1-1.4-.12a228.2 228.2 0 0 0-77.22 0a8 8 0 0 1-2.78-15.76a244.42 244.42 0 0 1 82.78 0a8 8 0 0 1 6.5 9.24Z" /></svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#cfcfcf" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1Z" /></svg>

    <span>{{ player.playerName }}</span>
    <span v-if="!player.isRoomLeader" class="text-primary text-opacity-40">({{ player.peer }})</span>

    <div v-if="player.isReady" class="badge badge-primary ml-auto">
      READY
    </div>
  </div>

  <BaseButton v-if="isRoomLeader" class="mt-4" :disabled="!canStartGame" @click="startGame">
    {{ startGameButtonText }}
  </BaseButton>

  <BaseButton v-else class="mt-4" @click="handleReady">
    Ready
  </BaseButton>

  <BaseButton outline @click="handleQuit">
    Quit
  </BaseButton>
</template>
