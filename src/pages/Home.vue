<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { connect, createGame } from '../store'
import useGame from '../useGame'

const router = useRouter()

const { playerName } = useGame()

const roomId = ref('')

const newName = ref('')

watch(roomId, () => roomId.value = roomId.value.toUpperCase())

function handleJoinRoom() {
  connect(roomId.value)
  router.push({ name: 'game-room' })
}

function handleCreateGame() {
  createGame()
  router.push({ name: 'game-room' })
}
</script>

<template>
  <div class="text-6xl font-bold text-primary">
    INSIDER
  </div>

  <template v-if="playerName">
    <div class="flex items-end gap-4 text-4xl ">
      <span>Hello,</span>
      <span class="cursor-pointer underline transition-colors hover:text-primary" @click="playerName = ''">{{ playerName }}</span>
    </div>

    <input v-model="roomId" type="text" placeholder="Type Your Room ID" class="input input-bordered w-full max-w-xs text-center" maxlength="4">

    <button class="btn btn-primary mt-4 w-full max-w-xs" @click="handleJoinRoom">
      join game
    </button>

    <button class="btn btn-primary btn-outline w-full max-w-xs" @click="handleCreateGame">
      create game
    </button>
  </template>

  <form v-else @submit="playerName = newName">
    <input v-model="newName" type="text" placeholder="Type Your Name" class="input input-bordered w-full max-w-xs text-center">
    <button class="btn btn-primary mt-4 w-full max-w-xs" type="submit">
      enter
    </button>
  </form>
</template>
