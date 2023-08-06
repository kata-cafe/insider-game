<script setup lang="ts">
const props = defineProps<{ outline?: boolean }>()
</script>

<template>
  <button class="btn btn-primary w-full max-w-xs" :class="{ 'btn-outline': props.outline }">
    <slot />
  </button>
</template>
