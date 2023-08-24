<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useIntervalFn, useTimeoutFn } from '@vueuse/core'
import { broadcastPeers, gameAnswer, gameStatus, myRole, players, votingPlayers } from '../store'
import BaseButton from '../components/BaseButton.vue'

const timer = ref(300)

const router = useRouter()

const hour = computed(() => Math.floor(timer.value / 60))

const minute = computed(() => timer.value - hour.value * 60)

const { pause } = useIntervalFn(() => {
  timer.value -= 1
}, 1000)

useTimeoutFn(() => {
  pause()
}, timer.value * 1000)

watch(gameStatus, () => {
  if (gameStatus.value === 'voteInsiderPhase')
    router.push({ name: 'vote-room' })
})

function getPadStartText(value: number) {
  return value.toString().padStart(2, '0')
}

function finishGame() {
  gameStatus.value = 'voteInsiderPhase'

  broadcastPeers({
    type: 'voteInsiderPhase',
  })

  const filterLeaderPlayers = players.value.filter(player => player.role !== 'leader')

  votingPlayers.value = filterLeaderPlayers

  broadcastPeers({
    type: 'changeVotingPlayers',
    players: filterLeaderPlayers,
  })
}
</script>

<template>
  <div class="text-4xl">
    <span v-if="myRole === 'leader'" class="font-bold">
      Tell Your Friends,
    </span>
    You are
  </div>
  <div class="text-4xl font-bold uppercase text-primary">
    {{ myRole }}
  </div>

  <div
    v-if="gameAnswer"
    class="mt-4 w-full max-w-xs rounded-xl border-2 border-dashed border-primary p-4 text-center text-4xl text-white"
  >
    {{ gameAnswer }}
  </div>

  <div class="flex flex-col pt-4">
    <template v-if="myRole === 'leader'">
      <div class="text-center">
        Hint your villagers to know the answer
      </div>
      <div class="text-center">
        You can answer with
        <span class="font-bold">"Yes"</span>,
        <span class="font-bold">"No"</span>,
        <span class="font-bold">"Maybe"</span>,
        or <span class="font-bold">"Correct"</span>
      </div>
    </template>
    <template v-else-if="myRole === 'insider'">
      <div class="text-center">
        Hint your villagers to know the answer
      </div>
      <div class="text-center font-bold uppercase">
        Don't let them know who you are
      </div>
    </template>
    <template v-else-if="myRole === 'villager'">
      <div class="text-center">
        Find the answer from leader
      </div>
      <div class="text-center">
        And find <span class="text-primary">INSIDER</span> among you
      </div>
    </template>
  </div>

  <template v-if="timer > 0">
    <div class="pt-4 text-4xl">
      {{ getPadStartText(hour) }}:{{ getPadStartText(minute) }}
    </div>

    <BaseButton v-if="myRole === 'leader'" @click="finishGame">
      Correct !!
    </BaseButton>
  </template>
  <template v-else>
    <div
      class="text-6xl font-bold uppercase"
    >
      LOSE
    </div>
    <div>No one can find the answer</div>
  </template>
</template>
