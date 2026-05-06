<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'

type Post = {
  id: string
  title: string
  slug: string
  content: string
  cover_image_path: string | null
  published: boolean
  created_at: string
  updated_at: string
}

type PostImage = {
  id: string
  post_id: string
  storage_path: string
  publicUrl: string
}

// ── list state ────────────────────────────────────────────
const posts = ref<Post[]>([])
const loadingList = ref(false)

// ── editor state ──────────────────────────────────────────
const editing = ref<Post | null>(null)
const isNew = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

// attached images for the post being edited
const postImages = ref<PostImage[]>([])
const imageFile = ref<File | null>(null)
const uploadingImage = ref(false)
const coverFile = ref<File | null>(null)

// ── helpers ───────────────────────────────────────────────
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── fetch ─────────────────────────────────────────────────
async function fetchPosts() {
  loadingList.value = true
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .order('created_at', { ascending: false })
  posts.value = data ?? []
  loadingList.value = false
}

async function fetchPostImages(postId: string) {
  const { data } = await supabase
    .from('blog_post_images')
    .select('*')
    .eq('post_id', postId)
  postImages.value = (data ?? []).map(r => ({
    ...r,
    publicUrl: supabase.storage.from('blog').getPublicUrl(r.storage_path).data.publicUrl,
  }))
}

// ── editor actions ────────────────────────────────────────
function openNew() {
  isNew.value = true
  editing.value = { id: '', title: '', slug: '', content: '', cover_image_path: null, published: false, created_at: '', updated_at: '' }
  postImages.value = []
  error.value = null
  success.value = null
}

async function openEdit(post: Post) {
  isNew.value = false
  editing.value = { ...post }
  error.value = null
  success.value = null
  await fetchPostImages(post.id)
}

function cancelEdit() {
  editing.value = null
  postImages.value = []
  error.value = null
  success.value = null
}

function onTitleInput() {
  if (editing.value && isNew.value) {
    editing.value.slug = slugify(editing.value.title)
  }
}

async function uploadCover(): Promise<string | null> {
  if (!coverFile.value) return editing.value?.cover_image_path ?? null
  const ext = coverFile.value.name.split('.').pop()
  const path = `covers/${Date.now()}.${ext}`
  const { error: err } = await supabase.storage.from('blog').upload(path, coverFile.value)
  if (err) throw err
  return path
}

async function savePost() {
  if (!editing.value) return
  error.value = null
  success.value = null
  saving.value = true

  try {
    const coverPath = await uploadCover()

    if (isNew.value) {
      const { data, error: insertErr } = await supabase
        .from('blog_posts')
        .insert({ ...editing.value, id: undefined, cover_image_path: coverPath })
        .select()
        .single()
      if (insertErr) throw insertErr
      editing.value = data
      isNew.value = false
    } else {
      const { error: updateErr } = await supabase
        .from('blog_posts')
        .update({ title: editing.value.title, slug: editing.value.slug, content: editing.value.content, cover_image_path: coverPath, published: editing.value.published })
        .eq('id', editing.value.id)
      if (updateErr) throw updateErr
    }

    coverFile.value = null
    success.value = 'Mentve!'
    await fetchPosts()
  } catch (e: any) {
    error.value = e?.message ?? 'Hiba történt.'
  } finally {
    saving.value = false
  }
}

async function togglePublished(post: Post) {
  await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id)
  await fetchPosts()
  if (editing.value?.id === post.id) editing.value.published = !post.published
}

async function deletePost(post: Post) {
  if (!confirm(`Töröljük: "${post.title}"?`)) return
  await supabase.from('blog_posts').delete().eq('id', post.id)
  if (editing.value?.id === post.id) cancelEdit()
  await fetchPosts()
}

// ── inline image upload ───────────────────────────────────
function onImageFileChange(e: Event) {
  imageFile.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

async function uploadInlineImage() {
  if (!imageFile.value || !editing.value?.id) return
  uploadingImage.value = true
  error.value = null
  try {
    const ext = imageFile.value.name.split('.').pop()
    const path = `posts/${editing.value.id}/${Date.now()}.${ext}`
    const { error: storageErr } = await supabase.storage.from('blog').upload(path, imageFile.value)
    if (storageErr) throw storageErr
    const { error: dbErr } = await supabase.from('blog_post_images').insert({ post_id: editing.value.id, storage_path: path })
    if (dbErr) throw dbErr
    imageFile.value = null
    const input = document.getElementById('inline-img-input') as HTMLInputElement
    if (input) input.value = ''
    await fetchPostImages(editing.value.id)
  } catch (e: any) {
    error.value = e?.message
  } finally {
    uploadingImage.value = false
  }
}

async function deleteInlineImage(img: PostImage) {
  await supabase.storage.from('blog').remove([img.storage_path])
  await supabase.from('blog_post_images').delete().eq('id', img.id)
  if (editing.value?.id) await fetchPostImages(editing.value.id)
}

function copyUrl(url: string) {
  navigator.clipboard.writeText(url)
}

onMounted(fetchPosts)
</script>

<template>
  <div class="flex flex-col lg:flex-row gap-6">

    <!-- Post list panel -->
    <div class="lg:w-72 flex-shrink-0">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xl font-bold text-gray-800">Blog bejegyzések</h2>
        <button class="text-sm px-3 py-1.5 bg-gray-950 text-white rounded-md hover:-translate-y-0.5 transition" @click="openNew">+ Új</button>
      </div>

      <div v-if="loadingList" class="text-sm text-gray-500">Betöltés...</div>
      <ul v-else class="space-y-2">
        <li v-for="post in posts" :key="post.id"
          class="border border-gray-200 rounded-lg p-3 bg-white hover:border-gray-400 cursor-pointer transition"
          :class="{ 'border-gray-800 ring-1 ring-gray-800': editing?.id === post.id }"
          @click="openEdit(post)">
          <div class="flex items-start justify-between gap-1">
            <span class="text-sm font-medium text-gray-900 leading-tight line-clamp-2">{{ post.title }}</span>
            <span class="flex-shrink-0 text-xs px-1.5 py-0.5 rounded" :class="post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
              {{ post.published ? 'Élő' : 'Piszkozat' }}
            </span>
          </div>
          <div class="flex gap-2 mt-2">
            <button class="text-xs text-blue-600 hover:underline" @click.stop="togglePublished(post)">
              {{ post.published ? 'Piszkozat' : 'Közzétesz' }}
            </button>
            <button class="text-xs text-red-600 hover:underline" @click.stop="deletePost(post)">Törlés</button>
          </div>
        </li>
        <li v-if="!posts.length" class="text-xs text-gray-400 italic">Nincs bejegyzés</li>
      </ul>
    </div>

    <!-- Editor panel -->
    <div v-if="editing" class="flex-1 min-w-0 bg-white border border-gray-200 rounded-xl p-5">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ isNew ? 'Új bejegyzés' : 'Szerkesztés' }}</h3>

      <div class="space-y-4">
        <div>
          <label class="block text-xs text-gray-500 mb-1">Cím</label>
          <input v-model="editing.title" type="text" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" @input="onTitleInput" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Slug (URL)</label>
          <input v-model="editing.slug" type="text" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 font-mono" />
        </div>

        <!-- Cover image -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">Borítókép</label>
          <div v-if="editing.cover_image_path" class="mb-2">
            <img :src="supabase.storage.from('blog').getPublicUrl(editing.cover_image_path).data.publicUrl" class="h-24 rounded-md object-cover border border-gray-200" />
          </div>
          <input type="file" accept="image/*" class="text-sm" @change="e => coverFile = (e.target as HTMLInputElement).files?.[0] ?? null" />
        </div>

        <div>
          <label class="block text-xs text-gray-500 mb-1">Tartalom</label>
          <textarea v-model="editing.content" rows="14" class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900" placeholder="Írj ide... (Markdown támogatott)" />
        </div>

        <div class="flex items-center gap-2">
          <input id="pub-toggle" v-model="editing.published" type="checkbox" class="rounded" />
          <label for="pub-toggle" class="text-sm text-gray-700">Közzétéve (publikus)</label>
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="success" class="text-sm text-green-600">{{ success }}</p>

        <div class="flex gap-3">
          <button :disabled="saving" class="px-4 py-2 rounded-md bg-gray-950 text-white text-sm disabled:opacity-50 hover:-translate-y-0.5 transition" @click="savePost">
            {{ saving ? 'Mentés...' : 'Mentés' }}
          </button>
          <button class="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition" @click="cancelEdit">Mégse</button>
        </div>

        <!-- Inline images (only available after post is saved) -->
        <div v-if="!isNew" class="border-t border-gray-100 pt-4 mt-2">
          <h4 class="text-sm font-semibold text-gray-700 mb-3">Képek a bejegyzéshez</h4>

          <div class="flex items-end gap-3 mb-4">
            <div>
              <label class="block text-xs text-gray-500 mb-1">Kép feltöltése</label>
              <input id="inline-img-input" type="file" accept="image/*" class="text-sm" @change="onImageFileChange" />
            </div>
            <button :disabled="uploadingImage || !imageFile" class="px-3 py-1.5 rounded-md bg-gray-700 text-white text-xs disabled:opacity-50 hover:-translate-y-0.5 transition" @click="uploadInlineImage">
              {{ uploadingImage ? 'Feltöltés...' : 'Feltöltés' }}
            </button>
          </div>

          <p class="text-xs text-gray-400 mb-3">Kattints az URL gombra a kép linkjének másolásához, majd illeszd be a tartalomba: <code class="bg-gray-100 px-1 rounded">![leírás](URL)</code></p>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div v-for="img in postImages" :key="img.id" class="relative group rounded-lg overflow-hidden border border-gray-200">
              <img :src="img.publicUrl" class="w-full h-24 object-cover" />
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1.5">
                <button class="text-white text-xs bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded" @click="copyUrl(img.publicUrl)">URL másolása</button>
                <button class="text-white text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded" @click="deleteInlineImage(img)">Törlés</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex-1 flex items-center justify-center text-gray-400 text-sm">
      Válassz egy bejegyzést, vagy hozz létre újat.
    </div>
  </div>
</template>
