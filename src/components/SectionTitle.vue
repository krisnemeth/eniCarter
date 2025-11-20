<script setup lang="ts">
const props = defineProps<{ title?: string }>()
</script>

<template>
  <div class="border-t border-gray-950/20">
    <h2 class="text-2xl md:text-3xl font-bold tracking-tight my-2 lg:mt-2 mb-6">
      <slot>{{ props.title ?? 'Section' }}</slot>
    </h2>
  </div>
  
</template>

<style scoped>
</style>
