<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

interface Props {
  images: string[]
  autoPlay?: boolean
  autoPlayInterval?: number
  caption: string
}

const props = withDefaults(defineProps<Props>(), {
  autoPlay: false,
  autoPlayInterval: 5000
})

const currentIndex = ref(0)
const isTransitioning = ref(false)
const touchStartX = ref(0)
const touchEndX = ref(0)
const autoPlayTimer = ref<ReturnType<typeof setInterval> | null>(null)

const currentImage = computed(() => {
  return props.images[currentIndex.value] || props.images[0]
})

const hasNext = computed(() => currentIndex.value < props.images.length - 1)
const hasPrev = computed(() => currentIndex.value > 0)

function next() {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentIndex.value = (currentIndex.value + 1) % props.images.length
  setTimeout(() => {
    isTransitioning.value = false
  }, 300)
}

function prev() {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentIndex.value = currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1
  setTimeout(() => {
    isTransitioning.value = false
  }, 300)
}

function goTo(index: number) {
  if (isTransitioning.value || index === currentIndex.value) return
  isTransitioning.value = true
  currentIndex.value = index
  setTimeout(() => {
    isTransitioning.value = false
  }, 300)
}

function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
}

function handleTouchMove(e: TouchEvent) {
  touchEndX.value = e.touches[0].clientX
}

function handleTouchEnd() {
  if (!touchStartX.value || !touchEndX.value) return
  
  const diff = touchStartX.value - touchEndX.value
  const minSwipeDistance = 50

  if (Math.abs(diff) > minSwipeDistance) {
    if (diff > 0) {
      // Swiped left - go to next
      next()
    } else {
      // Swiped right - go to previous
      prev()
    }
  }

  touchStartX.value = 0
  touchEndX.value = 0
}

function handleMouseDown(e: MouseEvent) {
  touchStartX.value = e.clientX
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  touchEndX.value = e.clientX
}

function handleMouseUp() {
  const diff = touchStartX.value - touchEndX.value
  const minSwipeDistance = 50

  if (Math.abs(diff) > minSwipeDistance) {
    if (diff > 0) {
      next()
    } else {
      prev()
    }
  }

  touchStartX.value = 0
  touchEndX.value = 0
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

function startAutoPlay() {
  if (!props.autoPlay) return
  autoPlayTimer.value = setInterval(() => {
    next()
  }, props.autoPlayInterval)
}

function stopAutoPlay() {
  if (autoPlayTimer.value) {
    clearInterval(autoPlayTimer.value)
    autoPlayTimer.value = null
  }
}

onMounted(() => {
  if (props.autoPlay) {
    startAutoPlay()
  }
})

onUnmounted(() => {
  stopAutoPlay()
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div 
    class="relative w-full h-full overflow-hidden rounded-lg border border-black"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @mousedown="handleMouseDown"
  >
    <!-- Image Container -->
    <div class="relative w-full h-full">
      <img 
        :src="currentImage" 
        :alt="`Image ${currentIndex + 1} of ${images.length}`"
        class="w-full h-96 md:h-full object-cover transition-opacity duration-300 ease-in-out"
        :class="{ 'opacity-98': !isTransitioning, 'opacity-100': isTransitioning }"
      />
    </div>

    <!-- Navigation Buttons -->
    <button
      v-if="images.length > 1"
      @click="prev"
      :disabled="!hasPrev || isTransitioning"
      class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-gray-200 p-2 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
      aria-label="Previous image"
    >
      <ChevronLeftIcon class="h-6 w-6" />
    </button>

    <button
      v-if="images.length > 1"
      @click="next"
      :disabled="!hasNext || isTransitioning"
      class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-gray-200 p-2 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
      aria-label="Next image"
    >
      <ChevronRightIcon class="h-6 w-6" />
    </button>

    <!-- Caption -->
    <div 
      v-if="caption"
      class="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col w-full gap-2 z-10 bg-gray-950/70 text-center py-1"
    >
      <p class="text-gray-200 text-sm">{{ caption }}</p>
    </div>

    <!-- Image Counter -->
    <div 
      v-if="images.length > 1"
      class="absolute top-1 right-1 bg-black/50 text-gray-200 px-3 py-1 rounded-md text-xs z-10"
    >
      {{ currentIndex + 1 }} / {{ images.length }}
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions */
.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

