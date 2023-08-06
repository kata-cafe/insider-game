<script setup lang="ts">
import { isRoomLeader, myPeer, peerConn } from '../peer'
</script>

<template>
  <div class="text-4xl font-bold text-primary">
    Game Room
  </div>
  <div class="text-4xl font-bold">
    {{ isRoomLeader ? myPeer.id : peerConn.peer }}
  </div>
</template>
