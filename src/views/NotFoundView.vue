<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 text-center">
    <p class="text-6xl font-bold text-gray-950 mb-2">404</p>
    <p class="text-sm text-gray-600 mb-8">A keresett oldal nem található.</p>
    <RouterLink
      to="/"
      class="px-5 py-2.5 rounded-md bg-gray-950 text-gray-200 text-sm hover:-translate-y-0.5 transition shadow-md"
    >
      ← Vissza a főoldalra
    </RouterLink>
  </div>
</template>
