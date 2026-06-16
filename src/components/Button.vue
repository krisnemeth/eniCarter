<script setup lang="ts">
const props = withDefaults(defineProps<{
  buttonText?: string
  link?: string
}>(), {
  link: '',
  buttonText: ''
})
</script>

<template>
    <div class="mt-6 flex items-center gap-3">
        <a :href="props.link" class="px-5 py-2.5 rounded-md bg-gray-950 text-slate-200 border border-slate-200 shadow-md hover:-translate-y-0.5 hover:shadow-xl transition text-sm">
          <slot>{{ props.buttonText }}</slot>
        </a>
    </div>
</template>

<style scoped>
</style>