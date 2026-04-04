<script setup>
import { onMounted, computed } from 'vue'
import { NConfigProvider, darkTheme, zhCN, dateZhCN, NMessageProvider } from 'naive-ui'
import { useLocale } from '@renderer/locales/useLocales'
import { useTheme, useAuthStore, useTabsStore, useMenuStore } from '@renderer/stores'
import { useRouter } from 'vue-router'

const { locale } = useLocale()
const appTheme = useTheme()
const authStore = useAuthStore()
const router = useRouter()
const menuStore = useMenuStore()
const naiveUiTheme = computed(() => (appTheme.theme === 'dark' ? darkTheme : null))
const redirect = computed(() => useTabsStore().currentTab || 'dashboard')

const naiveLocale = computed(() => {
  return {
    locale: locale.value === 'zh_CN' ? zhCN : null,
    dataLocale: locale.value === 'zh_CN' ? dateZhCN : null
  }
})
onMounted(async () => {
  if (authStore.isLoggedIn) {
    await menuStore.initRoutes()
    const tabsStore = useTabsStore()
    const targetTab = tabsStore.tabs.find((t) => t.name === tabsStore.currentTab)
    if (targetTab) {
      router.push({
        name: targetTab.name,
        query: targetTab.query,
        params: targetTab.params
      })
    } else {
      router.push({ name: redirect.value })
    }
  }
})
</script>

<template>
  <NConfigProvider
    :locale="naiveLocale.locale"
    :date-locale="naiveLocale.dataLocale"
    :theme="naiveUiTheme"
    class="h-full"
  >
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </NConfigProvider>
</template>
