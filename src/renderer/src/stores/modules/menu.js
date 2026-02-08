import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@renderer/api/auth'
import { generateRoutes } from '@renderer/utils/permission'
import router, { staticRoutes } from '@renderer/router/index.js'

export const useMenuStore = defineStore(
  'menu',
  () => {
    const menuList = ref([...staticRoutes].filter((item) => !item.meta?.hide))
    const isInitRoutes = ref(false)
    const loading = ref(false)
    const error = ref('')

    const addDynamicRoutes = (menuData) => {
      const dynamicRoutes = generateRoutes(menuData)
      dynamicRoutes.forEach((route) => {
        router.addRoute(route)
      })
      return dynamicRoutes
    }

    const initRoutes = async () => {
      loading.value = true
      error.value = ''
      isInitRoutes.value = false
      try {
        const menuTree = await authApi.getMenuTree()
        const dynamicRoutes = addDynamicRoutes(menuTree.data || [])
        menuList.value = [...staticRoutes, ...dynamicRoutes].filter((item) => !item.meta?.hide)
        isInitRoutes.value = true
        return menuTree
      } catch (err) {
        error.value = err.message || '抱歉！服务器出错。'
        menuList.value = [...staticRoutes].filter((item) => !item.meta?.hide)
        throw err
      } finally {
        loading.value = false
      }
    }

    const reset = () => {
      menuList.value = [...staticRoutes].filter((item) => !item.meta?.hide)
      isInitRoutes.value = false
      error.value = ''
      loading.value = false
    }

    return {
      menuList,
      isInitRoutes,
      loading,
      error,
      initRoutes,
      reset
    }
  },
  {
    persist: false
  }
)
