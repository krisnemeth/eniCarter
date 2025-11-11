<script setup lang="ts">
import { ref } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
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
    error.value = 'Name is required.'
    return
  }
  if (!validateEmail(state.value.email)) {
    error.value = 'A valid email is required.'
    return
  }
  if (!state.value.message.trim()) {
    error.value = 'Message is required.'
    return
  }

  loading.value = true
  try {
    await addDoc(collection(db, 'contacts'), {
      name: state.value.name.trim(),
      email: state.value.email.trim(),
      message: state.value.message.trim(),
      createdAt: serverTimestamp(),
    })

    // Optional: enqueue an email by writing to the `mail` collection.
    // This works with the Firebase "Trigger Email" extension.
    const toEmail = import.meta.env.VITE_CONTACT_NOTIFY_EMAIL as string | undefined
    if (toEmail) {
      const subject = `New contact from ${state.value.name}`
      const text = `Name: ${state.value.name}\nEmail: ${state.value.email}\n\n${state.value.message}`
      const html = `<p><strong>Name:</strong> ${state.value.name}</p><p><strong>Email:</strong> ${state.value.email}</p><p>${state.value.message.replace(/\n/g, '<br/>')}</p>`
      await addDoc(collection(db, 'mail'), {
        to: [toEmail],
        message: { subject, text, html },
      })
    }
    state.value = { name: '', email: '', message: '' }
    success.value = 'Köszönöm, hogy felvetted velem a kapcsolatot! Hamarosan válaszolok.'
  } catch (e: any) {
    error.value = e?.message ?? 'Valami hiba történt, kérlek próbáld újra.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section id="contact" class="h-full md:h-screen overflow-x-hidden pt-16 md:py-24">
    <div class="max-w-xl mx-auto px-4">
      <SectionTitle title="Kapcsolat" />

      <form class="my-4 space-y-5" @submit.prevent="onSubmit">
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
          <button type="submit" :disabled="loading" class="px-5 py-2.5 rounded-md bg-gray-950 text-gray-200 hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed w-full">
            <span v-if="!loading">Üzenet küldése</span>
            <span v-else>Küldés...</span>
          </button>
          <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
          <p v-if="success" class="text-sm text-green-600">{{ success }}</p>
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
</style>


