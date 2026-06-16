<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/vue/24/outline'

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

// added: track whether the user is actually dragging (prevents click -> mouseup from firing a navigation)
const isDragging = ref(false)

// Fullscreen modal state
const isFullscreen = ref(false)
const fullscreenIndex = ref(0)
const fsTouchStartX = ref(0)
const fsTouchEndX = ref(0)

const currentImage = computed(() => {
  return props.images[currentIndex.value] || props.images[0]
})

const fullscreenImage = computed(() => {
  return props.images[fullscreenIndex.value] || props.images[0]
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

// Touch / mouse handlers for main carousel
function handleTouchStart(e: TouchEvent) {
  touchStartX.value = e.touches[0].clientX
  touchEndX.value = 0
  isDragging.value = false
}

function handleTouchMove(e: TouchEvent) {
  const current = e.touches[0].clientX
  touchEndX.value = current
  if (Math.abs(current - touchStartX.value) > 6) {
    isDragging.value = true
  }
}

function handleTouchEnd() {
  // if it wasn't a drag, treat as a tap (do nothing here — click handler will open fullscreen)
  if (!isDragging.value) {
    touchStartX.value = 0
    touchEndX.value = 0
    return
  }

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
  isDragging.value = false
}

function handleMouseDown(e: MouseEvent) {
  touchStartX.value = e.clientX
  touchEndX.value = 0
  isDragging.value = false
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

function handleMouseMove(e: MouseEvent) {
  touchEndX.value = e.clientX
  if (Math.abs(e.clientX - touchStartX.value) > 6) {
    isDragging.value = true
  }
}

function handleMouseUp() {
  // if it wasn't a drag (i.e. was a click), don't treat as swipe
  if (!isDragging.value) {
    touchStartX.value = 0
    touchEndX.value = 0
    isDragging.value = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    return
  }

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
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

// Fullscreen/open modal helpers
function openFullscreen(index = currentIndex.value) {
  fullscreenIndex.value = index
  isFullscreen.value = true
  // stop page scroll and carousel autoplay while in fullscreen
  document.body.style.overflow = 'hidden'
  stopAutoPlay()
}

function closeFullscreen() {
  isFullscreen.value = false
  document.body.style.overflow = ''
  // restart autoplay if needed
  if (props.autoPlay) startAutoPlay()
}

// Fullscreen navigation (wrap-around)
function fsNext() {
  fullscreenIndex.value = (fullscreenIndex.value + 1) % props.images.length
}
function fsPrev() {
  fullscreenIndex.value = fullscreenIndex.value === 0 ? props.images.length - 1 : fullscreenIndex.value - 1
}

// Touch handlers for fullscreen browsing
function handleFsTouchStart(e: TouchEvent) {
  fsTouchStartX.value = e.touches[0].clientX
}
function handleFsTouchMove(e: TouchEvent) {
  fsTouchEndX.value = e.touches[0].clientX
}
function handleFsTouchEnd() {
  if (!fsTouchStartX.value || !fsTouchEndX.value) {
    fsTouchStartX.value = 0
    fsTouchEndX.value = 0
    return
  }
  const diff = fsTouchStartX.value - fsTouchEndX.value
  const minSwipeDistance = 50
  if (Math.abs(diff) > minSwipeDistance) {
    if (diff > 0) fsNext()
    else fsPrev()
  }
  fsTouchStartX.value = 0
  fsTouchEndX.value = 0
}

// Keyboard controls for fullscreen
function handleKeydown(e: KeyboardEvent) {
  if (!isFullscreen.value) return
  if (e.key === 'Escape') {
    closeFullscreen()
  } else if (e.key === 'ArrowRight') {
    fsNext()
  } else if (e.key === 'ArrowLeft') {
    fsPrev()
  }
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
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  stopAutoPlay()
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div 
    class="relative w-full h-full overflow-hidden rounded-lg border border-gray-950 shadow-sm shadow-gray-950"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
    @mousedown="handleMouseDown"
  >
    <!-- Image Container (click to open fullscreen) -->
    <div class="relative w-full h-full">
      <img 
        :src="currentImage" 
        :alt="`Image ${currentIndex + 1} of ${images.length}`"
        class="w-full h-96 md:h-full object-cover transition-opacity duration-300 ease-in-out cursor-zoom-in"
        :class="{ 'opacity-98': !isTransitioning, 'opacity-100': isTransitioning }"
        draggable="false"
        @click.stop="openFullscreen(currentIndex)"
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

    <!-- Fullscreen Overlay -->
    <div
      v-if="isFullscreen"
      class="fixed inset-0 z-50 flex items-center justify-center p-6 md:p-12 backdrop-blur-sm bg-black/60"
      role="dialog"
      aria-modal="true"
      @click="closeFullscreen"
      @touchstart.passive="handleFsTouchStart"
      @touchmove.passive="handleFsTouchMove"
      @touchend.passive="handleFsTouchEnd"
    >
      <!-- make the inner panel full-size but let clicks pass through by default -->
      <div class="relative mx-auto px-2 md:mx-auto lg:mx-32 w-full h-full max-w-[calc(100vw-40px)] max-h-[calc(100vh-100px)] pointer-events-none bg-gray-950 rounded-2xl" @click.stop="closeFullscreen">
        <!-- Close -->
        <button
          @click.stop="closeFullscreen"
          class="absolute top-3 right-3 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full pointer-events-auto"
          aria-label="Close fullscreen"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>

        <!-- Counter -->
        <div class="absolute top-3 left-3 z-20 bg-black/40 text-white px-3 py-1 rounded-md text-sm pointer-events-auto" @click.stop>
          {{ fullscreenIndex + 1 }} / {{ images.length }}
        </div>

        <!-- Prev / Next (fullscreen) -->
        <button
          @click.stop="fsPrev"
          class="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full pointer-events-auto"
          aria-label="Previous fullscreen"
        >
          <ChevronLeftIcon class="h-6 w-6" />
        </button>

        <button
          @click.stop="fsNext"
          class="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full pointer-events-auto"
          aria-label="Next fullscreen"
        >
          <ChevronRightIcon class="h-6 w-6" />
        </button>

        <!-- Image (scaled to fit, keeps aspect ratio) -->
        <div class="w-full h-full flex items-center justify-center pointer-events-auto" @click.stop>
          <img
            :src="fullscreenImage"
            :alt="`Image ${fullscreenIndex + 1} of ${images.length}`"
            class="max-w-full max-h-full object-contain rounded-md shadow-lg"
            draggable="false"
            @click.stop
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth transitions reused */
.transition-opacity {
  transition-property: opacity;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Slight tweak so fullscreen padding creates a visible margin on all screens */
/* Escape the square brackets so the CSS parser accepts these class selectors */
@media (min-width: 0px) {
  .max-w-\[calc\(100vw-48px\)\] {
    max-width: calc(100vw - 40px);
  }
  .max-h-\[calc\(100vh-48px\)\] {
    max-height: calc(100vh - 40px);
  }
}
</style>