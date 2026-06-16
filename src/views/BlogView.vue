<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase, type Post } from '../lib/supabase'
import SectionTitle from '../components/SectionTitle.vue'

const posts = ref<Post[]>([])
const loading = ref(true)

const featuredPosts = computed(() => posts.value.slice(0, 3))
const olderPosts = computed(() => posts.value.slice(3))

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('hu-HU', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function excerpt(body: string): string {
  return body.replace(/[#*`>_~\[\]]/g, '').slice(0, 160).trim()
}

onMounted(async () => {
  const { data } = await supabase
    .from('posts')
    .select('id, title, slug, body, cover_image, published_at, created_at')
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

      <template v-else>
        <!-- Latest 3 as cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <RouterLink
            v-for="post in featuredPosts"
            :key="post.id"
            :to="`/blog/${post.slug}`"
            class="group flex flex-col bg-gray-200 border border-gray-900 rounded-xl overflow-hidden hover:-translate-y-1 transition-transform duration-200 shadow-sm hover:shadow-md"
          >
            <div
              v-if="post.cover_image"
              class="aspect-[16/10] overflow-hidden bg-gray-300"
            >
              <img
                :src="post.cover_image"
                :alt="post.title"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div class="flex flex-col flex-1 p-5">
              <h2 class="text-lg font-bold text-gray-950 group-hover:underline leading-snug mb-2">{{ post.title }}</h2>
              <p class="text-xs text-gray-500 mb-3">{{ formatDate(post.published_at ?? post.created_at) }}</p>
              <p class="text-sm text-gray-700 line-clamp-3 flex-1">{{ excerpt(post.body) }}…</p>
              <span class="mt-4 text-xs font-medium text-gray-950 underline underline-offset-2">Olvasd el →</span>
            </div>
          </RouterLink>
        </div>

        <!-- Older posts as a list -->
        <div v-if="olderPosts.length" class="mt-14">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Korábbi bejegyzések</h3>
          <ul class="divide-y divide-gray-300 border-t border-b border-gray-300">
            <li v-for="post in olderPosts" :key="post.id">
              <RouterLink
                :to="`/blog/${post.slug}`"
                class="group flex items-baseline justify-between gap-4 py-3.5 hover:bg-gray-200/60 px-2 -mx-2 rounded transition-colors"
              >
                <span class="text-sm font-medium text-gray-950 group-hover:underline truncate">{{ post.title }}</span>
                <span class="text-xs text-gray-500 shrink-0">{{ formatDate(post.published_at ?? post.created_at) }}</span>
              </RouterLink>
            </li>
          </ul>
        </div>
      </template>
    </div>
  </div>
</template>
