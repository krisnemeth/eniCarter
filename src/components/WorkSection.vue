<script setup lang="ts">
import { computed } from 'vue'
import SectionTitle from './SectionTitle.vue'
import ImageCarouselFullScreen from './ImageCarouselFullScreen.vue'
import Button from './Button.vue'

// Import all images dynamically
const finishedTattooImages = [
  'Artwork-1.jpeg',
  'Artwork-2.jpeg',
  'Artwork-3.jpeg',
  'Artwork-4.jpeg',
  'Artwork-5.jpeg',
  'Artwork-6.jpeg',
  'Artwork-7.jpeg',
  'Artwork-8.jpeg',
  'Artwork-9.jpeg',
  'Artwork-10.jpeg',
  'Artwork-11.jpeg',
  'Artwork-12.jpeg',
  'Artwork-13.jpeg',
  'Artwork-14.jpeg',
  'Artwork-15.jpeg',
  'Artwork-16.jpeg',
  'Artwork-17.jpeg',
  'Artwork-18.jpeg',
  'Artwork-19.jpeg',
  'Artwork-20.jpeg',
]

const customDesigns = [
  'CowSkull.png',
  'DeathMoth.png',
  'Floral.png',
  'Gingko.png',
  'Mice.png',
  'Oni.png',
  'OrnamentalFace.png',
  'OrnamentalHeart.png',
  'OrnamentalSkull.png',
  'SpiderLily.png',
  'ThistleBird.png',
  'ThistleSkull.png',
  'Twoface.png'
]

const TattooImages = computed(() => {
  return finishedTattooImages.map(file => new URL(`../assets/img/TattooImg/Fresh/${file}`, import.meta.url).href)
})

const designs = computed(() => {
  return customDesigns.map(file => new URL(`../assets/img/TattooImg/Designs/${file}`, import.meta.url).href)
})
</script>

<template>
  <section id="work" class="h-full lg:h-screen overflow-hidden pt-16 md:py-24">
    <div class="max-w-6xl mx-auto px-4 w-full">
      
      <SectionTitle title="Munkáim" />

      <div class="grid grid-cols-1 md:grid-cols-2 items-center justify-center w-full gap-4 md:gap-8">
        
        <div class="flex flex-col items-center justify-center w-full h-full">
          <div class="w-full h-full max-h-[400px]">
            <ImageCarouselFullScreen :images="TattooImages" caption="Kész tetoválások" />
          </div>
        </div>
        <div class="md:hidden"></div>

        <div class="flex flex-col items-center justify-center w-full h-full">
          <div class="w-full h-full max-h-[400px]">
            <ImageCarouselFullScreen :images="designs" caption="Egyedi minták" />
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


