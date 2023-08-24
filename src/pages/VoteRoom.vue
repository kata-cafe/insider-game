<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import BasePlayerListItem from '../components/BasePlayerListItem.vue'
import { broadcastPeers, gameStatus, insiderPlayer, isMyRoleLeader, players, sendGameDataToPeer, votingPlayers, winnerSide } from '../store'
import type { GamePlayer, GameSendingData } from '../model'

const router = useRouter()

const selectedPlayer = ref<GamePlayer>()

const isSubmittedVotePlayer = ref(false)

const villagerPlayers = computed(() => players.value.filter(player => player.role === 'villager'))

const allPlayersVoted = computed(() => votingPlayers.value.every(player => player.isVoted))

const disabledSubmit = computed(() => !selectedPlayer.value || isSubmittedVotePlayer.value)

if (isMyRoleLeader.value) {
  watch(allPlayersVoted, () => {
    submitResultGame()
  })
}

watch(gameStatus, () => {
  if (gameStatus.value === 'gameResultPhase')
    router.push({ name: 'game-result' })
})

function handleSubmitVotePlayer() {
  isSubmittedVotePlayer.value = true
  submitVotePlayer(selectedPlayer.value)
}

function submitVotePlayer(votePlayer: GamePlayer) {
  const leaderPeer = players.value.find(player => player.role === 'leader').peer
  sendGameDataToPeer(leaderPeer, { type: 'submitVoteInsider', player: votePlayer })
}

function submitResultGame() {
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

function broadcastVillagers(data: GameSendingData) {
  villagerPlayers.value.forEach(player => sendGameDataToPeer(player.peer, data))
}
</script>

<template>
  {{ allPlayersVoted }}
  <div class="text-4xl font-bold">
    Vote
  </div>

  <div class="text-4xl font-bold">
    Who is the <span class="font-bold text-primary">INSIDER</span>
  </div>

  <BasePlayerListItem
    v-for="player of votingPlayers"
    :key="player.peer"
    class="box-border border border-transparent px-4 py-2"
    :class="{
      'rounded-xl !border-primary': selectedPlayer
        && selectedPlayer.peer === player.peer,
    }"
    :player="player"
  >
    <template #append>
      <BaseButton v-if="!isMyRoleLeader" class="btn-sm" :disabled="isSubmittedVotePlayer" @click="selectedPlayer = player">
        Vote
      </BaseButton>
    </template>
  </BasePlayerListItem>

  <BaseButton v-if="!isMyRoleLeader" :disabled="disabledSubmit" @click="handleSubmitVotePlayer">
    {{ isSubmittedVotePlayer ? 'Waiting Other Players' : 'Submit' }}
  </BaseButton>
</template>
