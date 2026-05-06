<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '../lib/supabase'
import SectionTitle from './SectionTitle.vue'

type Post = {
  id: string
  title: string
  slug: string
  content: string
  cover_image_path: string | null
  published: boolean
  created_at: string
}

const posts = ref<Post[]>([])
const loading = ref(true)

function coverUrl(path: string) {
  return supabase.storage.from('blog').getPublicUrl(path).data.publicUrl
}

function excerpt(content: string, length = 160) {
  const plain = content.replace(/[#*_`[\]!]/g, '').trim()
  return plain.length > length ? plain.slice(0, length) + '…' : plain
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(async () => {
  const { data } = await supabase
    .from('blog_posts')
    .select('id, title, slug, content, cover_image_path, published, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(6)
  posts.value = data ?? []
  loading.value = false
})
</script>

<template>
  <section v-if="loading || posts.length" id="blog" class="h-full overflow-x-hidden pt-16 md:py-24">
    <div class="max-w-6xl mx-auto px-4 w-full">
      <SectionTitle title="Blog" />

      <div v-if="loading" class="text-sm text-gray-500">Betöltés...</div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <RouterLink
          v-for="post in posts"
          :key="post.id"
          :to="`/blog/${post.slug}`"
          class="group flex flex-col rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-md transition-shadow">

          <!-- Cover image -->
          <div class="h-48 bg-gray-100 overflow-hidden">
            <img
              v-if="post.cover_image_path"
              :src="coverUrl(post.cover_image_path)"
              :alt="post.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300 text-4xl font-gothic-rhapsody">EC</div>
          </div>

          <!-- Card body -->
          <div class="flex flex-col flex-1 p-4">
            <p class="text-xs text-gray-400 mb-1">{{ formatDate(post.created_at) }}</p>
            <h3 class="text-base font-semibold text-gray-900 mb-2 group-hover:underline leading-snug">{{ post.title }}</h3>
            <p class="text-sm text-gray-600 flex-1">{{ excerpt(post.content) }}</p>
            <span class="mt-3 text-xs font-medium text-gray-900 group-hover:underline self-start">Tovább →</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>
