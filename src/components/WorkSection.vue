<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import SectionTitle from './SectionTitle.vue'
import ImageCarouselFullScreen from './ImageCarouselFullScreen.vue'
import Button from './Button.vue'
import { supabase, type GalleryImage } from '../lib/supabase'

// Gallery images are served from Supabase Storage (seeded into the
// gallery_images table); there is no local image fallback.
const remoteImages = ref<GalleryImage[]>([])
const loaded = ref(false)

const TattooImages = computed(() =>
  remoteImages.value.filter(i => i.category === 'fresh').map(i => i.url),
)

const designs = computed(() =>
  remoteImages.value.filter(i => i.category === 'designs').map(i => i.url),
)

onMounted(async () => {
  const { data } = await supabase
    .from('gallery_images')
    .select('*')
    .eq('visible', true)
    .order('sort_order', { ascending: true })
  if (data) remoteImages.value = data as GalleryImage[]
  loaded.value = true
})
</script>

<template>
  <section id="work" class="h-full lg:h-screen overflow-hidden pt-16 md:py-24">
    <div class="max-w-6xl mx-auto px-4 w-full">

      <SectionTitle title="Munkáim" />

      <div class="grid grid-cols-1 md:grid-cols-2 items-center justify-center w-full gap-4 md:gap-8">

        <div class="flex flex-col items-center justify-center w-full h-full">
          <div class="w-full h-full max-h-[400px]">
            <ImageCarouselFullScreen v-if="TattooImages.length" :images="TattooImages" caption="Kész tetoválások" />
            <div v-else-if="loaded" class="flex items-center justify-center h-full min-h-[300px] text-gray-400 text-sm">Hamarosan...</div>
          </div>
        </div>
        <div class="md:hidden"></div>

        <div class="flex flex-col items-center justify-center w-full h-full">
          <div class="w-full h-full max-h-[400px]">
            <ImageCarouselFullScreen v-if="designs.length" :images="designs" caption="Egyedi minták" />
            <div v-else-if="loaded" class="flex items-center justify-center h-full min-h-[300px] text-gray-400 text-sm">Hamarosan...</div>
          </div>
        </div>

      </div>

      <div class="flex flex-col text-justify lg:max-w-lg h-full">
        <p class="mt-4 md:mt-8 text-xs md:text-sm text-gray-700">Időpontegyeztetéshez és további információért írj emailt az <span class="font-bold text-xs md:text-sm text-gray-950">enitatts@gmail.com</span>-ra vagy klikkelj a gombra, és hagyj egy üzenetet!</p>
        <Button link="#contact" buttonText="Időpontegyeztetés"/>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
