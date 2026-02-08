import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { areaApi } from '@renderer/api'
import { useLocale } from '@renderer/locales/useLocales'

export const useAreaStore = defineStore('area', () => {
  const stateList = ref([])
  const { locale } = useLocale()
  const loading = ref(false)

  const fetchAllAreaList = async () => {
    loading.value = true
    try {
      const res = await areaApi.getAllAreas()
      if (res.success) {
        stateList.value = res.data.items || []

        loading.value = false
      }
    } catch (error) {
      console.log({ error })
    } finally {
      loading.value = false
    }
  }

  const setLoading = (val) => {
    loading.value = val
  }
  const convertAreaTree = (nodes, currentLocale) => {
    if (!Array.isArray(nodes)) return []
    const res = nodes.map((node) => {
      const converted = {
        ...node,
        label: currentLocale === 'zh_CN' ? node.name : node.enName
      }
      if (node.children && Array.isArray(node.children)) {
        converted.children = convertAreaTree(node.children, currentLocale)
      }

      return converted
    })

    return res
  }

  const areaTree = computed(() => convertAreaTree(stateList.value, locale.value))
  return {
    stateList,
    loading,
    areaTree,
    fetchAllAreaList,
    setLoading
  }
})
