<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const router = useRouter()

async function login() {
  error.value = null
  loading.value = true
  try {
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    })
    if (authError) throw authError
    router.push('/admin')
  } catch (e: any) {
    error.value = e?.message ?? 'Login failed.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 pt-14">
    <div class="bg-white rounded-xl border border-gray-200 shadow-md p-8 w-full max-w-sm">
      <h1 class="text-2xl font-bold text-gray-900 mb-6 text-center font-gothic-rhapsody">Admin belépés</h1>
      <form class="space-y-4" @submit.prevent="login">
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Email</label>
          <input v-model="email" type="email" required class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-500 mb-1">Jelszó</label>
          <input v-model="password" type="password" required class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
        </div>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <button type="submit" :disabled="loading" class="w-full py-2.5 rounded-md bg-gray-950 text-gray-100 text-sm font-medium hover:-translate-y-0.5 transition disabled:opacity-60">
          {{ loading ? 'Belépés...' : 'Belépés' }}
        </button>
      </form>
    </div>
  </div>
</template>
