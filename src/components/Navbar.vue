<script setup lang="ts">
import { ref } from 'vue'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

const open = ref(false)
function toggle() {
  open.value = !open.value
}
function close() {
  open.value = false
}
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 w-full bg-gray-950 px-2 shadow-gray-950 shadow-2xl">
    <div class="mx-auto max-w-6xl px-1 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
      <a href="#" class="text-2xl tracking-wide text-gray-200 font-gothic-rhapsody" @click="close">Tinywitch.ttt</a>

      <button class="inline-flex items-center justify-center rounded-md p-2 text-slate-200 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:hidden" aria-label="Toggle navigation" @click="toggle">
        <Bars3Icon v-if="!open" class="h-6 w-6" />
        <XMarkIcon v-else class="h-6 w-6" />
      </button>

      <div class="hidden sm:flex items-center gap-6 text-sm">
        <a href="#" class="text-slate-200 hover:bg-gray-400" @click="close">Kezdőlap</a>
        <a href="#work" class="text-slate-200 hover:bg-gray-400" @click="close">Munkáim</a>
        <a href="#about" class="text-slate-200 hover:bg-gray-400" @click="close">Rólam</a>
        <a href="#contact" class="text-slate-200 hover:bg-gray-400" @click="close">Kapcsolat</a>
      </div>
    </div>



    <!-- mobile navbar -->
    <div v-show="open" class="sm:hidden border-t border-gray-200 duration-300 ease-in-out">
      <div class="px-1 py-3 flex flex-col gap-3 text-sm">
        <a href="#" class="text-slate-200 hover:bg-gray-400 pb-1 border-b border-gray-200/20" @click="close">Kezdőlap</a>
        <a href="#work" class="text-slate-200 hover:bg-gray-400 pb-1 border-b border-gray-200/20" @click="close">Munkáim</a>
        <a href="#about" class="text-slate-200 hover:bg-gray-400 pb-1 border-b border-gray-200/20" @click="close">Rólam</a>
        <a href="#contact" class="text-slate-200 hover:bg-gray-400" @click="close">Kapcsolat</a>
      </div>
    </div>
  </nav>
</template>