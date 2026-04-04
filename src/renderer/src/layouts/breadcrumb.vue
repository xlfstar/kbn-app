<template>
  <div class="flex">
    <n-breadcrumb separator=">" class="py-2 bg-(--bg-text-color) flex-1">
      <n-breadcrumb-item v-for="(item, index) in list" :key="index" style="font-size: 12px">
        {{ item.meta.title[lang] }}
      </n-breadcrumb-item>
    </n-breadcrumb>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { NBreadcrumb, NBreadcrumbItem } from 'naive-ui'
import { computed } from 'vue'
import { useLocale } from '@renderer/locales/useLocales'
const route = useRoute()
const { locale } = useLocale()
const list = computed(() => route.matched)
const lang = computed(() => locale.value || 'zh_CN')
</script>
