import { ref, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useMenuStore } from './menu'
export const useTabsStore = defineStore(
  'tabs',
  () => {
    const router = useRouter()
    const menuStore = useMenuStore()
    const { isInitRoutes } = storeToRefs(menuStore)
    const tabs = ref([])
    const currentTab = ref('')

    const addTab = (tab) => {
      if (tabs.value.find((item) => item.name === tab.name)) {
        return
      }
      tabs.value.push(tab)
    }
    const removeTab = (tab) => {
      if (currentTab.value === tab.name) {
        const index = tabs.value.findIndex((item) => item.name === tab.name)
        if (index === 0) {
          if (tabs.value.length === 1) {
            currentTab.value = ''
          } else {
            currentTab.value = tabs.value[index + 1].name || ''
          }
        } else {
          currentTab.value = tabs.value[index - 1].name || ''
        }
      }
      tabs.value = tabs.value.filter((item) => item.name !== tab.name)
    }
    const setCurrentTab = (tab) => {
      currentTab.value = tab
    }
    watch(
      () => tabs.value.length,
      (len) => {
        if (len === 0) {
          currentTab.value = ''
          router.push({ name: 'dashboard' })
        }
      }
    )
    watch([currentTab, isInitRoutes], ([tab, isInit]) => {
      if (isInit && tab) {
        router.push({ name: tab })
      }
    })
    return {
      tabs,
      currentTab,
      addTab,
      setCurrentTab,
      removeTab
    }
  },
  {
    persist: true
  }
)
