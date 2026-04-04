import { ref, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { useMenuStore } from './menu'
export const useTabsStore = defineStore(
  'tabs',
  () => {
    const menuStore = useMenuStore()
    const { isInitRoutes } = storeToRefs(menuStore)
    const tabs = ref([])
    const currentTab = ref('')

    const normalizeTab = (route, existingKey) => {
      const key =
        existingKey ||
        (route && route.name
          ? String(route.name)
          : route && route.path
            ? String(route.path)
            : '') ||
        String(Date.now())
      return {
        key,
        name: route?.name || '',
        path: route?.path || '',
        fullPath: route?.fullPath || '',
        meta: route?.meta || {},
        query: route?.query || {},
        params: route?.params || {}
      }
    }

    const addTab = (route) => {
      if (!route?.name) return
      const existing = tabs.value.find((item) => item.name === route.name)
      if (existing) {
        Object.assign(existing, normalizeTab(route, existing.key))
        return
      }
      tabs.value.push(normalizeTab(route))
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
      currentTab.value = typeof tab === 'string' ? tab : tab?.name || ''
    }
    watch(
      () => tabs.value.length,
      (len) => {
        if (len === 0) {
          currentTab.value = ''
          // 将路由跳转逻辑移出 store，交给组件层处理
          // router.push({ name: 'dashboard' })
        }
      }
    )

    // 移除对 currentTab 的 watch 监听和跳转逻辑
    // watch([currentTab, isInitRoutes, tabs], ([tab, isInit]) => {
    //   console.log({ currentTab: tab, isInit })
    //   if (!isInit || !tab) return
    //   const target = tabs.value.find((i) => i.name === tab)
    //   if (!target) {
    //     router.push({ name: tab })
    //     return
    //   }
    //   router.push({ name: target.name, query: target.query, params: target.params })
    // })
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
