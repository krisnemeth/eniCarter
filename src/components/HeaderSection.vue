<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const mobileBgUrl = new URL('../assets/img/Vertical/KATA4524.jpg', import.meta.url).href
const desktopBgUrl = new URL('../assets/img/Vertical/About/KATA4614.jpg', import.meta.url).href

const isDesktop = ref(false)

function updateIsDesktop() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    isDesktop.value = false
    return
  }
  isDesktop.value = window.matchMedia('(min-width: 768px)').matches
}

let mql: MediaQueryList | null = null

onMounted(() => {
  updateIsDesktop()
  if (typeof window !== 'undefined' && window.matchMedia) {
    mql = window.matchMedia('(min-width: 768px)')
    // modern API
    if ('addEventListener' in mql) {
      mql.addEventListener('change', updateIsDesktop)
    } else {
      // fallback for older browsers
      (mql as any).addListener(updateIsDesktop)
    }
  }
})

onUnmounted(() => {
  if (!mql) return
  if ('removeEventListener' in mql) {
    mql.removeEventListener('change', updateIsDesktop)
  } else {
    (mql as any).removeListener(updateIsDesktop)
  }
})

const headerBgUrl = computed(() => (isDesktop.value ? desktopBgUrl : mobileBgUrl))
</script>

<template>
  <div class="w-full h-screen min-h-[60vh] bg-cover bg-center" :style="{ backgroundImage: `url(${headerBgUrl})` }">
    <header class="flex flex-col items-center justify-end h-full">
      <div class=" w-full px-0 text-center mb-32">
        <div class="">
          <h1 class="text-7xl md:text-[150px] lg:text-[200px] font-gothic-rhapsody text-slate-200 font-bold tracking-wide text-shadow-gray-950 text-shadow-lg">Eni Carter</h1>
          <h2 class="text-2xl md:text-4xl font-gothic-rhapsody text-slate-200 font-bold tracking-wide text-shadow-gray-950 text-shadow-lg">Tattoo Artist</h2>
        </div>

        <div class="button flex flex-col items-center justify-center">
          <div class="mt-6 flex items-center gap-3">
            <a href="#work" class="px-5 py-2.5 rounded-md bg-gray-950 text-slate-200 border border-slate-200 shadow-md hover:-translate-y-0.5 hover:shadow-xl transition">Munkáim</a>
          </div>
        </div>

      </div>
    </header>
  </div>
</template>

<style scoped>
</style>


