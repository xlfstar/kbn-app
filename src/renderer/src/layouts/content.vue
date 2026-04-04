<template>
  <main class="content flex flex-col">
    <tabs />
    <!-- <breadcrumb /> -->
    <router-view class="flex-1 h-0"></router-view>
  </main>
</template>
<script setup>
import Tabs from './tabs.vue'
// import Breadcrumb from './breadcrumb.vue'
</script>
<style scoped>
.content {
  flex: 1;
  /* background-color: var(--bg-content-color); */
  border-radius: 6px;
  width: 0;
}
</style>
