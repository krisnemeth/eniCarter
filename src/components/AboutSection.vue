<script setup lang="ts">
import { computed } from 'vue'
import SectionTitle from './SectionTitle.vue'
import ImageCarousel from './ImageCarousel.vue'

// Import all images dynamically
const imageFiles = [
  'KATA4628.jpg',
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
  <section id="about" class="h-full lg:h-screen overflow-hidden pt-16 md:py-24">
    <div class="max-w-6xl mx-auto px-4 w-full">
      
      <SectionTitle title="Rólam" />

      <div class="grid grid-cols-1 md:grid-cols-2 items-center justify-center w-full gap-4 lg:gap-8">
        <div class="flex flex-col items-center justify-center w-full h-full p-">
          <div class="w-full h-full lg:max-h-[600px]">
            <ImageCarousel :images="images" caption="Galéria" />
          </div>
        </div>
        <div class="flex flex-col text-justify w-full h-full space-y-1 md:space-y-5">
          <p class="mt-2 text-sm text-gray-700 md:text-lg md:mt-0 md:font-semibold">Kedves leendő Vendégem!</p>
          <p class="mt-4 text-xs text-gray-700 md:text-base md:mt-6">2022-ben kezdtem el tetoválóként tevékenykedni, majd 2025-ben csatlakoztam a Light and Moth stúdió csapatához, ahol lehetőségem nyílt még tudatosabban formálni a saját vizuális világomat és szakmai irányomat.
          </p>
          <p class="mt-2 text-xs text-gray-700 md:text-base md:mt-6">Stílusom a '<span class="font-bold">dark botanical</span>' és az '<span class="font-bold">illusztratív, finomvonalas</span>' ötvözete. Mintáimban a precizitás, a szimbolika és a természet organikus szépsége találkozik. Leggyakrabban a mitológia, a belső átalakulási folyamatok és a természet rejtett harmóniája inspirál – ezekből építem fel azt a vizuális nyelvet, amely minden egyes tetoválásban megjelenik.
          </p>
          <p class="mt-2 text-xs text-gray-700 md:text-base md:mt-6">Számomra kiemelten fontos, hogy a vendég biztonságban és oldott hangulatban érezze magát a közös munka során. Nagy hangsúlyt fektetek a higiéniára, a gondos előkészítésre és arra, hogy minden alkalommal a lehető legmagasabb minőségű munkát adjam ki a kezemből. Hiszem, hogy a tetoválás nem csupán dísz, hanem egy személyes történet lenyomata is, amelyet megtiszteltetés számomra életre kelteni.
          </p>
          <p class="mt-2 text-2xl text-gray-950 md:text-3xl md:mt-6 font-comforter-brush  ">Kocsis Enikő
          </p>
          
        </div>
      </div>


      
    </div>
  </section>
</template>

<style scoped>
</style>


