<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../../lib/supabase'

type GalleryRow = {
  id: string
  category: 'fresh' | 'designs'
  storage_path: string
  display_name: string | null
  sort_order: number
  publicUrl: string
}

const rows = ref<GalleryRow[]>([])
const loading = ref(false)
const uploading = ref(false)
const uploadCategory = ref<'fresh' | 'designs'>('fresh')
const uploadFiles = ref<FileList | null>(null)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

async function fetchImages() {
  loading.value = true
  const { data, error: fetchErr } = await supabase
    .from('gallery_images')
    .select('*')
    .order('category')
    .order('sort_order', { ascending: true })
  loading.value = false
  if (fetchErr) { error.value = fetchErr.message; return }
  rows.value = (data ?? []).map(r => ({
    ...r,
    publicUrl: supabase.storage.from('gallery').getPublicUrl(r.storage_path).data.publicUrl,
  }))
}

function onFileChange(e: Event) {
  uploadFiles.value = (e.target as HTMLInputElement).files
}

async function uploadImages() {
  if (!uploadFiles.value?.length) return
  uploading.value = true
  error.value = null
  success.value = null

  const files = Array.from(uploadFiles.value)
  const maxOrder = rows.value.filter(r => r.category === uploadCategory.value).length

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const ext = file.name.split('.').pop()
    const path = `${uploadCategory.value}/${Date.now()}-${i}.${ext}`

    const { error: storageErr } = await supabase.storage.from('gallery').upload(path, file)
    if (storageErr) { error.value = storageErr.message; break }

    const { error: dbErr } = await supabase.from('gallery_images').insert({
      category: uploadCategory.value,
      storage_path: path,
      display_name: file.name,
      sort_order: maxOrder + i,
    })
    if (dbErr) { error.value = dbErr.message; break }
  }

  uploading.value = false
  uploadFiles.value = null
  const input = document.getElementById('gallery-file-input') as HTMLInputElement
  if (input) input.value = ''

  if (!error.value) success.value = 'Feltöltve!'
  await fetchImages()
}

async function deleteImage(row: GalleryRow) {
  if (!confirm(`Töröljük: ${row.display_name ?? row.storage_path}?`)) return
  const { error: storageErr } = await supabase.storage.from('gallery').remove([row.storage_path])
  if (storageErr) { error.value = storageErr.message; return }
  const { error: dbErr } = await supabase.from('gallery_images').delete().eq('id', row.id)
  if (dbErr) { error.value = dbErr.message; return }
  await fetchImages()
}

onMounted(fetchImages)
</script>

<template>
  <div>
    <h2 class="text-xl font-bold text-gray-800 mb-4">Galéria kezelése</h2>

    <!-- Upload form -->
    <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">Képek feltöltése</h3>
      <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div>
          <label class="block text-xs text-gray-500 mb-1">Kategória</label>
          <select v-model="uploadCategory" class="rounded-md border border-gray-300 px-2 py-1.5 text-sm">
            <option value="fresh">Kész tetoválások</option>
            <option value="designs">Egyedi minták</option>
          </select>
        </div>
        <div class="flex-1">
          <label class="block text-xs text-gray-500 mb-1">Fájlok</label>
          <input id="gallery-file-input" type="file" multiple accept="image/*" class="text-sm" @change="onFileChange" />
        </div>
        <button :disabled="uploading || !uploadFiles?.length" class="px-4 py-2 rounded-md bg-gray-950 text-white text-sm disabled:opacity-50 hover:-translate-y-0.5 transition" @click="uploadImages">
          {{ uploading ? 'Feltöltés...' : 'Feltöltés' }}
        </button>
      </div>
      <p v-if="error" class="mt-2 text-xs text-red-600">{{ error }}</p>
      <p v-if="success" class="mt-2 text-xs text-green-600">{{ success }}</p>
    </div>

    <!-- Image grid -->
    <div v-if="loading" class="text-sm text-gray-500">Betöltés...</div>
    <div v-else>
      <div v-for="cat in (['fresh', 'designs'] as const)" :key="cat" class="mb-8">
        <h3 class="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wider">
          {{ cat === 'fresh' ? 'Kész tetoválások' : 'Egyedi minták' }}
        </h3>
        <div v-if="!rows.filter(r => r.category === cat).length" class="text-xs text-gray-400 italic">Nincs kép</div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <div v-for="row in rows.filter(r => r.category === cat)" :key="row.id" class="relative group rounded-lg overflow-hidden border border-gray-200">
            <img :src="row.publicUrl" :alt="row.display_name ?? ''" class="w-full h-28 object-cover" />
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <button class="text-white text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded" @click="deleteImage(row)">Törlés</button>
            </div>
            <p class="text-xs text-gray-500 truncate px-1 py-0.5">{{ row.display_name ?? row.storage_path }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
