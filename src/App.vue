<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
</script>

<template>
  <main class="flex flex-col justify-center items-center w-full bg-gray-100 text-gray-900 overflow-x-hidden">
    <Navbar />
    <div class="px-0 w-full">
      <RouterView />
    </div>
  </main>
</template>
