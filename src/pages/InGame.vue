<script setup lang="ts">
import { myRole } from '../peer'
</script>

<template>
  <div class="text-4xl font-bold">
    You are
  </div>
  <div class="text-4xl font-bold uppercase text-primary">
    {{ myRole }}
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
</template>
