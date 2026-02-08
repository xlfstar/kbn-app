<template>
  <div class="dashboard">
    <h1>欢迎来到看板</h1>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { t } from '@renderer/locales'
import { useAuthStore } from '@renderer/stores'
const authStore = useAuthStore()
onMounted(() => {})
</script>
<style scoped>
.dashboard {
  flex: 1;
}
</style>
