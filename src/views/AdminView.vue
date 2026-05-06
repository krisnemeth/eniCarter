<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import AdminGallery from '../components/admin/AdminGallery.vue'
import AdminBlog from '../components/admin/AdminBlog.vue'

type Tab = 'gallery' | 'blog'
const tab = ref<Tab>('gallery')
const router = useRouter()

async function logout() {
  await supabase.auth.signOut()
  router.push('/admin/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 pt-14">
    <!-- Admin header bar -->
    <div class="bg-gray-950 text-gray-100 px-6 py-3 flex items-center justify-between">
      <span class="font-gothic-rhapsody text-lg">Admin panel</span>
      <button class="text-sm text-gray-300 hover:text-white transition" @click="logout">Kijelentkezés</button>
    </div>

    <!-- Tab nav -->
    <div class="border-b border-gray-200 bg-white px-6">
      <div class="flex gap-6 text-sm">
        <button
          class="py-3 border-b-2 transition font-medium"
          :class="tab === 'gallery' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="tab = 'gallery'">
          Galéria
        </button>
        <button
          class="py-3 border-b-2 transition font-medium"
          :class="tab === 'blog' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="tab = 'blog'">
          Blog
        </button>
      </div>
    </div>

    <!-- Tab content -->
    <div class="max-w-6xl mx-auto px-4 py-8">
      <AdminGallery v-if="tab === 'gallery'" />
      <AdminBlog v-if="tab === 'blog'" />
    </div>
  </div>
</template>
