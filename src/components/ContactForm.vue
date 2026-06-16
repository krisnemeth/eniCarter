<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { supabase } from '../lib/supabase'
import SectionTitle from './SectionTitle.vue'

type State = {
  name: string
  email: string
  message: string
}

const state = ref<State>({ name: '', email: '', message: '' })
const loading = ref(false)
const success = ref<string | null>(null)
const error = ref<string | null>(null)

function validateEmail(email: string): boolean {
  return /.+@.+\..+/.test(email)
}

async function onSubmit() {
  error.value = null
  success.value = null

  if (!state.value.name.trim()) {
    error.value = 'A név megadása kötelező.'
    return
  }
  if (!validateEmail(state.value.email)) {
    error.value = 'Érvényes email cím szükséges.'
    return
  }
  if (!state.value.message.trim()) {
    error.value = 'Az üzenet megadása kötelező.'
    return
  }

  loading.value = true
  try {
    const { error: dbError } = await supabase.from('contacts').insert({
      name: state.value.name.trim(),
      email: state.value.email.trim(),
      message: state.value.message.trim(),
    })

    if (dbError) throw dbError

    // Fire email notification via Supabase Edge Function (non-blocking)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
    fetch(`${supabaseUrl}/functions/v1/send-contact-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: state.value.name.trim(),
        email: state.value.email.trim(),
        message: state.value.message.trim(),
      }),
    }).catch(() => {
      // email notification is best-effort; don't surface errors to the user
    })

    state.value = { name: '', email: '', message: '' }
    success.value = 'Köszönöm, hogy felvetted velem a kapcsolatot! Hamarosan válaszolok.'
  } catch (e: any) {
    error.value = e?.message ?? 'Valami hiba történt, kérlek próbáld újra.'
  } finally {
    loading.value = false
  }
}

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
    if ('addEventListener' in mql) {
      mql.addEventListener('change', updateIsDesktop)
    } else {
      ;(mql as any).addListener(updateIsDesktop)
    }
  }
})

onUnmounted(() => {
  if (!mql) return
  if ('removeEventListener' in mql) {
    mql.removeEventListener('change', updateIsDesktop)
  } else {
    ;(mql as any).removeListener(updateIsDesktop)
  }
})
</script>

<template>
  <section id="contact" class="h-full lg:h-full overflow-x-hidden pt-16 md:py-24">

    <div class="max-w-6xl mx-auto px-4 w-full">
      <SectionTitle title="Kapcsolat" />

      <div class="grid grid-cols-1 md:grid-cols-2 items-center justify-center w-full gap-4 md:gap-8 mb-6 md:mb-0">

        <div class="flex flex-col items-center justify-center w-full h-full bg-gray-200 rounded-lg border border-gray-900 p-3">
          <form class="w-full space-y-3" @submit.prevent="onSubmit">
            <div>
              <label class="block text-xs font-medium text-gray-500">Név</label>
              <input v-model="state.name" type="text" class="mt-1 block w-full rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500">Email</label>
              <input v-model="state.email" type="email" class="mt-1 block w-full rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500">Üzenet</label>
              <textarea v-model="state.message" rows="5" class="mt-1 block w-full rounded-md border border-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-100" />
            </div>

            <div class="flex flex-col items-center gap-3">
              <button type="submit" :disabled="loading" class="px-5 py-2.5 rounded-md bg-gray-950 text-gray-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed w-full cursor-pointer transition shadow-md hover:shadow-lg">
                <span v-if="!loading">Üzenet küldése</span>
                <span v-else>Küldés...</span>
              </button>
              <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
              <p v-if="success" class="text-sm text-green-600">{{ success }}</p>
            </div>
          </form>
        </div>

        <div class="hidden md:flex flex-col items-center justify-center w-full h-full">
          <img src="../assets/img/Vertical/KATA3795.webp" alt="Image of Lucky Cat" class="h-[450px] w-full object-cover object-[25%_75%] rounded-xl overflow-hidden border border-gray-900" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
