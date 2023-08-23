<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import BasePlayerListItem from '../components/BasePlayerListItem.vue'
import { gameStatus, isMyRoleLeader, submitResultGame, submitVotePlayer, votingPlayers } from '../store'
import type { GamePlayer } from '../model'

const router = useRouter()

const allPlayersVoted = computed(() => votingPlayers.value.every(player => player.isVoted))

const selectedPlayer = ref<GamePlayer>()

const isSubmittedVotePlayer = ref(false)

const disabledSubmit = computed(() => !selectedPlayer.value || isSubmittedVotePlayer.value)

function handleSubmitVotePlayer() {
  isSubmittedVotePlayer.value = true
  submitVotePlayer(selectedPlayer.value)
}

if (isMyRoleLeader.value) {
  watch(allPlayersVoted, () => {
    submitResultGame()
  })
}

watch(gameStatus, () => {
  if (gameStatus.value === 'gameResultPhase')
    router.push({ name: 'game-result' })
})
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
