<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '../components/BaseButton.vue'
import BasePlayerListItem from '../components/BasePlayerListItem.vue'
import { gameStatus, isMyRoleLeader, isSubmittedVotePlayer, myPeer, players, secondVotingPlayers, selectedPlayer, sendDataToRoomLeader, setSelectedPlayer, votingPlayers } from '../store'
import type { GamePlayer } from '../model'

const router = useRouter()

const currentVotingPlayers = computed(
  () => secondVotingPlayers.value.length > 0
    ? secondVotingPlayers.value
    : votingPlayers.value,
)

const previewCurrentVotingPlayers = computed(
  () => filterPlayersPeer(currentVotingPlayers.value, myPeer.id),
)

const otherPlayers = computed(() => filterPlayersPeer(players.value, myPeer.id))

const disabledSubmit = computed(() => !selectedPlayer.value || isSubmittedVotePlayer.value)

watch(gameStatus, () => {
  if (gameStatus.value === 'gameResultPhase')
    router.push({ name: 'game-result' })
})

function handleSubmitVotePlayer() {
  isSubmittedVotePlayer.value = true
  sendDataToRoomLeader({ type: 'submitVoteInsider', player: selectedPlayer.value })
}

function filterPlayersPeer(players: GamePlayer[], peer: string) {
  return players.filter(player => player.peer !== peer)
}

function votingPlayerActive(player: GamePlayer) {
  return selectedPlayer.value && selectedPlayer.value.peer === player.peer
}
</script>

<template>
  <div class="text-4xl font-bold">
    Vote
  </div>

  <div class="text-4xl font-bold">
    Who is the <span class="font-bold text-primary">INSIDER</span>
  </div>

  <div v-if="secondVotingPlayers.length" class="text-4xl">
    Vote again for: <span class="font-bold">{{ secondVotingPlayers.map(player => player.playerName).join(', ') }}</span>
  </div>

  <template v-if="isMyRoleLeader">
    <BasePlayerListItem
      v-for="player of otherPlayers"
      :key="player.peer"
      class="box-border border border-transparent px-4 py-2"
      :class="{
        'rounded-xl !border-primary': player.isVoted,
      }"
      :player="player"
    />
  </template>
  <template v-else>
    <BasePlayerListItem
      v-for="player of previewCurrentVotingPlayers"
      :key="player.peer"
      class="box-border border border-transparent px-4 py-2"
      :class="{
        'rounded-xl !border-primary': votingPlayerActive(player),
      }"
      :player="player"
    >
      <template #append>
        <BaseButton class="btn-sm" :disabled="isSubmittedVotePlayer" @click="setSelectedPlayer(player)">
          Vote
        </BaseButton>
      </template>
    </BasePlayerListItem>

    <BaseButton :disabled="disabledSubmit" @click="handleSubmitVotePlayer">
      {{ isSubmittedVotePlayer ? 'Waiting Other Players' : 'Submit' }}
    </BaseButton>
  </template>
</template>
