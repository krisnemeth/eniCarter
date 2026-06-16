<template>
  <div>
    <footer class="h-20 bg-gray-950 text-gray-200">
      <div class="flex flex-col items-center justify-center h-full space-y-2">
        <div class="font-gothic-rhapsody text-3xl tracking-wide">TW</div>
        <p class="text-xs text-gray-400">©Tinywitch.ttt {{ Year }}</p>
        <RouterLink to="/admin" class="text-xs text-gray-400 underline">Admin</RouterLink>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const Year = new Date().getFullYear()
</script>