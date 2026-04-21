<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase, type Post } from '../lib/supabase'
import SectionTitle from '../components/SectionTitle.vue'

const posts = ref<Post[]>([])
const loading = ref(true)

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('hu-HU', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

onMounted(async () => {
  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, body, published_at, created_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (data) posts.value = data as Post[]
  loading.value = false
})
</script>

<template>
  <div class="min-h-screen pt-20 pb-16">
    <div class="max-w-6xl mx-auto px-4">
      <SectionTitle title="Blog" />

      <div v-if="loading" class="flex justify-center py-24">
        <span class="text-gray-400 text-sm">Betöltés...</span>
      </div>

      <div v-else-if="posts.length === 0" class="py-24 text-center">
        <p class="text-gray-500 text-sm">Még nincsenek bejegyzések.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink
          v-for="post in posts"
          :key="post.id"
          :to="`/blog/${post.slug}`"
          class="group flex flex-col bg-gray-200 border border-gray-900 rounded-xl p-5 hover:-translate-y-1 transition-transform duration-200 shadow-sm hover:shadow-md"
        >
          <h2 class="text-lg font-bold text-gray-950 group-hover:underline leading-snug mb-2">{{ post.title }}</h2>
          <p class="text-xs text-gray-500 mb-3">{{ formatDate(post.published_at ?? post.created_at) }}</p>
          <p class="text-sm text-gray-700 line-clamp-4 flex-1">{{ post.body.replace(/[#*`>_~\[\]]/g, '').slice(0, 200) }}…</p>
          <span class="mt-4 text-xs font-medium text-gray-950 underline underline-offset-2">Olvasd el →</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
