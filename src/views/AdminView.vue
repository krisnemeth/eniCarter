<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { supabase, type Post, type GalleryImage } from '../lib/supabase'
import { toWebp } from '../lib/image'
import type { User } from '@supabase/supabase-js'
import SectionTitle from '../components/SectionTitle.vue'

// ─── Auth ────────────────────────────────────────────────────────────────────
const user = ref<User | null>(null)
const authEmail = ref('')
const authPassword = ref('')
const authLoading = ref(false)
const authMessage = ref<{ type: 'success' | 'error'; text: string } | null>(null)
const authChecking = ref(true)

async function signIn() {
  if (!authEmail.value.trim() || !authPassword.value) return
  authLoading.value = true
  authMessage.value = null
  const { error } = await supabase.auth.signInWithPassword({
    email: authEmail.value.trim(),
    password: authPassword.value,
  })
  if (error) {
    authMessage.value = { type: 'error', text: 'Hibás email cím vagy jelszó.' }
  } else {
    authPassword.value = ''
  }
  authLoading.value = false
}

async function signOut() {
  // scope:'local' clears the browser session without the global /logout
  // round-trip, which can throw if the stored refresh token is already
  // invalid. Reset UI state in finally so logout always lands on the form.
  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch {
    // session may already be gone server-side; clearing local state is enough
  } finally {
    user.value = null
    activeTab.value = 'blog'
  }
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const activeTab = ref<'blog' | 'gallery'>('blog')

// ─── Blog ─────────────────────────────────────────────────────────────────────
const posts = ref<Post[]>([])
const postLoading = ref(false)
const editingPost = ref<Partial<Post> | null>(null)
const postSaving = ref(false)
const postError = ref<string | null>(null)

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function newPost() {
  editingPost.value = { title: '', slug: '', body: '', cover_image: null, published: false }
}

// Cover image upload for the post being edited
const coverUploading = ref(false)

async function uploadCover(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length || !editingPost.value) return
  coverUploading.value = true
  postError.value = null

  const file = await toWebp(input.files[0])
  const path = `blog/${Date.now()}.webp`

  const { error: uploadErr } = await supabase.storage
    .from('gallery')
    .upload(path, file, { contentType: 'image/webp' })
  if (uploadErr) {
    postError.value = uploadErr.message
  } else {
    const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path)
    editingPost.value.cover_image = urlData.publicUrl
  }

  input.value = ''
  coverUploading.value = false
}

function removeCover() {
  if (editingPost.value) editingPost.value.cover_image = null
}

function editPost(post: Post) {
  editingPost.value = { ...post }
}

function cancelEdit() {
  editingPost.value = null
  postError.value = null
}

function onTitleInput() {
  if (editingPost.value && !editingPost.value.id) {
    editingPost.value.slug = slugify(editingPost.value.title ?? '')
  }
}

async function savePost() {
  if (!editingPost.value) return
  if (!editingPost.value.title?.trim()) { postError.value = 'A cím kötelező.'; return }
  if (!editingPost.value.slug?.trim()) { postError.value = 'A slug kötelező.'; return }
  if (!editingPost.value.body?.trim()) { postError.value = 'A szöveg kötelező.'; return }

  postSaving.value = true
  postError.value = null

  const payload = {
    title: editingPost.value.title.trim(),
    slug: editingPost.value.slug.trim(),
    body: editingPost.value.body.trim(),
    cover_image: editingPost.value.cover_image ?? null,
    published: editingPost.value.published ?? false,
    published_at: editingPost.value.published
      ? (editingPost.value.published_at ?? new Date().toISOString())
      : null,
  }

  if (editingPost.value.id) {
    const { error } = await supabase.from('posts').update(payload).eq('id', editingPost.value.id)
    if (error) { postError.value = error.message; postSaving.value = false; return }
    const idx = posts.value.findIndex(p => p.id === editingPost.value!.id)
    if (idx >= 0) posts.value[idx] = { ...posts.value[idx], ...payload }
  } else {
    const { data, error } = await supabase.from('posts').insert(payload).select().single()
    if (error) { postError.value = error.message; postSaving.value = false; return }
    if (data) posts.value.unshift(data as Post)
  }

  postSaving.value = false
  editingPost.value = null
}

async function togglePublished(post: Post) {
  const published = !post.published
  const published_at = published ? (post.published_at ?? new Date().toISOString()) : null
  const { error } = await supabase.from('posts').update({ published, published_at }).eq('id', post.id)
  if (!error) {
    post.published = published
    post.published_at = published_at
  }
}

async function deletePost(id: string) {
  if (!confirm('Biztosan törlöd ezt a bejegyzést?')) return
  await supabase.from('posts').delete().eq('id', id)
  posts.value = posts.value.filter(p => p.id !== id)
}

async function loadPosts() {
  postLoading.value = true
  const { data } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
  if (data) posts.value = data as Post[]
  postLoading.value = false
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
const galleryImages = ref<GalleryImage[]>([])
const galleryLoading = ref(false)
const uploading = ref(false)
const uploadCategory = ref<'fresh' | 'designs'>('fresh')
const uploadError = ref<string | null>(null)
const galleryFilter = ref<'all' | 'fresh' | 'designs'>('all')

const filteredImages = computed(() =>
  galleryFilter.value === 'all'
    ? galleryImages.value
    : galleryImages.value.filter(i => i.category === galleryFilter.value)
)

async function loadGallery() {
  galleryLoading.value = true
  const { data } = await supabase
    .from('gallery_images')
    .select('*')
    .order('sort_order', { ascending: true })
  if (data) galleryImages.value = data as GalleryImage[]
  galleryLoading.value = false
}

async function uploadImage(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files?.length) return
  uploading.value = true
  uploadError.value = null

  const files = Array.from(input.files)
  const maxOrder = galleryImages.value.filter(i => i.category === uploadCategory.value).length

  for (let i = 0; i < files.length; i++) {
    const file = await toWebp(files[i])
    const path = `${uploadCategory.value}/${Date.now()}_${i}.webp`

    const { error: uploadErr } = await supabase.storage
      .from('gallery')
      .upload(path, file, { contentType: 'image/webp' })
    if (uploadErr) { uploadError.value = uploadErr.message; continue }

    const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(path)
    const { data: row, error: rowErr } = await supabase
      .from('gallery_images')
      .insert({
        url: urlData.publicUrl,
        category: uploadCategory.value,
        visible: true,
        sort_order: maxOrder + i,
      })
      .select()
      .single()

    if (!rowErr && row) galleryImages.value.push(row as GalleryImage)
  }

  input.value = ''
  uploading.value = false
}

async function toggleVisible(img: GalleryImage) {
  const visible = !img.visible
  const { error } = await supabase.from('gallery_images').update({ visible }).eq('id', img.id)
  if (!error) img.visible = visible
}

async function deleteImage(img: GalleryImage) {
  if (!confirm('Biztosan törlöd ezt a képet?')) return
  // Extract storage path from URL
  const url = new URL(img.url)
  const path = url.pathname.split('/object/public/gallery/')[1]
  if (path) await supabase.storage.from('gallery').remove([path])
  await supabase.from('gallery_images').delete().eq('id', img.id)
  galleryImages.value = galleryImages.value.filter(i => i.id !== img.id)
}

async function moveSortOrder(img: GalleryImage, dir: -1 | 1) {
  const list = galleryImages.value.filter(i => i.category === img.category)
  const idx = list.findIndex(i => i.id === img.id)
  const swapIdx = idx + dir
  if (swapIdx < 0 || swapIdx >= list.length) return

  const a = list[idx]
  const b = list[swapIdx]
  const tmpOrder = a.sort_order
  a.sort_order = b.sort_order
  b.sort_order = tmpOrder

  await Promise.all([
    supabase.from('gallery_images').update({ sort_order: a.sort_order }).eq('id', a.id),
    supabase.from('gallery_images').update({ sort_order: b.sort_order }).eq('id', b.id),
  ])

  galleryImages.value = [...galleryImages.value].sort((x, y) => x.sort_order - y.sort_order)
}

// ─── Init ──────────────────────────────────────────────────────────────────────
onMounted(async () => {
  const { data } = await supabase.auth.getSession()
  user.value = data.session?.user ?? null
  authChecking.value = false

  if (user.value) {
    await Promise.all([loadPosts(), loadGallery()])
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    user.value = session?.user ?? null
    if (user.value) {
      await Promise.all([loadPosts(), loadGallery()])
    }
  })
})
</script>

<template>
  <div class="min-h-screen pt-20 pb-16">
    <div class="max-w-6xl mx-auto px-4">

      <!-- Auth check -->
      <div v-if="authChecking" class="flex justify-center py-24">
        <span class="text-gray-400 text-sm">Betöltés...</span>
      </div>

      <!-- Login -->
      <template v-else-if="!user">
        <SectionTitle title="Admin belépés" />
        <div class="max-w-sm mx-auto mt-12">
          <div class="bg-gray-200 border border-gray-900 rounded-xl p-6 space-y-4">
            <p class="text-sm text-gray-600">Add meg az email címedet és a jelszavadat a belépéshez.</p>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input
                v-model="authEmail"
                type="email"
                autocomplete="username"
                placeholder="te@example.com"
                class="block w-full rounded-md border border-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950 bg-gray-100"
                @keyup.enter="signIn"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Jelszó</label>
              <input
                v-model="authPassword"
                type="password"
                autocomplete="current-password"
                class="block w-full rounded-md border border-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950 bg-gray-100"
                @keyup.enter="signIn"
              />
            </div>
            <button
              @click="signIn"
              :disabled="authLoading"
              class="w-full px-5 py-2.5 rounded-md bg-gray-950 text-gray-200 text-sm hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed transition shadow-md"
            >
              {{ authLoading ? 'Belépés...' : 'Belépés' }}
            </button>
            <p v-if="authMessage" :class="authMessage.type === 'success' ? 'text-green-700' : 'text-red-600'" class="text-xs">
              {{ authMessage.text }}
            </p>
          </div>
        </div>
      </template>

      <!-- Admin dashboard -->
      <template v-else>
        <div class="flex items-center justify-between mb-2">
          <SectionTitle title="Admin" />
          <button @click="signOut" class="text-xs text-gray-500 hover:text-gray-950 underline transition-colors">Kilépés</button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 mb-8 border-b border-gray-300">
          <button
            @click="activeTab = 'blog'"
            :class="activeTab === 'blog' ? 'border-b-2 border-gray-950 text-gray-950 font-semibold' : 'text-gray-500 hover:text-gray-700'"
            class="px-4 py-2 text-sm transition-colors -mb-px"
          >Blog</button>
          <button
            @click="activeTab = 'gallery'"
            :class="activeTab === 'gallery' ? 'border-b-2 border-gray-950 text-gray-950 font-semibold' : 'text-gray-500 hover:text-gray-700'"
            class="px-4 py-2 text-sm transition-colors -mb-px"
          >Galéria</button>
        </div>

        <!-- ── BLOG TAB ─────────────────────────────────────────────────────── -->
        <div v-if="activeTab === 'blog'">

          <!-- Post editor -->
          <div v-if="editingPost" class="bg-gray-200 border border-gray-900 rounded-xl p-5 mb-8 space-y-4">
            <h3 class="font-bold text-gray-950">{{ editingPost.id ? 'Szerkesztés' : 'Új bejegyzés' }}</h3>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Cím</label>
              <input
                v-model="editingPost.title"
                type="text"
                class="block w-full rounded-md border border-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950 bg-gray-100"
                @input="onTitleInput"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Slug (URL)</label>
              <input
                v-model="editingPost.slug"
                type="text"
                class="block w-full rounded-md border border-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950 bg-gray-100 font-mono"
              />
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Borítókép</label>
              <div v-if="editingPost.cover_image" class="mb-2">
                <div class="relative inline-block">
                  <img :src="editingPost.cover_image" alt="Borítókép" class="h-32 w-auto rounded-md border border-gray-400 object-cover" />
                  <button
                    type="button"
                    @click="removeCover"
                    class="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow hover:bg-red-700"
                    title="Borítókép eltávolítása"
                  >✕</button>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  :disabled="coverUploading"
                  class="text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:bg-gray-950 file:text-gray-200 file:text-xs file:cursor-pointer hover:file:opacity-90 disabled:opacity-50"
                  @change="uploadCover"
                />
                <span v-if="coverUploading" class="text-xs text-gray-500">Feltöltés...</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Tartalom (Markdown)</label>
              <textarea
                v-model="editingPost.body"
                rows="14"
                class="block w-full rounded-md border border-gray-400 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-950 bg-gray-100 font-mono"
              />
            </div>

            <div class="flex items-center gap-2">
              <input id="published-check" v-model="editingPost.published" type="checkbox" class="rounded border-gray-400 cursor-pointer" />
              <label for="published-check" class="text-sm text-gray-700 cursor-pointer select-none">Publikálva</label>
            </div>

            <p v-if="postError" class="text-xs text-red-600">{{ postError }}</p>

            <div class="flex gap-3">
              <button
                @click="savePost"
                :disabled="postSaving"
                class="px-5 py-2 rounded-md bg-gray-950 text-gray-200 text-sm hover:-translate-y-0.5 disabled:opacity-60 transition shadow-md"
              >
                {{ postSaving ? 'Mentés...' : 'Mentés' }}
              </button>
              <button
                @click="cancelEdit"
                class="px-5 py-2 rounded-md border border-gray-400 text-gray-700 text-sm hover:bg-gray-300 transition"
              >Mégse</button>
            </div>
          </div>

          <!-- Post list header -->
          <div class="flex items-center justify-between mb-4">
            <p class="text-sm text-gray-500">{{ posts.length }} bejegyzés</p>
            <button
              @click="newPost"
              class="px-4 py-2 rounded-md bg-gray-950 text-gray-200 text-sm hover:-translate-y-0.5 transition shadow-md"
            >+ Új bejegyzés</button>
          </div>

          <!-- Post list -->
          <div v-if="postLoading" class="text-gray-400 text-sm py-8 text-center">Betöltés...</div>
          <div v-else-if="posts.length === 0" class="text-gray-400 text-sm py-8 text-center">Még nincsenek bejegyzések.</div>
          <div v-else class="space-y-3">
            <div
              v-for="post in posts"
              :key="post.id"
              class="flex items-center justify-between bg-gray-200 border border-gray-300 rounded-lg px-4 py-3"
            >
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-950 text-sm truncate">{{ post.title }}</p>
                <p class="text-xs text-gray-500 font-mono mt-0.5">/blog/{{ post.slug }}</p>
              </div>
              <div class="flex items-center gap-3 ml-4 shrink-0">
                <span
                  :class="post.published ? 'bg-green-100 text-green-800' : 'bg-gray-300 text-gray-600'"
                  class="text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer select-none"
                  @click="togglePublished(post)"
                  title="Kattints a státusz váltásához"
                >{{ post.published ? 'Publikált' : 'Piszkozat' }}</span>
                <button @click="editPost(post)" class="text-xs text-gray-500 hover:text-gray-950 transition-colors">Szerkesztés</button>
                <button @click="deletePost(post.id)" class="text-xs text-red-500 hover:text-red-700 transition-colors">Törlés</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ── GALLERY TAB ─────────────────────────────────────────────────── -->
        <div v-if="activeTab === 'gallery'">

          <!-- Upload -->
          <div class="bg-gray-200 border border-gray-900 rounded-xl p-5 mb-8">
            <h3 class="font-bold text-gray-950 mb-4">Képek feltöltése</h3>
            <div class="flex flex-wrap items-end gap-4">
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Kategória</label>
                <select
                  v-model="uploadCategory"
                  class="rounded-md border border-gray-400 px-3 py-2 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-950"
                >
                  <option value="fresh">Kész tetoválások</option>
                  <option value="designs">Egyedi minták</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-500 mb-1">Képfájl(ok)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  :disabled="uploading"
                  class="text-sm text-gray-700 file:mr-3 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:bg-gray-950 file:text-gray-200 file:text-xs file:cursor-pointer hover:file:opacity-90 disabled:opacity-50"
                  @change="uploadImage"
                />
              </div>
              <span v-if="uploading" class="text-xs text-gray-500">Feltöltés...</span>
            </div>
            <p v-if="uploadError" class="text-xs text-red-600 mt-2">{{ uploadError }}</p>
          </div>

          <!-- Filter -->
          <div class="flex gap-2 mb-4">
            <button v-for="f in (['all', 'fresh', 'designs'] as const)" :key="f"
              @click="galleryFilter = f"
              :class="galleryFilter === f ? 'bg-gray-950 text-gray-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'"
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
            >{{ f === 'all' ? 'Összes' : f === 'fresh' ? 'Kész tetoválások' : 'Egyedi minták' }}</button>
          </div>

          <!-- Image grid -->
          <div v-if="galleryLoading" class="text-gray-400 text-sm py-8 text-center">Betöltés...</div>
          <div v-else-if="filteredImages.length === 0" class="text-gray-400 text-sm py-8 text-center">Nincsenek képek.</div>
          <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <div
              v-for="img in filteredImages"
              :key="img.id"
              class="group relative bg-gray-200 rounded-lg border border-gray-300 overflow-hidden"
            >
              <img
                :src="img.url"
                :alt="img.category"
                class="w-full h-36 object-cover"
                :class="{ 'opacity-40': !img.visible }"
              />

              <!-- Overlay controls -->
              <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <button
                  @click="toggleVisible(img)"
                  class="px-2 py-1 rounded text-xs bg-gray-950 text-gray-200"
                >{{ img.visible ? 'Elrejtés' : 'Megjelenítés' }}</button>
                <div class="flex gap-1">
                  <button @click="moveSortOrder(img, -1)" class="px-2 py-1 rounded text-xs bg-gray-800 text-gray-200">↑</button>
                  <button @click="moveSortOrder(img, 1)" class="px-2 py-1 rounded text-xs bg-gray-800 text-gray-200">↓</button>
                </div>
                <button @click="deleteImage(img)" class="px-2 py-1 rounded text-xs bg-red-700 text-white">Törlés</button>
              </div>

              <!-- Hidden badge -->
              <div v-if="!img.visible" class="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">Rejtett</div>
              <!-- Category badge -->
              <div class="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
                {{ img.category === 'fresh' ? 'Kész' : 'Minta' }}
              </div>
            </div>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>
