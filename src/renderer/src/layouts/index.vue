<template>
  <section class="flex flex-col h-full">
    <Header />
    <main id="pageMain" class="flex flex-row h-0 relative flex-1">
      <Aside />
      <Content />
      <login-modal></login-modal>
    </main>
  </section>
</template>

<script setup>
import Header from './header.vue'
import Aside from './aside.vue'
import Content from './content.vue'
import LoginModal from './login.vue'
import { useMessage } from 'naive-ui'
const message = useMessage()
window.$message = message
</script>
