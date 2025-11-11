<script setup lang="ts">
import { computed } from 'vue'
import SectionTitle from './SectionTitle.vue'
import ImageCarousel from './ImageCarousel.vue'

// Import all images dynamically
const imageFiles = [
  'KATA4628.jpg',
  'KATA4614.jpg',
  'KATA4459.jpg',
  'KATA3548.jpg',
  'KATA3659.jpg',
  'KATA4064.jpg'
]

const images = computed(() => {
  return imageFiles.map(file => new URL(`../assets/img/Vertical/About/${file}`, import.meta.url).href)
})
</script>

<template>
  <section id="about" class="h-full lg:h-screen overflow-x-hidden pt-16 md:py-24">
    <div class="max-w-6xl mx-auto px-4 w-full">
      
      <SectionTitle title="Rólam" />

      <div class="grid grid-cols-1 md:grid-cols-2 items-center justify-center w-full gap-4">
        <div class="flex flex-col items-center justify-center w-full h-full p-">
          <div class="w-full h-full max-h-[600px]">
            <ImageCarousel :images="images" caption="Galéria" />
          </div>
        </div>
        <div class="flex flex-col text-justify w-full h-full">
          <p class="mt-2 text-sm text-gray-700 md:text-lg md:mt-0 md:font-semibold">Kedves leendő Vendégem!</p>
          <p class="mt-4 text-xs text-gray-700 md:text-base md:mt-6">Kocsis Enikő vagyok, 2022-ben kezdtem el tetoválóként tevékenykedni. 2025 januárban csatlakoztam a Light and Moth studió csapatához.
          </p>
          <p class="mt-2 text-xs text-gray-700 md:text-base md:mt-6">Stílusom a dark botanical és az illusztratív vonalas tetoválás ötvözete. Mintáimban a precizitás, a részletek és a szimbolika találkozik. Legtöbb esetben a mitológiából, belső átalakulásból, és a természetből merítek inspirációt.
          </p>
          <p class="mt-2 text-xs text-gray-700 md:text-base md:mt-6">Számomra fontos, hogy a vendég biztonságban érezze magát és jó hangulatban teljen az együtt töltött idő. Kimondottan figyelek a higiéniára, és mindig a legmagasabb minőségű munkavégzésre törekszem. 
          </p>
          
        </div>
      </div>


      
    </div>
  </section>
</template>

<style scoped>
</style>


