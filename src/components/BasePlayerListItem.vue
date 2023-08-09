<script setup lang="ts">
import type { GamePlayer } from '../model'

const props = defineProps<{ player: GamePlayer; hideRoomLeaderIcon?: boolean }>()
</script>

<template>
  <div class="flex w-full max-w-xs items-center gap-4">
    <svg
      v-if="!props.hideRoomLeaderIcon && player.isRoomLeader"
      xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"
    >
      <path fill="#cfcfcf" d="M243.84 76.19a12.08 12.08 0 0 0-13.34-1.7l-50.21 25l-41.92-69.63a12.11 12.11 0 0 0-20.74 0L75.71 99.52l-50.19-25a12.11 12.11 0 0 0-16.9 14.6l37 113.36a8 8 0 0 0 11.68 4.4c.25-.15 25.82-14.88 70.7-14.88s70.45 14.73 70.68 14.87a8 8 0 0 0 11.71-4.39l37-113.33a12.06 12.06 0 0 0-3.55-12.96ZM198 188.83c-12-5.09-35.92-12.83-70-12.83s-58 7.74-70 12.83L26.71 93l45.07 22.47a12.17 12.17 0 0 0 15.78-4.59L128 43.66l40.44 67.2a12.18 12.18 0 0 0 15.77 4.59L229.29 93Zm-22.13-32a8 8 0 0 1-7.87 6.61a8.36 8.36 0 0 1-1.4-.12a228.2 228.2 0 0 0-77.22 0a8 8 0 0 1-2.78-15.76a244.42 244.42 0 0 1 82.78 0a8 8 0 0 1 6.5 9.24Z" />
    </svg>

    <svg
      v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    >
      <path fill="#cfcfcf" d="M12 4a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m0 2a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m0 7c2.67 0 8 1.33 8 4v3H4v-3c0-2.67 5.33-4 8-4m0 1.9c-2.97 0-6.1 1.46-6.1 2.1v1.1h12.2V17c0-.64-3.13-2.1-6.1-2.1Z" />
    </svg>

    <slot :player="player">
      <span>{{ player.playerName }}</span>
      <span v-if="!player.isRoomLeader" class="text-primary text-opacity-40">({{ player.peer }})</span>
    </slot>

    <div class="ml-auto">
      <slot name="append" />
    </div>
  </div>
</template>
