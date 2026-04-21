<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { marked } from 'marked'
import { supabase, type Post } from '../lib/supabase'

const route = useRoute()
const post = ref<Post | null>(null)
const loading = ref(true)
const notFound = ref(false)

const renderedBody = computed(() => {
  if (!post.value?.body) return ''
  return marked.parse(post.value.body) as string
})

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('hu-HU', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

onMounted(async () => {
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', route.params.slug as string)
    .eq('published', true)
    .single()

  if (data) {
    post.value = data as Post
  } else {
    notFound.value = true
  }
  loading.value = false
})
</script>

<template>
  <div class="min-h-screen pt-20 pb-16">
    <div class="max-w-2xl mx-auto px-4">

      <div v-if="loading" class="flex justify-center py-24">
        <span class="text-gray-400 text-sm">Betöltés...</span>
      </div>

      <div v-else-if="notFound" class="py-24 text-center">
        <p class="text-gray-500 text-sm mb-4">A bejegyzés nem található.</p>
        <RouterLink to="/blog" class="text-sm text-gray-950 underline">← Vissza a blogra</RouterLink>
      </div>

      <template v-else-if="post">
        <RouterLink to="/blog" class="inline-block text-xs text-gray-500 hover:text-gray-950 mb-8 transition-colors">← Blog</RouterLink>

        <div class="border-t border-gray-950/20 pt-4 mb-8">
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-gray-950 mb-3">{{ post.title }}</h1>
          <p class="text-xs text-gray-500">{{ formatDate(post.published_at ?? post.created_at) }}</p>
        </div>

        <!-- Rendered markdown content -->
        <div class="prose prose-gray max-w-none text-gray-700 text-sm md:text-base leading-relaxed" v-html="renderedBody" />
      </template>

    </div>
  </div>
</template>

<style scoped>
/* Prose styles since we're not using @tailwindcss/typography */
:deep(h1), :deep(h2), :deep(h3) {
  font-weight: 700;
  color: #030712;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
:deep(h2) { font-size: 1.25rem; }
:deep(h3) { font-size: 1.1rem; }
:deep(p) { margin-bottom: 1rem; }
:deep(a) { color: #030712; text-decoration: underline; }
:deep(ul), :deep(ol) { padding-left: 1.5rem; margin-bottom: 1rem; }
:deep(li) { margin-bottom: 0.25rem; }
:deep(blockquote) {
  border-left: 3px solid #d1d5db;
  padding-left: 1rem;
  color: #6b7280;
  font-style: italic;
  margin: 1rem 0;
}
:deep(code) {
  background: #e5e7eb;
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}
:deep(pre) {
  background: #1f2937;
  color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}
:deep(hr) { border-color: #e5e7eb; margin: 2rem 0; }
:deep(img) { border-radius: 0.5rem; max-width: 100%; }
</style>
