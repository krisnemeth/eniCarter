<script setup lang="ts">
import HeaderSection from './components/HeaderSection.vue'
import WorkSection from './components/WorkSection.vue'
import AboutSection from './components/AboutSection.vue'
import ContactForm from './components/ContactForm.vue'
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <main class="flex flex-col justify-center items-center w-full bg-slate-300 text-gray-900 overflow-x-hidden">
    <Navbar />
    <div class="px-0 w-full">
      <HeaderSection />
      <WorkSection />
      <AboutSection />
      <ContactForm />
      <Footer/>
    </div>
    
  </main>
  
</template>

<style scoped>
</style>
