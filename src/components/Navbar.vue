<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/outline'

const open = ref(false)
const router = useRouter()
const route = useRoute()

function toggle() {
  open.value = !open.value
}
function close() {
  open.value = false
}

function goHome(hash = '') {
  close()
  if (route.path === '/') {
    if (hash) {
      const el = document.querySelector(hash)
      el?.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  } else {
    router.push(hash ? `/${hash}` : '/')
  }
}
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 w-full bg-gray-950 px-2 shadow-gray-950 shadow-2xl">
    <div class="mx-auto max-w-6xl px-1 sm:px-6 lg:px-4 h-14 flex items-center justify-between">
      <a href="/" class="text-2xl tracking-wide text-gray-200 font-gothic-rhapsody" @click.prevent="goHome()">Tinywitch.ttt</a>

      <button class="inline-flex items-center justify-center rounded-md p-2 text-slate-200 hover:bg-gray-400 focus:outline-none focus:ring-0 focus:ring-gray-200 sm:hidden" aria-label="Toggle navigation" @click="toggle">
        <Bars3Icon v-if="!open" class="h-6 w-6" />
        <XMarkIcon v-else class="h-6 w-6" />
      </button>

      <div class="hidden sm:flex items-center gap-6 text-sm">
        <a href="/" class="text-slate-200 border-b border-transparent hover:border-b hover:border-gray-200" @click.prevent="goHome()">Kezdőlap</a>
        <a href="/#work" class="text-slate-200 border-b border-transparent hover:border-b hover:border-gray-200" @click.prevent="goHome('#work')">Munkáim</a>
        <a href="/#about" class="text-slate-200 border-b border-transparent hover:border-b hover:border-gray-200" @click.prevent="goHome('#about')">Rólam</a>
        <a href="/#contact" class="text-slate-200 border-b border-transparent hover:border-b hover:border-gray-200" @click.prevent="goHome('#contact')">Kapcsolat</a>
        <RouterLink to="/blog" class="text-slate-200 border-b border-transparent hover:border-b hover:border-gray-200" @click="close">Blog</RouterLink>
      </div>
    </div>

    <!-- mobile navbar -->
    <div v-show="open" class="rounded-xl transition-all sm:hidden bg-gray-950 mx-1 mb-2 overflow-hidden duration-300 ease-in-out" :style="{ maxHeight: open ? '240px' : '0px' }">
      <div class="px-1 py-2 flex flex-col gap-2 text-sm">
        <a href="/" class="text-slate-200 hover:bg-gray-400 pb-1 border-b border-gray-200/20" @click.prevent="goHome()">Kezdőlap</a>
        <a href="/#work" class="text-slate-200 hover:bg-gray-400 pb-1 border-b border-gray-200/20" @click.prevent="goHome('#work')">Munkáim</a>
        <a href="/#about" class="text-slate-200 hover:bg-gray-400 pb-1 border-b border-gray-200/20" @click.prevent="goHome('#about')">Rólam</a>
        <a href="/#contact" class="text-slate-200 hover:bg-gray-400 pb-1 border-b border-gray-200/20" @click.prevent="goHome('#contact')">Kapcsolat</a>
        <RouterLink to="/blog" class="text-slate-200 hover:bg-gray-400 pb-1" @click="close">Blog</RouterLink>
      </div>
    </div>
  </nav>
</template>
