<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { supabase } from '../lib/supabase'

type Post = {
  id: string
  title: string
  slug: string
  content: string
  cover_image_path: string | null
  published: boolean
  created_at: string
}

const route = useRoute()
const post = ref<Post | null>(null)
const loading = ref(true)
const notFound = ref(false)

function coverUrl(path: string) {
  return supabase.storage.from('blog').getPublicUrl(path).data.publicUrl
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
}

// Lightweight Markdown → HTML (headings, bold, italic, links, images, paragraphs)
function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-lg max-w-full" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="underline text-gray-700 hover:text-gray-900" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n{2,}/g, '</p><p class="mb-4">')
    .replace(/^(?!<[h|i])(.+)/, '<p class="mb-4">$1')
    + (md.trim() ? '</p>' : '')
}

const html = computed(() => post.value ? renderMarkdown(post.value.content) : '')

onMounted(async () => {
  const slug = route.params.slug as string
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!data) notFound.value = true
  else post.value = data
  loading.value = false
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 pt-14">
    <div v-if="loading" class="flex items-center justify-center h-64 text-gray-400">Betöltés...</div>

    <div v-else-if="notFound" class="flex flex-col items-center justify-center h-64 gap-4">
      <p class="text-gray-500">A bejegyzés nem található.</p>
      <RouterLink to="/" class="text-sm underline text-gray-700">← Vissza a főoldalra</RouterLink>
    </div>

    <article v-else-if="post" class="max-w-3xl mx-auto px-4 py-12">
      <!-- Back link -->
      <RouterLink to="/#blog" class="text-sm text-gray-500 hover:text-gray-800 transition mb-6 inline-block">← Vissza</RouterLink>

      <!-- Cover -->
      <div v-if="post.cover_image_path" class="mb-8 rounded-xl overflow-hidden">
        <img :src="coverUrl(post.cover_image_path)" :alt="post.title" class="w-full max-h-96 object-cover" />
      </div>

      <p class="text-xs text-gray-400 mb-2">{{ formatDate(post.created_at) }}</p>
      <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight font-gothic-rhapsody">{{ post.title }}</h1>

      <!-- Content -->
      <div class="prose-gray text-gray-700 text-base leading-relaxed" v-html="html" />
    </article>
  </div>
</template>
