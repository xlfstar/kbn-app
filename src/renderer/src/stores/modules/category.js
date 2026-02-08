import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { categoryApi } from '@renderer/api'
import { useLocale } from '@renderer/locales/useLocales'
import { arrayToTree } from '@renderer/utils'
export const useCategoryStore = defineStore('category', () => {
  const { locale } = useLocale()
  const allCategories = ref([])
  const loading = ref(false)

  const fetchAllCategories = async (query) => {
    loading.value = true
    try {
      const res = await categoryApi.getCategories({ ...query, page: 1, pageSize: 9999 })
      if (res.success) {
        const list = res.data.items || []
        allCategories.value = arrayToTree(list)
      }
      return res
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const setLoading = (val) => {
    loading.value = val
  }

  const convertCategoryTree = (nodes, currentLocale) => {
    if (!Array.isArray(nodes)) return []

    return nodes.map((node) => {
      const converted = {
        ...node,
        label: currentLocale === 'zh_CN' ? node.name : node.enName
      }

      if (node.children && Array.isArray(node.children)) {
        converted.children = convertCategoryTree(node.children, currentLocale)
      }

      return converted
    })
  }

  const categoriesTree = computed(() => convertCategoryTree(allCategories.value, locale.value))

  return {
    allCategories,
    fetchAllCategories,
    categoriesTree,
    loading,
    setLoading
  }
})
