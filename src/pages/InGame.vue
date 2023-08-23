<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { broadcastPeers, gameAnswer, gameStatus, myRole } from '../store'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()

watch(gameStatus, () => {
  if (gameStatus.value === 'voteInsiderPhase')
    router.push({ name: 'vote-room' })
})

function finishGame() {
  gameStatus.value = 'voteInsiderPhase'

  broadcastPeers({
    type: 'voteInsiderPhase',
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

  <BaseButton v-if="myRole === 'leader'" @click="finishGame">
    Correct !!
  </BaseButton>
</template>
